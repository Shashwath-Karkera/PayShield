import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { calculateRisk } from '@/lib/behavior/riskCalculator';
import { createSpicePasswordHash } from '@/lib/security/password';
import { encryptValue } from '@/lib/security/crypto';
import { generateOtpCode } from '@/lib/security/verification';
import { generateSessionToken } from '@/lib/security/device';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(20),
  password: z.string().min(8).max(128),
  motherNickname: z.string().min(1).max(120),
  firstPetName: z.string().min(1).max(120),
  deviceDna: z.string().min(6),
  devicePublicKeyPem: z.string().min(50).optional(),
  ipAddress: z.string().min(3).optional(),
  locationCountry: z.string().min(2).optional(),
  locationCity: z.string().min(1).optional(),
  browserSignature: z.string().min(3).optional(),
  screenResolution: z.string().min(3).optional(),
  behaviorData: z.any().optional(),
  openingBalance: z.number().nonnegative().optional()
});

export async function POST(request) {
  try {
    const data = schema.parse(await request.json());
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedPhone = data.phone.trim();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { phone: normalizedPhone }]
      },
      select: { id: true }
    });

    if (existing) {
      return Response.json({ error: 'Email or phone already registered.' }, { status: 409 });
    }

    const behaviorAnalysis = data.behaviorData ? calculateRisk(data.behaviorData) : null;
    if (behaviorAnalysis?.action === 'block') {
      return Response.json(
        {
          error: 'Registration blocked due to suspicious behavior.',
          reasons: behaviorAnalysis.messages,
          risk: behaviorAnalysis
        },
        { status: 403 }
      );
    }

    const { passwordHash, spiceSalt } = await createSpicePasswordHash(data.password);
    const now = Date.now();
    const expiresAt = new Date(now + 10 * 60 * 1000);
    const sessionToken = generateSessionToken();

    const emailOtp = generateOtpCode();
    const smsOtp = generateOtpCode();

    const riskScore = behaviorAnalysis ? Number((behaviorAnalysis.score / 100).toFixed(3)) : 0;
    const riskReasons = behaviorAnalysis?.messages?.length
      ? behaviorAnalysis.messages
      : ['New registration verification'];

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: data.name.trim(),
        phone: normalizedPhone,
        passwordHash,
        spiceSalt,
        balance: data.openingBalance ?? 0,
        childhoodWhisperMotherEnc: encryptValue(data.motherNickname.trim().toLowerCase()),
        childhoodWhisperPetEnc: encryptValue(data.firstPetName.trim().toLowerCase()),
        lastKnownIp: data.ipAddress,
        lastKnownCountry: data.locationCountry,
        lastKnownCity: data.locationCity,
        lastKnownDeviceDna: data.deviceDna
      }
    });

    if (data.devicePublicKeyPem) {
      await prisma.deviceCredential.create({
        data: {
          userId: user.id,
          deviceDna: data.deviceDna,
          publicKeyPem: data.devicePublicKeyPem,
          browserSignature: data.browserSignature,
          screenResolution: data.screenResolution,
          lastSeenIp: data.ipAddress,
          lastSeenCountry: data.locationCountry,
          lastSeenCity: data.locationCity,
          trusted: true,
          deviceName: 'Primary Browser'
        }
      });
    }

    const session = await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.id,
        ipAddress: data.ipAddress,
        locationCountry: data.locationCountry,
        locationCity: data.locationCity,
        isVerified: false,
        expiresAt: new Date(now + 12 * 60 * 60 * 1000)
      }
    });

    const verification = await prisma.authVerification.create({
      data: {
        userId: user.id,
        sessionId: session.id,
        emailOtpEnc: emailOtp,
        smsOtpEnc: smsOtp,
        ipAddress: data.ipAddress || '0.0.0.0',
        deviceDna: data.deviceDna,
        locationCountry: data.locationCountry,
        locationCity: data.locationCity,
        riskScore,
        riskReasons,
        expiresAt
      }
    });

    await prisma.$transaction([
      prisma.otpCode.deleteMany({
        where: {
          identifier: user.email,
          type: 'email'
        }
      }),
      prisma.otpCode.deleteMany({
        where: {
          identifier: normalizedPhone,
          type: 'phone'
        }
      }),
      prisma.otpCode.create({
        data: {
          userId: user.id,
          identifier: user.email,
          type: 'email',
          otpEnc: emailOtp,
          expiresAt
        }
      }),
      prisma.otpCode.create({
        data: {
          userId: user.id,
          identifier: normalizedPhone,
          type: 'phone',
          otpEnc: smsOtp,
          expiresAt
        }
      })
    ]);

    await prisma.securityEvent.create({
      data: {
        userId: user.id,
        type: 'REGISTER_INITIATED',
        ipAddress: data.ipAddress,
        metadata: {
          locationCountry: data.locationCountry,
          locationCity: data.locationCity,
          deviceDna: data.deviceDna,
          riskScore,
          riskReasons
        }
      }
    });

    if (data.behaviorData) {
      await prisma.behavioralLog.create({
        data: {
          userId: user.id,
          mouseShakeIntensity: Number(data.behaviorData.mouseShakeIntensity || 0),
          scrollSpeed: Number(data.behaviorData.scrollSpeed || 0),
          paymentFrequency: Number(data.behaviorData.paymentFrequency || 0),
          transferAllIntent: Boolean(data.behaviorData.transferAllIntent),
          locationCountry: data.locationCountry,
          locationCity: data.locationCity,
          ipAddress: data.ipAddress,
          deviceDna: data.deviceDna,
          browserSignature: data.browserSignature,
          screenResolution: data.screenResolution
        }
      });
    }

    const [{ sendVerificationEmail }, { sendVerificationSMS }] = await Promise.all([
      import('@/lib/services/emailService'),
      import('@/lib/services/smsService')
    ]);

    const emailResult = await sendVerificationEmail(normalizedEmail, emailOtp, user.name);
    if (!emailResult?.success) {
      throw new Error(emailResult?.error || 'Failed to send registration email OTP.');
    }

    const smsResult = await sendVerificationSMS(normalizedPhone, smsOtp);
    if (!smsResult?.success) {
      throw new Error(smsResult?.error || 'Failed to send registration SMS OTP.');
    }

    return Response.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          balance: user.balance,
          createdAt: user.createdAt
        },
        sessionToken,
        verificationRequired: true,
        verification: {
          id: verification.id,
          requiresBothOtps: true,
          requiredFactors: ['EMAIL_OTP', 'SMS_OTP'],
          riskScore,
          riskReasons,
          expiresAt,
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
      {
        error: 'Failed to register user.',
        detail: String(error.message || error)
      },
      { status: 500 }
    );
  }
}