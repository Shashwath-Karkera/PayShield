import { NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { loginChallenges, deviceCredentials, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Test Verify Flow:
// Measure the function scope execution -> Should be < 100ms
export async function POST(req) {
  try {
    const { challengeId, signature, deviceCredentialId } = await req.json();

    const [challengeRecord] = await db.select()
      .from(loginChallenges)
      .where(eq(loginChallenges.id, challengeId));

    if (!challengeRecord) {
      return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
    }

    // Test Replay Attack: Using a consumed challenge -> expects 409
    if (challengeRecord.consumedAt) {
      return NextResponse.json({ error: "Challenge already used." }, { status: 409 });
    }

    // Test Challenge Expiry: Using expired -> expects 410
    if (new Date() > challengeRecord.expiresAt) {
      return NextResponse.json({ error: "Challenge expired. Request a new one." }, { status: 410 });
    }

    const [deviceRecord] = await db.select()
      .from(deviceCredentials)
      .where(eq(deviceCredentials.id, deviceCredentialId));

    if (!deviceRecord || deviceRecord.userId !== challengeRecord.userId) {
      return NextResponse.json({ error: "Device not registered." }, { status: 404 });
    }

    try {
      // Decode the PEM format 
      const publicKeyPem = deviceRecord.publicKeyPem
        .replace(/-----BEGIN PUBLIC KEY-----/g, '')
        .replace(/-----END PUBLIC KEY-----/g, '')
        .replace(/\n/g, '');

      // Prepare key for crypto module
      const publicKeyObj = crypto.createPublicKey({
        key: deviceRecord.publicKeyPem,
        format: 'pem',
        type: 'spki'
      });

      // Verification using RSA-PSS and SHA-256
      // Require strictly saltLength of 32
      const isVerified = crypto.verify(
        'sha256',
        Buffer.from(challengeRecord.challenge, 'base64'),
        {
          key: publicKeyObj,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: 32
        },
        Buffer.from(signature, 'base64')
      );

      if (!isVerified) {
        return NextResponse.json({ error: "Device verification failed." }, { status: 401 });
      }
    } catch (cryptoErr) {
      return NextResponse.json({ error: "Device verification failed." }, { status: 401 });
    }

    // Mark Challenge consumed
    await db.update(loginChallenges)
      .set({ consumedAt: new Date() })
      .where(eq(loginChallenges.id, challengeId));

    // Update last used
    const currentIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await db.update(deviceCredentials)
      .set({ lastUsedAt: new Date(), lastSeenIp: currentIp })
      .where(eq(deviceCredentials.id, deviceRecord.id));

    // Get user info and generate JWT 
    const [user] = await db.select().from(users).where(eq(users.id, deviceRecord.userId));
    
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_override_me';
    const sessionToken = jwt.sign(
      { userId: user.id, deviceId: deviceRecord.id, email: user.email }, 
      jwtSecret, 
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { userId: user.id, deviceId: deviceRecord.id }, 
      jwtSecret, 
      { expiresIn: '7d' }
    );

    // Logging success attempt here to security_events table

    return NextResponse.json({
      verified: true,
      sessionToken,
      refreshToken,
      user: { id: user.id, fullName: user.fullName, email: user.email }
    }, { status: 200 });

  } catch (error) {
    console.error("Verify device error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
