import { prisma } from '@/lib/prisma';
import { computeGenuinityScore, shouldUseMirrorLedger } from '@/lib/security/genuinity';
import { requireSession } from '@/lib/auth/session';
import { verifyPayShieldPin } from '@/lib/security/verification';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const mode = searchParams.get('mode') || 'auto';
    const payShieldPin = searchParams.get('payShieldPin');

    if (!userId) {
      return Response.json({ error: 'userId is required.' }, { status: 400 });
    }

    if (!payShieldPin) {
      return Response.json({ error: 'payShieldPin is required.' }, { status: 400 });
    }

    const auth = await requireSession(request, userId);
    if (!auth.ok) {
      return auth.response;
    }

    const [user, recentLogs] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.behavioralLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 25
      })
    ]);

    if (!user) {
      return Response.json({ error: 'User not found.' }, { status: 404 });
    }

    if (!user.payShieldPinHash) {
      return Response.json({ error: 'PayShield PIN is not configured.' }, { status: 403 });
    }

    const pinOk = await verifyPayShieldPin(payShieldPin, user.payShieldPinHash);
    if (!pinOk) {
      return Response.json({ error: 'Invalid PayShield PIN.' }, { status: 401 });
    }

    const genuinityScore = computeGenuinityScore(recentLogs);
    const resolvedMode =
      mode === 'auto' ? (shouldUseMirrorLedger(genuinityScore) ? 'mirror' : 'real') : mode;

    await prisma.user.update({
      where: { id: userId },
      data: { genuinityScore }
    });

    const ledgerType = resolvedMode === 'mirror' ? 'MIRROR' : 'REAL';

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        ledgerType
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return Response.json(
      {
        userId,
        genuinityScore,
        mode: resolvedMode,
        ledgerType,
        transactions
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch transactions.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
