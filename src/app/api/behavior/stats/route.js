import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

function getSystemAdminEmail() {
  return (
    process.env.PAYSHIELD_ADMIN_EMAIL ||
    process.env.SYSTEM_ADMIN_EMAIL ||
    ''
  )
    .trim()
    .toLowerCase();
}

export async function GET(request) {
  try {
    const auth = await requireSession(request, undefined, { requireVerified: false });
    if (!auth.ok) {
      return auth.response;
    }

    const configuredAdmin = getSystemAdminEmail();
    const sessionEmail = String(auth.session?.user?.email || '').toLowerCase();
    if (!configuredAdmin || configuredAdmin !== sessionEmail) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const [totalEvents, blockedAttempts, recentEvents] = await Promise.all([
      prisma.behavioralEvent.count(),
      prisma.behavioralEvent.count({ where: { actionTaken: 'block' } }),
      prisma.behavioralEvent.findMany({
        select: {
          id: true,
          userId: true,
          eventType: true,
          riskScore: true,
          triggeredRules: true,
          actionTaken: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    return NextResponse.json({
      totalEvents,
      blockedAttempts,
      recentThreats: recentEvents
    });
  } catch (error) {
    console.error("Behavior stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
