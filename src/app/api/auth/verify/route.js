import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import {
  hashPayShieldPin,
  matchesOtp,
  verifyPayShieldPin
} from '@/lib/security/verification';

const completeSchema = z
  .object({
    verificationId: z.string().min(1),
    emailOtp: z.string().length(6),
    smsOtp: z.string().length(6),
    simSlot: z.enum(['SIM1', 'SIM2']),
    payShieldPin: z.string().min(4).max(12),
    confirmPayShieldPin: z.string().min(4).max(12).optional(),
    ipAddress: z.string().min(3),
    deviceDna: z.string().min(6),
    locationCountry: z.string().min(2).optional(),
    locationCity: z.string().min(1).optional()
  })
  .refine((value) => {
    if (value.confirmPayShieldPin && value.confirmPayShieldPin !== value.payShieldPin) {
      return false;
    }

    return true;
  }, 'PIN confirmation does not match.');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const verificationId = searchParams.get('verificationId');

    if (!verificationId) {
      return Response.json({ error: 'verificationId is required.' }, { status: 400 });
    }

    const verification = await prisma.authVerification.findUnique({
      where: { id: verificationId },
      include: { user: true, session: true }
    });

    if (!verification) {
      return Response.json({ error: 'Verification session not found.' }, { status: 404 });
    }

    const auth = await requireSession(request, verification.userId, { requireVerified: false });
    if (!auth.ok) {
      return auth.response;
    }

    if (auth.session.id !== verification.sessionId) {
      return Response.json({ error: 'Verification session does not match current login.' }, { status: 403 });
    }

    return Response.json(
      {
        verification: {
          id: verification.id,
          riskScore: verification.riskScore,
          riskReasons: verification.riskReasons,
          ipAddress: verification.ipAddress,
          locationCountry: verification.locationCountry,
          locationCity: verification.locationCity,
          expectedSimSlot: verification.user.registeredSimSlot,
          needsPinSetup: !verification.user.payShieldPinHash,
          expiresAt: verification.expiresAt
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: 'Unable to load verification session.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = completeSchema.parse(await request.json());

    const verification = await prisma.authVerification.findUnique({
      where: { id: data.verificationId },
      include: { user: true, session: true }
    });

    if (!verification) {
      return Response.json({ error: 'Verification session not found.' }, { status: 404 });
    }

    const auth = await requireSession(request, verification.userId, { requireVerified: false });
    if (!auth.ok) {
      return auth.response;
    }

    if (auth.session.id !== verification.sessionId) {
      return Response.json({ error: 'Verification session mismatch.' }, { status: 403 });
    }

    if (verification.completedAt) {
      return Response.json({ error: 'Verification has already been completed.' }, { status: 409 });
    }

    if (new Date(verification.expiresAt).getTime() < Date.now()) {
      return Response.json({ error: 'Verification window expired. Please sign in again.' }, { status: 410 });
    }

    const emailOtpOk = matchesOtp(data.emailOtp, verification.emailOtpEnc);
    const smsOtpOk = matchesOtp(data.smsOtp, verification.smsOtpEnc);

    if (!emailOtpOk || !smsOtpOk) {
      return Response.json({ error: 'OTP verification failed.' }, { status: 401 });
    }

    if (data.simSlot !== verification.user.registeredSimSlot) {
      await prisma.securityEvent.create({
        data: {
          userId: verification.userId,
          type: 'SIM_SLOT_MISMATCH',
          ipAddress: data.ipAddress,
          metadata: {
            expected: verification.user.registeredSimSlot,
            received: data.simSlot
          }
        }
      });

      return Response.json(
        {
          error: `Please use the same SIM registered to the account (${verification.user.registeredSimSlot}).`
        },
        { status: 403 }
      );
    }

    const suspiciousReasons = [];

    if (verification.ipAddress !== data.ipAddress) {
      suspiciousReasons.push('IP mismatch from login challenge session.');
    }

    if (verification.deviceDna !== data.deviceDna) {
      suspiciousReasons.push('Device fingerprint mismatch from login session.');
    }

    if (verification.riskScore >= 0.8) {
      suspiciousReasons.push('High geo-risk score detected.');
    }

    if (suspiciousReasons.length > 0) {
      await prisma.securityEvent.create({
        data: {
          userId: verification.userId,
          type: 'DEVICE_VERIFICATION_FAILED',
          ipAddress: data.ipAddress,
          metadata: { suspiciousReasons }
        }
      });

      return Response.json(
        {
          error: 'Suspicious activity detected during device verification.',
          reasons: suspiciousReasons
        },
        { status: 403 }
      );
    }

    let pinHash = verification.user.payShieldPinHash;

    if (!pinHash && !data.confirmPayShieldPin) {
      return Response.json({ error: 'Please confirm your new PayShield PIN.' }, { status: 400 });
    }

    if (pinHash) {
      const pinOk = await verifyPayShieldPin(data.payShieldPin, pinHash);
      if (!pinOk) {
        return Response.json({ error: 'PayShield PIN verification failed.' }, { status: 401 });
      }
    } else {
      pinHash = await hashPayShieldPin(data.payShieldPin);
    }

    const now = new Date();
    await prisma.$transaction([
      prisma.authVerification.update({
        where: { id: verification.id },
        data: {
          emailOtpVerifiedAt: now,
          smsOtpVerifiedAt: now,
          deviceVerifiedAt: now,
          simVerifiedAt: now,
          payShieldPinVerifiedAt: now,
          completedAt: now
        }
      }),
      prisma.session.update({
        where: { id: verification.sessionId },
        data: { isVerified: true }
      }),
      prisma.user.update({
        where: { id: verification.userId },
        data: {
          payShieldPinHash: pinHash,
          firstLoginCompleted: true,
          lastKnownIp: data.ipAddress,
          lastKnownDeviceDna: data.deviceDna,
          lastKnownCountry: data.locationCountry,
          lastKnownCity: data.locationCity
        }
      }),
      prisma.securityEvent.create({
        data: {
          userId: verification.userId,
          type: 'LOGIN_SUCCESS',
          ipAddress: data.ipAddress,
          metadata: {
            verificationId: verification.id,
            simSlot: data.simSlot,
            riskScore: verification.riskScore
          }
        }
      })
    ]);

    return Response.json(
      {
        verified: true,
        requiresBankOnboarding: !verification.user.bankOnboardingCompleted,
        redirectTo: verification.user.bankOnboardingCompleted ? '/payment' : '/bank-credentials'
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Failed to complete verification.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
