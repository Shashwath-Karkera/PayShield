import { NextResponse } from "next/server";
import { getThreatDashboardData } from "@/lib/threats/liveThreats";

export async function GET() {
  return NextResponse.json(getThreatDashboardData());
}
