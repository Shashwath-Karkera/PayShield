import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { loginChallenges } from '@/lib/db/schema';

// Rate Limiting (In-memory strict requirement: 5 per minute)
// Test Rate Limiting: Hit endpoint 6 times in 1 min -> expects 429
const rateLimits = new Map();

function checkRateLimit(userId) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  
  if (!rateLimits.has(userId)) {
    rateLimits.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  const record = rateLimits.get(userId);
  if (now > record.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= 5) {
    return false;
  }
  
  record.count += 1;
  return true;
}

export async function POST(req) {
  try {
    const { userId, deviceDna, ipAddress } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (!checkRateLimit(userId)) {
      return NextResponse.json({ error: "Too many attempts. Please wait." }, { status: 429 });
    }

    // Generate random 32-byte challenge
    const challengeBytes = crypto.randomBytes(32);
    const challengeBase64 = challengeBytes.toString('base64');
    
    // Test Challenge Expiry: Try to use a challenge > 5 mins old -> expects 410
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const [inserted] = await db.insert(loginChallenges).values({
      userId,
      challenge: challengeBase64,
      ipAddress: ipAddress || req.headers.get('x-forwarded-for') || '127.0.0.1',
      expiresAt
    }).returning({ id: loginChallenges.id });

    // Note: Logging attempt can be done here to security_events table

    return NextResponse.json({
      challengeId: inserted.id,
      challenge: challengeBase64,
      expiresAt: expiresAt.toISOString()
    }, { status: 200 });
    
  } catch (error) {
    console.error("Challenge error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
