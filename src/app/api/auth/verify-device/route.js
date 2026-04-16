import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { generateSessionToken } from '@/lib/security/device';

export async function POST(req) {
  try {
    const { challengeId, signature, deviceCredentialId } = await req.json();

    const challengeRecord = await prisma.loginChallenge.findUnique({
      where: { id: String(challengeId) }
    });

    if (!challengeRecord) {
      return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 });
    }

    if (challengeRecord.consumedAt) {
      return NextResponse.json({ error: 'Challenge already used.' }, { status: 409 });
    }

    if (new Date() > challengeRecord.expiresAt) {
      return NextResponse.json({ error: 'Challenge expired. Request a new one.' }, { status: 410 });
    }

    const deviceRecord = await prisma.deviceCredential.findUnique({
      where: { id: String(deviceCredentialId) }
    });

    if (!deviceRecord || deviceRecord.userId !== challengeRecord.userId) {
      return NextResponse.json({ error: 'Device not registered.' }, { status: 404 });
    }

    try {
      const publicKeyObj = crypto.createPublicKey({
        key: deviceRecord.publicKeyPem,
        format: 'pem',
        type: 'spki'
      });

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
        return NextResponse.json({ error: 'Device verification failed.' }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: 'Device verification failed.' }, { status: 401 });
    }

    const currentIp = req.headers.get('x-forwarded-for') || '127.0.0.1';

    await prisma.$transaction([
      prisma.loginChallenge.update({
        where: { id: challengeRecord.id },
        data: { consumedAt: new Date() }
      }),
      prisma.deviceCredential.update({
        where: { id: deviceRecord.id },
        data: { lastUsedAt: new Date(), lastSeenIp: currentIp }
      })
    ]);

    const user = await prisma.user.findUnique({ where: { id: deviceRecord.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const sessionToken = generateSessionToken();
    const refreshToken = generateSessionToken();

    await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.id,
        deviceCredentialId: deviceRecord.id,
        ipAddress: currentIp,
        isVerified: true,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    });

    return NextResponse.json(
      {
        verified: true,
        sessionToken,
        refreshToken,
        user: { id: user.id, fullName: user.name, email: user.email }
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
