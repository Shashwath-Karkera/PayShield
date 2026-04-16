import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import { verifyPayShieldPin } from '@/lib/security/verification';
import { encryptValue } from '@/lib/security/crypto';

const schema = z.object({
  userId: z.string().min(1),
  payShieldPin: z.string().min(4).max(12),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(10),
  amount: z.number().positive(),
  payee: z.string().min(2).max(100)
});

function getSecret() {
  const secret =
    process.env.PAYSHIELD_RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error(
      'PAYSHIELD_RAZORPAY_KEY_SECRET (or legacy RAZORPAY_KEY_SECRET) is required.'
    );
  }

  return secret;
}

export async function POST(request) {
  try {
    const data = schema.parse(await request.json());

    const auth = await requireSession(request, data.userId);
    if (!auth.ok) {
      return auth.response;
    }

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { payShieldPinHash: true }
    });

    if (!user) {
      return Response.json({ error: 'User not found.' }, { status: 404 });
    }

    if (!user.payShieldPinHash) {
      return Response.json(
        { error: 'PayShield PIN is not configured. Complete verification setup first.' },
        { status: 403 }
      );
    }

    const pinOk = await verifyPayShieldPin(data.payShieldPin, user.payShieldPinHash);
    if (!pinOk) {
      return Response.json({ error: 'Invalid PayShield PIN.' }, { status: 401 });
    }

    const generated = crypto
      .createHmac('sha256', getSecret())
      .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
      .digest('hex');

    const verified = generated === data.razorpaySignature;

    await prisma.securityEvent.create({
      data: {
        userId: data.userId,
        type: verified ? 'RAZORPAY_SIGNATURE_VERIFIED' : 'RAZORPAY_SIGNATURE_FAILED',
        metadata: {
          razorpayOrderId: data.razorpayOrderId,
          razorpayPaymentId: data.razorpayPaymentId
        }
      }
    });

    if (!verified) {
      return Response.json({ verified: false, error: 'Invalid Razorpay signature.' }, { status: 400 });
    }

    const existingCapture = await prisma.securityEvent.findFirst({
      where: {
        userId: data.userId,
        type: 'RAZORPAY_PAYMENT_CAPTURED',
        metadata: {
          path: ['razorpayPaymentId'],
          equals: data.razorpayPaymentId
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (existingCapture) {
      return Response.json(
        {
          verified: true,
          duplicate: true,
          message: 'Payment already captured in ledger.'
        },
        { status: 200 }
      );
    }

    const encryptedPayload = encryptValue(
      JSON.stringify({
        source: 'razorpay',
        razorpayOrderId: data.razorpayOrderId,
        razorpayPaymentId: data.razorpayPaymentId,
        amount: data.amount,
        payee: data.payee
      })
    );

    const result = await prisma.$transaction(async (tx) => {
      const currentUser = await tx.user.findUnique({
        where: { id: data.userId },
        select: { id: true, balance: true }
      });

      if (!currentUser) {
        throw new Error('User not found.');
      }

      if (Number(currentUser.balance) < Number(data.amount)) {
        throw new Error('Insufficient balance.');
      }

      const transaction = await tx.transaction.create({
        data: {
          userId: data.userId,
          amount: data.amount,
          payee: data.payee,
          status: 'SUCCESS',
          ledgerType: 'REAL',
          encryptedPayload
        }
      });

      const updatedUser = await tx.user.update({
        where: { id: data.userId },
        data: {
          balance: Number(currentUser.balance) - Number(data.amount)
        }
      });

      await tx.securityEvent.create({
        data: {
          userId: data.userId,
          type: 'RAZORPAY_PAYMENT_CAPTURED',
          metadata: {
            razorpayOrderId: data.razorpayOrderId,
            razorpayPaymentId: data.razorpayPaymentId,
            transactionId: transaction.id,
            amount: data.amount,
            payee: data.payee
          }
        }
      });

      return { transaction, updatedUser };
    });

    return Response.json(
      {
        verified: true,
        status: 'SUCCESS',
        transaction: result.transaction,
        remainingBalance: result.updatedUser.balance
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Unable to verify Razorpay signature.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
