import { NextResponse } from 'next/server';
import { addLiveThreatEvent, getLiveThreatEvents } from '@/lib/threats/liveThreats';

export async function POST(request) {
  try {
    const body = await request.json();
    const newThreat = addLiveThreatEvent({
      type: body.type,
      ip: body.ip || body.ipAddress,
      route: body.route || body.path,
      action: body.action,
      severity: body.severity,
      country: body.country,
      source: 'security-log',
      metadata: body.metadata || {},
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Threat logged successfully.',
        event: newThreat,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to log threat", detail: String(error.message || error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ events: getLiveThreatEvents() }, { status: 200 });
}
