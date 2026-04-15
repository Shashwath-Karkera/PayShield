import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { behavioralEvents } from '@/lib/db/schema';
import { desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalEventsResult = await db.select({ count: sql`count(*)` }).from(behavioralEvents);
    const blockedEventsResult = await db.select({ count: sql`count(*)` })
        .from(behavioralEvents)
        .where(sql`action_taken = 'block'`);
    
    // Exclude the massive 'metrics' JSON object which causes OOM / 128kb Next.js limits
    const recentEvents = await db.select({
      id: behavioralEvents.id,
      userId: behavioralEvents.userId,
      eventType: behavioralEvents.eventType,
      riskScore: behavioralEvents.riskScore,
      triggeredRules: behavioralEvents.triggeredRules,
      actionTaken: behavioralEvents.actionTaken,
      createdAt: behavioralEvents.createdAt
    })
        .from(behavioralEvents)
        .orderBy(desc(behavioralEvents.createdAt))
        .limit(10);

    return NextResponse.json({
        totalEvents: parseInt(totalEventsResult[0]?.count || 0, 10),
        blockedAttempts: parseInt(blockedEventsResult[0]?.count || 0, 10),
        recentThreats: recentEvents
    });
  } catch (error) {
    console.error("Behavior stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
