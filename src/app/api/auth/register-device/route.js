import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const {
      userId,
      deviceName,
      publicKeyPem,
      deviceDna,
      browserSignature,
      screenResolution,
      ipAddress,
      location
    } = await req.json();

    if (!publicKeyPem || !publicKeyPem.startsWith('-----BEGIN PUBLIC KEY-----')) {
      return NextResponse.json({ error: 'Invalid public key format.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: String(userId) } });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const existingCount = await prisma.deviceCredential.count({ where: { userId: user.id } });
    if (existingCount >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 devices allowed. Remove an existing device first.' },
        { status: 400 }
      );
    }

    const created = await prisma.deviceCredential.create({
      data: {
        userId: user.id,
        deviceName: deviceName || 'Browser Device',
        deviceDna,
        publicKeyPem,
        browserSignature,
        screenResolution,
        lastSeenIp: ipAddress || req.headers.get('x-forwarded-for') || '127.0.0.1',
        lastSeenCountry: location?.countryCode || null,
        trusted: true
      },
      select: { id: true }
    });

    return NextResponse.json(
      {
        success: true,
        deviceId: created.id,
        deviceCount: existingCount + 1
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
