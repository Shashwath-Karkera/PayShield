<<<<<<< HEAD
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifySpicePassword } from '@/lib/security/password';
import { evaluateGeoRisk } from '@/lib/security/risk';
import { generateChallengeToken } from '@/lib/security/device';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  deviceDna: z.string().min(6),
  ipAddress: z.string().min(3),
  locationCountry: z.string().min(2).optional(),
  locationCity: z.string().min(1).optional(),
  browserSignature: z.string().min(3).optional(),
  screenResolution: z.string().min(3).optional(),
  networkHints: z.string().optional()
});

export async function POST(request) {
  try {
    const payload = schema.parse(await request.json());

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      include: {
        deviceCredentials: {
          where: { deviceDna: payload.deviceDna },
          take: 1
        }
      }
    });

    if (!user) {
      return Response.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const passwordOk = await verifySpicePassword(payload.password, user.spiceSalt, user.passwordHash);
    if (!passwordOk) {
      await prisma.securityEvent.create({
        data: {
          userId: user.id,
          type: 'LOGIN_PASSWORD_FAILED',
          ipAddress: payload.ipAddress,
          metadata: { email: payload.email }
        }
      });

      return Response.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    if (user.isFrozen) {
      return Response.json(
        { error: 'Account frozen.', reason: user.frozenReason || 'Security lock is active.' },
        { status: 403 }
      );
    }

    const deviceCredential = user.deviceCredentials[0] || null;
    const geoRisk = await evaluateGeoRisk(user, payload);

    let riskScore = geoRisk.score;
    const riskReasons = [...geoRisk.reasons];

    if (!deviceCredential) {
      riskScore = Math.min(0.99, Number((riskScore + 0.35).toFixed(2)));
      riskReasons.push('Unrecognized device fingerprint.');
    }

    const challenge = generateChallengeToken();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    const challengeRow = await prisma.loginChallenge.create({
      data: {
        userId: user.id,
        deviceCredentialId: deviceCredential?.id,
        challenge,
        ipAddress: payload.ipAddress,
        locationCountry: payload.locationCountry,
        locationCity: payload.locationCity,
        riskScore,
        riskReasons,
        expiresAt
      }
    });

    return Response.json(
      {
        challengeId: challengeRow.id,
        challenge,
        requiresAdditionalVerification: riskScore >= 0.5,
        risk: {
          score: riskScore,
          reasons: riskReasons
        },
        knownDevice: Boolean(deviceCredential),
        hasDeviceKey: Boolean(deviceCredential?.publicKeyPem)
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
=======
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userSessions } from '@/lib/db/schema';
import { comparePassword, generateToken, generateRefreshToken, generateOTP } from '@/lib/auth/utils';
import { sendVerificationSMS } from '@/lib/services/smsService';
import { eq } from 'drizzle-orm';

export async function POST(request) {
  try {
    const { email, password, deviceInfo, ipAddress, userAgent } = await request.json();
    
    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Check if email and phone are verified
    if (!user.isEmailVerified || !user.isPhoneVerified) {
      return NextResponse.json({ 
        error: 'Please verify your email and phone first',
        requiresVerification: true 
      }, { status: 403 });
    }
    
    // Generate 2FA OTP if enabled
    let twoFactorOTP = null;
    if (user.twoFactorEnabled) {
      twoFactorOTP = generateOTP();
      await sendVerificationSMS(user.phone, twoFactorOTP);
      // Store in cache
      if (!global.twoFactorStore) global.twoFactorStore = new Map();
      global.twoFactorStore.set(user.id, { otp: twoFactorOTP, expires: Date.now() + 5 * 60 * 1000 });
      
      return NextResponse.json({
        requiresTwoFactor: true,
        userId: user.id,
        message: '2FA code sent to your phone',
      });
    }
    
    // Generate tokens
    const token = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);
    
    // Create session
    const sessionExpiry = new Date();
    sessionExpiry.setDate(sessionExpiry.getDate() + 7);
    
    await db.insert(userSessions).values({
      userId: user.id,
      sessionToken: refreshToken,
      deviceInfo,
      ipAddress,
      userAgent,
      expiresAt: sessionExpiry,
    });
    
    // Update last login
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));
    
    return NextResponse.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
>>>>>>> 618203f (Added authentication with email and sms)
