import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';

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

    const where = { userId };

    const [events, flaggedTransactions] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          OR: [{ status: 'FLAGGED' }, { ledgerType: 'MIRROR' }]
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      })
    ]);

    return Response.json(
      {
        source: 'threat2',
        events,
        flaggedTransactions
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch threat telemetry.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
