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
