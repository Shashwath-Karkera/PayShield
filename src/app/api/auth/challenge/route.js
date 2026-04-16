import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

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
    const { userId, ipAddress } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (!checkRateLimit(userId)) {
      return NextResponse.json({ error: 'Too many attempts. Please wait.' }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { id: String(userId) } });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const challengeBase64 = crypto.randomBytes(32).toString('base64');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const inserted = await prisma.loginChallenge.create({
      data: {
        userId: user.id,
        challenge: challengeBase64,
        ipAddress: ipAddress || req.headers.get('x-forwarded-for') || '127.0.0.1',
        expiresAt
      },
      select: { id: true }
    });

    return NextResponse.json(
      {
        challengeId: inserted.id,
        challenge: challengeBase64,
        expiresAt: expiresAt.toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
