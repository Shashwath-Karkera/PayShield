import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { behavioralEvents } from '@/lib/db/schema';
import { calculateRisk } from '@/lib/behavior/riskCalculator';

export async function POST(req) {
  try {
    const data = await req.json();
    const { behaviorData, userId, sessionId, eventType = 'login' } = data;

    if (!behaviorData) {
      return NextResponse.json({ error: "Behavior data required." }, { status: 400 });
    }

    const analysis = calculateRisk(behaviorData);

    // Try to safely store the log with Drizzle
    try {
        await db.insert(behavioralEvents).values({
          userId: userId || null,
          sessionId: sessionId || null,
          eventType,
          riskScore: analysis.score,
          triggeredRules: analysis.triggeredRules,
          actionTaken: analysis.action,
          metrics: behaviorData
        });
    } catch (e) {
        console.error("Failed to log behavior event:", e);
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Behavior analysis error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
