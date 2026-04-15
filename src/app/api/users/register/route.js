import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { encryptValue } from '@/lib/security/crypto';
import { createSpicePasswordHash } from '@/lib/security/password';
import { generateSessionToken } from '@/lib/security/device';
import { encryptOtp, generateOtpCode } from '@/lib/security/verification';
import { sendEmailOtp, sendSmsOtp } from '@/lib/notifications/otp';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80),
  phone: z.string().min(8).max(20),
  password: z.string().min(8),
  deviceDna: z.string().min(6),
  devicePublicKeyPem: z.string().min(32),
  browserSignature: z.string().min(3).optional(),
  screenResolution: z.string().min(3).optional(),
  locationCountry: z.string().min(2).optional(),
  locationCity: z.string().min(1).optional(),
  ipAddress: z.string().min(3).optional(),
  motherNickname: z.string().min(1),
  firstPetName: z.string().min(1),
  openingBalance: z.number().min(0).optional()
});

export async function POST(request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      return Response.json({ error: 'Email already registered.' }, { status: 409 });
    }

    const { passwordHash, spiceSalt } = await createSpicePasswordHash(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        passwordHash,
        spiceSalt,
        balance: data.openingBalance ?? 0,
        childhoodWhisperMotherEnc: encryptValue(data.motherNickname.trim().toLowerCase()),
        childhoodWhisperPetEnc: encryptValue(data.firstPetName.trim().toLowerCase()),
        lastKnownCountry: data.locationCountry,
        lastKnownCity: data.locationCity,
        lastKnownIp: data.ipAddress,
        lastKnownDeviceDna: data.deviceDna,
        deviceCredentials: {
          create: {
            deviceDna: data.deviceDna,
            publicKeyPem: data.devicePublicKeyPem,
            browserSignature: data.browserSignature,
            screenResolution: data.screenResolution,
            lastSeenIp: data.ipAddress,
            lastSeenCountry: data.locationCountry,
            lastSeenCity: data.locationCity,
            lastUsedAt: new Date()
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        balance: true,
        createdAt: true,
        deviceCredentials: {
          select: {
            id: true,
            deviceDna: true,
            trusted: true
          },
          take: 1
        }
      }
    });

    const sessionToken = generateSessionToken();
    const session = await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.id,
        deviceCredentialId: user.deviceCredentials[0]?.id,
        ipAddress: data.ipAddress,
        locationCountry: data.locationCountry,
        locationCity: data.locationCity,
        isVerified: false,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000)
      }
    });

    const emailOtp = generateOtpCode();
    const smsOtp = generateOtpCode();
    const verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const [emailResult, smsResult] = await Promise.all([
      sendEmailOtp({ toEmail: user.email, otpCode: emailOtp }),
      sendSmsOtp({ toPhone: user.phone, toEmail: user.email, otpCode: smsOtp })
    ]);

    const verification = await prisma.authVerification.create({
      data: {
        userId: user.id,
        sessionId: session.id,
        emailOtpEnc: encryptOtp(emailOtp),
        smsOtpEnc: encryptOtp(smsOtp),
        ipAddress: data.ipAddress || 'unknown',
        deviceDna: data.deviceDna,
        locationCountry: data.locationCountry,
        locationCity: data.locationCity,
        riskScore: 0,
        riskReasons: ['New registration verification'],
        expiresAt: verificationExpiresAt
      },
      select: {
        id: true,
        expiresAt: true,
        riskScore: true,
        riskReasons: true
      }
    });

    await prisma.securityEvent.create({
      data: {
        userId: user.id,
        type: 'OTP_DISPATCH',
        ipAddress: data.ipAddress,
        metadata: {
          source: 'registration',
          emailResult,
          smsResult
        }
      }
    });

    return Response.json(
      {
        user,
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
        }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Failed to register user.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
