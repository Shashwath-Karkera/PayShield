import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRisk } from '@/lib/behavior/riskCalculator';

export async function POST(req) {
  try {
    const data = await req.json();
    const { behaviorData, userId, sessionId, eventType = 'login' } = data;

    if (!behaviorData) {
      return NextResponse.json({ error: "Behavior data required." }, { status: 400 });
    }

    const analysis = calculateRisk(behaviorData);

    // Persist behavior event in canonical Prisma schema.
    try {
      await prisma.behavioralEvent.create({
        data: {
          userId: userId || null,
          sessionId: sessionId || null,
          eventType,
          riskScore: Number(analysis.score || 0),
          triggeredRules: analysis.triggeredRules || [],
          actionTaken: analysis.action || 'allow',
          metrics: behaviorData
        }
      });
    } catch (e) {
      console.error('Failed to log behavior event:', e);
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Behavior analysis error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
