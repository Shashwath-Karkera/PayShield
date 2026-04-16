import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { encryptValue, decryptValue } from '@/lib/security/crypto';
import { requireSession } from '@/lib/auth/session';
import { matchesOtp } from '@/lib/security/verification';

const createSchema = z.object({
  userId: z.string().min(1),
  bankName: z.string().min(2),
  accountHolderName: z.string().min(2),
  accountNumber: z.string().min(8),
  ifsc: z.string().min(4),
  upiId: z.string().min(3),
  emailOtp: z.string().length(6),
  smsOtp: z.string().length(6)
});

export async function POST(request) {
  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const auth = await requireSession(request, data.userId);
    if (!auth.ok) {
      return auth.response;
    }

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        bankOnboardingCompleted: true
      }
    });

    if (!user) {
      return Response.json({ error: 'User not found.' }, { status: 404 });
    }

    if (!user.email || !user.phone) {
      return Response.json(
        { error: 'Email and phone are required for OTP verification.' },
        { status: 400 }
      );
    }

    if (user.bankOnboardingCompleted) {
      return Response.json(
        { error: 'Bank setup is already completed.' },
        { status: 409 }
      );
    }

    const [emailOtpRecord, smsOtpRecord] = await Promise.all([
      prisma.otpCode.findFirst({
        where: {
          userId: user.id,
          identifier: user.email,
          type: 'bank_setup_email',
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.otpCode.findFirst({
        where: {
          userId: user.id,
          identifier: user.phone,
          type: 'bank_setup_phone',
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    if (!emailOtpRecord || !smsOtpRecord) {
      return Response.json(
        { error: 'OTP challenge not found or expired. Please resend OTP.' },
        { status: 400 }
      );
    }

    const emailOtpOk = matchesOtp(data.emailOtp, emailOtpRecord.otpEnc);
    const smsOtpOk = matchesOtp(data.smsOtp, smsOtpRecord.otpEnc);

    if (!emailOtpOk || !smsOtpOk) {
      return Response.json(
        { error: 'Invalid OTP. Please verify both email and SMS OTP.' },
        { status: 401 }
      );
    }

    const payload = encryptValue(
      JSON.stringify({
        accountNumber: data.accountNumber,
        ifsc: data.ifsc,
        upiId: data.upiId
      })
    );

    const saved = await prisma.$transaction(async (tx) => {
      const created = await tx.bankCredential.create({
        data: {
          userId: data.userId,
          bankName: data.bankName,
          accountHolderName: data.accountHolderName,
          encryptedPayload: payload
        }
      });

      await tx.user.update({
        where: { id: data.userId },
        data: { bankOnboardingCompleted: true }
      });

      await tx.otpCode.deleteMany({
        where: {
          userId: user.id,
          type: {
            in: ['bank_setup_email', 'bank_setup_phone']
          }
        }
      });

      return created;
    });

    return Response.json(
      {
        id: saved.id,
        userId: saved.userId,
        bankName: saved.bankName,
        accountHolderName: saved.accountHolderName,
        createdAt: saved.createdAt
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Failed to store bank credentials.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'userId is required.' }, { status: 400 });
    }

    const auth = await requireSession(request, userId);
    if (!auth.ok) {
      return auth.response;
    }

    const records = await prisma.bankCredential.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const masked = records.map((record) => {
      const securePayload = JSON.parse(decryptValue(record.encryptedPayload));
      const accountNumber = String(securePayload.accountNumber || '');
      const suffix = accountNumber.slice(-4);
      const maskedAccount = suffix ? `XXXXXX${suffix}` : 'XXXXXX';

      return {
        id: record.id,
        bankName: record.bankName,
        accountHolderName: record.accountHolderName,
        accountNumberMasked: maskedAccount,
        ifsc: securePayload.ifsc,
        upiId: securePayload.upiId,
        createdAt: record.createdAt
      };
    });

    return Response.json({ records: masked }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch bank credentials.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
