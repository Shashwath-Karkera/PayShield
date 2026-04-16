import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { calculateRisk } from '@/lib/behavior/riskCalculator';
import { verifySpicePassword } from '@/lib/security/password';
import { encryptOtp, generateOtpCode } from '@/lib/security/verification';
import { generateSessionToken } from '@/lib/security/device';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  deviceDna: z.string().min(6),
  ipAddress: z.string().min(3).optional(),
  locationCountry: z.string().min(2).optional(),
  locationCity: z.string().min(1).optional(),
  browserSignature: z.string().min(3).optional(),
  screenResolution: z.string().min(3).optional(),
  behaviorData: z.any().optional()
});

export async function POST(request) {
  try {
    const data = loginSchema.parse(await request.json());
    const email = data.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const passwordOk = await verifySpicePassword(data.password, user.spiceSalt, user.passwordHash);
    if (!passwordOk) {
      return Response.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    let riskAnalysis = {
      score: 0,
      riskLevel: 'LOW',
      action: 'allow',
      triggeredRules: [],
      messages: []
    };

    if (data.behaviorData) {
      riskAnalysis = calculateRisk(data.behaviorData);
    }

    if (riskAnalysis.action === 'block') {
      await prisma.securityEvent.create({
        data: {
          userId: user.id,
          type: 'LOGIN_BLOCKED_BEHAVIOR',
          ipAddress: data.ipAddress,
          metadata: {
            riskScore: riskAnalysis.score,
            riskReasons: riskAnalysis.messages,
            triggeredRules: riskAnalysis.triggeredRules
          }
        }
      });

      return Response.json(
        {
          error: 'Security systems triggered. Access denied.',
          messages: riskAnalysis.messages
        },
        { status: 403 }
      );
    }

    const riskReasons = [...riskAnalysis.messages];

    if (
      user.lastKnownDeviceDna &&
      data.deviceDna &&
      user.lastKnownDeviceDna !== data.deviceDna
    ) {
      riskReasons.push('Device mismatch detected from last known trusted device.');
    }

    if (
      user.lastKnownCountry &&
      data.locationCountry &&
      user.lastKnownCountry.toLowerCase() !== data.locationCountry.toLowerCase()
    ) {
      riskReasons.push('Geo mismatch detected from last known login country.');
    }

    const normalizedRiskScore = Math.min(
      0.99,
      Number((riskAnalysis.score / 100 + riskReasons.length * 0.05).toFixed(3))
    );

    const sessionToken = generateSessionToken();
    const now = Date.now();
    const expiresAt = new Date(now + 10 * 60 * 1000);
    const emailOtp = generateOtpCode();
    const smsOtp = generateOtpCode();

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
        emailOtpEnc: encryptOtp(emailOtp),
        smsOtpEnc: encryptOtp(smsOtp),
        ipAddress: data.ipAddress || '0.0.0.0',
        deviceDna: data.deviceDna,
        locationCountry: data.locationCountry,
        locationCity: data.locationCity,
        riskScore: normalizedRiskScore,
        riskReasons,
        expiresAt
      }
    });

    const otpWrites = [
      prisma.otpCode.deleteMany({
        where: {
          identifier: user.email,
          type: 'email'
        }
      }),
      prisma.otpCode.create({
        data: {
          userId: user.id,
          identifier: user.email,
          type: 'email',
          otpEnc: encryptOtp(emailOtp),
          expiresAt
        }
      })
    ];

    if (user.phone) {
      otpWrites.push(
        prisma.otpCode.deleteMany({
          where: {
            identifier: user.phone,
            type: 'phone'
          }
        }),
        prisma.otpCode.create({
          data: {
            userId: user.id,
            identifier: user.phone,
            type: 'phone',
            otpEnc: encryptOtp(smsOtp),
            expiresAt
          }
        })
      );
    }

    await prisma.$transaction(otpWrites);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastKnownIp: data.ipAddress,
        lastKnownDeviceDna: data.deviceDna,
        lastKnownCountry: data.locationCountry,
        lastKnownCity: data.locationCity
      }
    });

    await prisma.securityEvent.create({
      data: {
        userId: user.id,
        type: 'LOGIN_CHALLENGE_ISSUED',
        ipAddress: data.ipAddress,
        metadata: {
          verificationId: verification.id,
          riskScore: normalizedRiskScore,
          riskReasons,
          triggeredRules: riskAnalysis.triggeredRules
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

    try {
      const [{ sendVerificationEmail }, { sendVerificationSMS }] = await Promise.all([
        import('@/lib/services/emailService'),
        import('@/lib/services/smsService')
      ]);

      await sendVerificationEmail(user.email, emailOtp, user.name);
      if (user.phone) {
        await sendVerificationSMS(user.phone, smsOtp);
      }
    } catch {
      // Keep response successful in local/dev environments.
    }

    return Response.json(
      {
        success: true,
        requiresAdditionalVerification: true,
        sessionToken,
        verification: {
          id: verification.id,
          riskScore: normalizedRiskScore,
          riskReasons,
          expiresAt,
          devEmailOtp: process.env.NODE_ENV === 'production' ? undefined : emailOtp,
          devSmsOtp: process.env.NODE_ENV === 'production' ? undefined : smsOtp
        },
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          balance: user.balance
        }
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Login failed.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
