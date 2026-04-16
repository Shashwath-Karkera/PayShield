import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import { addLiveThreatEvent } from '@/lib/threats/liveThreats';

const schema = z.object({
  userId: z.string().min(1),
  ipAddress: z.string().min(3),
  vector: z.string().min(3),
  payload: z.any().optional()
});

export async function POST(request) {
  try {
    const data = schema.parse(await request.json());

    const auth = await requireSession(request, data.userId);
    if (!auth.ok) {
      return auth.response;
    }

    const event = await prisma.securityEvent.create({
      data: {
        userId: data.userId,
        type: 'HONEYPOT2_EVENT',
        ipAddress: data.ipAddress,
        metadata: {
          vector: data.vector,
          payload: data.payload || null
        }
      }
    });

    addLiveThreatEvent({
      id: event.id,
      type: 'HONEYPOT2_EVENT',
      ip: data.ipAddress,
      route: '/api/honeypot2',
      action: 'Intercepted',
      severity: 'high',
      source: 'honeypot2',
      metadata: {
        vector: data.vector,
        payload: data.payload || null,
      },
      timestamp: new Date(event.createdAt).getTime(),
      date: new Date(event.createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'medium' }),
    });

    return Response.json({ ok: true, eventId: event.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Failed to record honeypot signal.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'userId is required.' }, { status: 400 });
    }

    const auth = await requireSession(request, userId);
    if (!auth.ok) {
      return auth.response;
    }

    const events = await prisma.securityEvent.findMany({
      where: {
        type: 'HONEYPOT2_EVENT',
        userId
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return Response.json({ source: 'honeypot2', events }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch honeypot telemetry.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
