import { NextResponse } from "next/server";

// In a real application, you would import Prisma or your Database logic here.
// For example: import prisma from "@/lib/prisma";

export async function GET() {
  // Simulate database latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Imagine this data is aggregated directly from PostgreSQL/Prisma
  const data = {
    overview: {
      totalThreats: 14205,
      activeConnections: 943,
      serversOnline: 124,
      incidents: 12
    },
    threatsOverTime: [
      { time: '08:00', firewall: 400, ddos: 240, botnet: 240 },
      { time: '10:00', firewall: 300, ddos: 139, botnet: 221 },
      { time: '12:00', firewall: 200, ddos: 980, botnet: 229 },
      { time: '14:00', firewall: 278, ddos: 390, botnet: 200 },
      { time: '16:00', firewall: 189, ddos: 480, botnet: 218 },
      { time: '18:00', firewall: 239, ddos: 380, botnet: 250 },
      { time: '20:00', firewall: 349, ddos: 430, botnet: 210 },
    ],
    recentEvents: [
      { id: "EVT-8942", type: "SQL Injection", ip: "192.168.1.14", action: "Blocked", date: "2026-04-15 10:24 AM" },
      { id: "EVT-8941", type: "Cross-Site Scripting", ip: "45.22.19.1", action: "Flagged", date: "2026-04-15 09:12 AM" },
      { id: "EVT-8940", type: "DDoS Attempt", ip: "104.33.22.9", action: "Mitigated", date: "2026-04-15 08:05 AM" },
      { id: "EVT-8939", type: "Brute Force Login", ip: "8.8.8.8", action: "Blocked", date: "2026-04-14 11:32 PM" },
      { id: "EVT-8938", type: "Unauthorized Access", ip: "172.16.0.4", action: "Blocked", date: "2026-04-14 06:15 PM" },
      { id: "EVT-8937", type: "Malware Payload", ip: "10.0.0.8", action: "Quarantined", date: "2026-04-14 02:40 PM" }
    ],
    topGeographies: [
      { country: "United States", percentage: 45 },
      { country: "Russia", percentage: 25 },
      { country: "China", percentage: 15 },
      { country: "Brazil", percentage: 10 },
      { country: "Other", percentage: 5 }
    ]
  };

  return NextResponse.json(data);
}
