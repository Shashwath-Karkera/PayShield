import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { encryptValue } from '@/lib/security/crypto';
import { createSpicePasswordHash } from '@/lib/security/password';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80),
  phone: z.string().min(8).max(20).optional(),
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

    return Response.json({ user }, { status: 201 });
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
