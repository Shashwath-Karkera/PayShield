import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyChallengeSignature, generateSessionToken } from '@/lib/security/device';
import { encryptOtp, generateOtpCode } from '@/lib/security/verification';
import { sendEmailOtp, sendSmsOtp } from '@/lib/notifications/otp';

const schema = z.object({
  challengeId: z.string().min(1),
  signature: z.string().min(16),
  ipAddress: z.string().min(3),
  locationCountry: z.string().min(2).optional(),
  locationCity: z.string().min(1).optional(),
  browserSignature: z.string().min(3).optional(),
  screenResolution: z.string().min(3).optional(),
  deviceDna: z.string().min(6),
  devicePublicKeyPem: z.string().min(32).optional(),
  trustedDeviceName: z.string().min(2).max(80).optional()
});

export async function POST(request) {
  try {
    const payload = schema.parse(await request.json());

    const challenge = await prisma.loginChallenge.findUnique({
      where: { id: payload.challengeId },
      include: { user: true, deviceCredential: true }
    });

    if (!challenge) {
      return Response.json({ error: 'Challenge not found.' }, { status: 404 });
    }

    if (challenge.consumedAt) {
      return Response.json({ error: 'Challenge already consumed.' }, { status: 409 });
    }

    if (new Date(challenge.expiresAt).getTime() < Date.now()) {
      return Response.json({ error: 'Challenge expired.' }, { status: 410 });
    }

    let deviceCredential = challenge.deviceCredential;

    if (!deviceCredential && payload.devicePublicKeyPem) {
      deviceCredential = await prisma.deviceCredential.create({
        data: {
          userId: challenge.userId,
          deviceDna: payload.deviceDna,
          deviceName: payload.trustedDeviceName,
          publicKeyPem: payload.devicePublicKeyPem,
          browserSignature: payload.browserSignature,
          screenResolution: payload.screenResolution,
          lastSeenIp: payload.ipAddress,
          lastSeenCountry: payload.locationCountry,
          lastSeenCity: payload.locationCity,
          lastUsedAt: new Date()
        }
      });
    }

    if (!deviceCredential?.publicKeyPem) {
      return Response.json(
        {
          error: 'Device key not registered. Please login from a previously trusted device or complete device setup.'
        },
        { status: 412 }
      );
    }

    const valid = verifyChallengeSignature({
      challenge: challenge.challenge,
      signatureBase64: payload.signature,
      publicKeyPem: deviceCredential.publicKeyPem
    });

    if (!valid) {
      await prisma.securityEvent.create({
        data: {
          userId: challenge.userId,
          type: 'LOGIN_SIGNATURE_FAILED',
          ipAddress: payload.ipAddress,
          metadata: { challengeId: challenge.id }
        }
      });

      return Response.json({ error: 'Signature verification failed.' }, { status: 401 });
    }

    const sessionToken = generateSessionToken();
    const session = await prisma.session.create({
      data: {
        token: sessionToken,
        userId: challenge.userId,
        deviceCredentialId: deviceCredential.id,
        ipAddress: payload.ipAddress,
        locationCountry: payload.locationCountry,
        locationCity: payload.locationCity,
        isVerified: false,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000)
      }
    });

    const emailOtp = generateOtpCode();
    const smsOtp = generateOtpCode();
    const verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const [emailResult, smsResult] = await Promise.all([
      sendEmailOtp({ toEmail: challenge.user.email, otpCode: emailOtp }),
      sendSmsOtp({ toEmail: challenge.user.email, otpCode: smsOtp })
    ]);

    await prisma.$transaction([
      prisma.loginChallenge.update({
        where: { id: challenge.id },
        data: { consumedAt: new Date(), deviceCredentialId: deviceCredential.id }
      }),
      prisma.user.update({
        where: { id: challenge.userId },
        data: {
          lastLoginAt: new Date(),
          lastKnownIp: payload.ipAddress,
          lastKnownCountry: payload.locationCountry,
          lastKnownCity: payload.locationCity,
          lastKnownDeviceDna: payload.deviceDna
        }
      }),
      prisma.deviceCredential.update({
        where: { id: deviceCredential.id },
        data: {
          trusted: true,
          deviceName: payload.trustedDeviceName || deviceCredential.deviceName,
          browserSignature: payload.browserSignature || deviceCredential.browserSignature,
          screenResolution: payload.screenResolution || deviceCredential.screenResolution,
          lastSeenIp: payload.ipAddress,
          lastSeenCountry: payload.locationCountry,
          lastSeenCity: payload.locationCity,
          lastUsedAt: new Date()
        }
      }),
      prisma.securityEvent.create({
        data: {
          userId: challenge.userId,
          type: 'LOGIN_CHALLENGE_VERIFIED',
          ipAddress: payload.ipAddress,
          metadata: {
            challengeId: challenge.id,
            riskScore: challenge.riskScore,
            locationCountry: payload.locationCountry,
            locationCity: payload.locationCity
          }
        }
      }),
      prisma.securityEvent.create({
        data: {
          userId: challenge.userId,
          type: 'OTP_DISPATCH',
          ipAddress: payload.ipAddress,
          metadata: {
            emailResult,
            smsResult
          }
        }
      }),
      prisma.authVerification.create({
        data: {
          userId: challenge.userId,
          sessionId: session.id,
          emailOtpEnc: encryptOtp(emailOtp),
          smsOtpEnc: encryptOtp(smsOtp),
          ipAddress: payload.ipAddress,
          deviceDna: payload.deviceDna,
          locationCountry: payload.locationCountry,
          locationCity: payload.locationCity,
          riskScore: challenge.riskScore,
          riskReasons: challenge.riskReasons,
          expiresAt: verificationExpiresAt
        }
      })
    ]);

    const verification = await prisma.authVerification.findUnique({
      where: { sessionId: session.id },
      select: { id: true, riskScore: true, riskReasons: true, expiresAt: true }
    });

    return Response.json(
      {
        ok: true,
        sessionToken: session.token,
        sessionExpiresAt: session.expiresAt,
        verificationRequired: true,
        verification: {
          id: verification.id,
          riskScore: verification.riskScore,
          riskReasons: verification.riskReasons,
          expiresAt: verification.expiresAt,
          devEmailOtp: process.env.NODE_ENV === 'production' ? undefined : emailOtp,
          devSmsOtp: process.env.NODE_ENV === 'production' ? undefined : smsOtp
        },
        user: {
          id: challenge.user.id,
          name: challenge.user.name,
          email: challenge.user.email,
          balance: challenge.user.balance,
          isFrozen: challenge.user.isFrozen
        }
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Challenge verification failed.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
