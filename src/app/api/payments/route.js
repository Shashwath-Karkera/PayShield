import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { evaluateAnomalySignal } from '@/lib/security/ml';
import { evaluateRateLimit } from '@/lib/security/rateLimit';
import { encryptValue } from '@/lib/security/crypto';
import { requireSession } from '@/lib/auth/session';
import { verifyPayShieldPin } from '@/lib/security/verification';

const paymentSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive(),
  payee: z.string().min(2).max(100),
  locationCountry: z.string().min(2),
  locationCity: z.string().min(1),
  ipAddress: z.string().min(3),
  deviceDna: z.string().min(3),
  browserSignature: z.string().min(3),
  screenResolution: z.string().min(3),
  payShieldPin: z.string().min(4).max(12),
  mouseShakeIntensity: z.number().min(0).max(100),
  scrollSpeed: z.number().min(0),
  paymentFrequency: z.number().min(0),
  transferAllIntent: z.boolean().optional()
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const data = paymentSchema.parse(body);

    const auth = await requireSession(request, data.userId);
    if (!auth.ok) {
      return auth.response;
    }

    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      return Response.json({ error: 'User not found.' }, { status: 404 });
    }

    if (user.isFrozen) {
      return Response.json(
        { error: 'Account is frozen.', reason: user.frozenReason || 'Security lock.' },
        { status: 403 }
      );
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

    await prisma.securityEvent.create({
      data: {
        userId: user.id,
        type: 'PAYMENT_REQUEST',
        ipAddress: data.ipAddress,
        metadata: {
          amount: data.amount,
          payee: data.payee,
          deviceDna: data.deviceDna
        }
      }
    });

    const rateLimit = await evaluateRateLimit({
      userId: user.id,
      ipAddress: data.ipAddress
    });

    if (rateLimit.decision === 'BLOCK') {
      await prisma.securityEvent.create({
        data: {
          userId: user.id,
          type: 'PAYMENT_RATE_BLOCK',
          ipAddress: data.ipAddress,
          metadata: { recentRequests: rateLimit.count }
        }
      });

      return Response.json(
        {
          error: 'Too many rapid requests. Transactions are temporarily blocked.',
          action: 'BLOCK'
        },
        { status: 429 }
      );
    }

    if (rateLimit.decision === 'DELAY') {
      await wait(rateLimit.delayMs);
      await prisma.securityEvent.create({
        data: {
          userId: user.id,
          type: 'PAYMENT_RATE_DELAY',
          ipAddress: data.ipAddress,
          metadata: { delayMs: rateLimit.delayMs, recentRequests: rateLimit.count }
        }
      });
    }

    const encryptedPayload = encryptValue(
      JSON.stringify({
        amount: data.amount,
        payee: data.payee,
        locationCountry: data.locationCountry,
        locationCity: data.locationCity,
        ipAddress: data.ipAddress,
        deviceDna: data.deviceDna,
        browserSignature: data.browserSignature,
        screenResolution: data.screenResolution
      })
    );

    await prisma.behavioralLog.create({
      data: {
        userId: data.userId,
        mouseShakeIntensity: data.mouseShakeIntensity,
        scrollSpeed: data.scrollSpeed,
        paymentFrequency: data.paymentFrequency,
        transferAllIntent: Boolean(data.transferAllIntent),
        locationCountry: data.locationCountry,
        locationCity: data.locationCity,
        ipAddress: data.ipAddress,
        deviceDna: data.deviceDna,
        browserSignature: data.browserSignature,
        screenResolution: data.screenResolution
      }
    });

    const ml = evaluateAnomalySignal({
      user,
      amount: data.amount,
      locationCountry: data.locationCountry,
      deviceDna: data.deviceDna,
      mouseShakeIntensity: data.mouseShakeIntensity,
      transferAllIntent: data.transferAllIntent,
      paymentFrequency: data.paymentFrequency
    });

    if (ml.flagged) {
      const mirrorTxn = await prisma.transaction.create({
        data: {
          userId: data.userId,
          amount: data.amount,
          payee: data.payee,
          status: 'FLAGGED',
          ledgerType: 'MIRROR',
          locationCountry: data.locationCountry,
          locationCity: data.locationCity,
          ipAddress: data.ipAddress,
          deviceDna: data.deviceDna,
          browserSignature: data.browserSignature,
          screenResolution: data.screenResolution,
          encryptedPayload,
          mlScore: ml.score,
          mlReasons: ml.reasons,
          isTransferAllAttempt: Boolean(data.transferAllIntent)
        }
      });

      await prisma.securityEvent.create({
        data: {
          userId: data.userId,
          type: 'FLAGGED_PAYMENT',
          ipAddress: data.ipAddress,
          metadata: {
            transactionId: mirrorTxn.id,
            reasons: ml.reasons,
            slowMotionTrapMs: 30000
          }
        }
      });

      await wait(30000);

      return Response.json(
        {
          status: 'FLAGGED',
          message: 'Slow Motion Trap triggered. Redirecting to Mirror Maze.',
          redirectTo: '/mirror-maze',
          requiresChildhoodWhisper: true,
          mirrorTransactionId: mirrorTxn.id,
          ml
        },
        { status: 202 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const refreshedUser = await tx.user.findUnique({ where: { id: data.userId } });
      if (!refreshedUser) {
        throw new Error('User no longer exists.');
      }

      if (Number(refreshedUser.balance) < Number(data.amount)) {
        throw new Error('Insufficient balance.');
      }

      const transaction = await tx.transaction.create({
        data: {
          userId: data.userId,
          amount: data.amount,
          payee: data.payee,
          status: 'SUCCESS',
          ledgerType: 'REAL',
          locationCountry: data.locationCountry,
          locationCity: data.locationCity,
          ipAddress: data.ipAddress,
          deviceDna: data.deviceDna,
          browserSignature: data.browserSignature,
          screenResolution: data.screenResolution,
          encryptedPayload,
          mlScore: ml.score,
          mlReasons: ml.reasons,
          isTransferAllAttempt: Boolean(data.transferAllIntent)
        }
      });

      const updatedUser = await tx.user.update({
        where: { id: data.userId },
        data: {
          balance: Number(refreshedUser.balance) - Number(data.amount),
          lastKnownCountry: data.locationCountry,
          lastKnownCity: data.locationCity,
          lastKnownIp: data.ipAddress,
          lastKnownDeviceDna: data.deviceDna
        }
      });

      return { transaction, updatedUser };
    });

    return Response.json(
      {
        status: 'SUCCESS',
        transaction: result.transaction,
        remainingBalance: result.updatedUser.balance,
        ml
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Payment failed.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
