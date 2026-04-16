import { requireSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getLast30DaysStart() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
}

export async function GET(request) {
  try {
    const auth = await requireSession(request);
    if (!auth.ok) {
      return auth.response;
    }

    const userId = auth.session.userId;
    const monthStart = getMonthStart();
    const thirtyDaysStart = getLast30DaysStart();

    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() - 1);

    const [user, monthTransactionCount, recentTransactions, threatCount, recentSecurityEventsCount, recentPaymentsCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          balance: true,
          updatedAt: true,
          genuinityScore: true
        }
      }),
      prisma.transaction.count({
        where: {
          userId,
          createdAt: { gte: monthStart },
          ledgerType: 'REAL'
        }
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.securityEvent.count({
        where: {
          userId,
          createdAt: { gte: thirtyDaysStart },
          OR: [
            { type: { contains: 'BLOCK' } },
            { type: { contains: 'FAILED' } },
            { type: { contains: 'FLAGGED' } }
          ]
        }
      }),
      prisma.securityEvent.count({
        where: {
          userId,
          createdAt: { gte: dayStart }
        }
      }),
      prisma.transaction.count({
        where: {
          userId,
          createdAt: { gte: dayStart }
        }
      })
    ]);

    if (!user) {
      return Response.json({ error: 'User not found.' }, { status: 404 });
    }

    return Response.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          balance: Number(user.balance || 0),
          lastUpdatedAt: user.updatedAt,
          genuinityScore: Number(user.genuinityScore || 0)
        },
        stats: {
          transactionsThisMonth: monthTransactionCount,
          threatsBlockedLast30Days: threatCount,
          securityScore: Math.max(0, Math.min(100, Number(user.genuinityScore || 0))),
          unreadNotifications: recentSecurityEventsCount + recentPaymentsCount
        },
        recentTransactions: recentTransactions.map((tx) => ({
          id: tx.id,
          payee: tx.payee,
          amount: Number(tx.amount || 0),
          status: tx.status,
          ledgerType: tx.ledgerType,
          locationCity: tx.locationCity,
          createdAt: tx.createdAt
        }))
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch dashboard overview.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
