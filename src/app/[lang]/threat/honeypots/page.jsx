"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Network, ShieldCheck } from "lucide-react";
import ThreatSectionShell from "../ThreatSectionShell";

function buildNodeSummary(events) {
  const grouped = new Map();

  for (const event of events) {
    const vector = event.metadata?.vector || event.type;
    const key = `${vector}:${event.route}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        id: key,
        name: `${vector} Trap`,
        type: vector,
        status: "Active",
        captures: 0,
        uptime: "Live",
        ip: event.ip,
        route: event.route,
        lastSeen: event.date,
      });
    }

    const current = grouped.get(key);
    current.captures += 1;
    current.lastSeen = event.date;
    current.ip = event.ip;
  }

  return [...grouped.values()];
}

export default function HoneypotsPage() {
  const [pots, setPots] = useState([]);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/threat-dashboard");
        const json = await res.json();
        const honeypotEvents = (json.recentEvents || []).filter(
          (event) =>
            event.type.toLowerCase().includes("honeypot") ||
            Boolean(event.metadata?.vector)
        );

        if (active) {
          setPots(buildNodeSummary(honeypotEvents));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 1500);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <ThreatSectionShell
      title="Deception Network"
      subtitle="Live honeypot captures and decoy routes fed from recorded threat telemetry."
    >
      <div className="flex flex-col w-full gap-8 lg:gap-10">
        <div className="content-card flex w-full flex-col items-stretch justify-between gap-4 rounded-3xl p-5 lg:flex-row lg:items-center lg:p-7">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Network className="w-5 h-5 text-indigo-500" />
              Active Decoy Grid
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {pots.length} Live Node(s) • {pots.reduce((sum, pot) => sum + pot.captures, 0)} Captured Signals
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
            Auto-synced with threat telemetry
          </span>
        </div>

        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 lg:gap-7">
          {pots.length === 0 ? (
            <div className="content-card col-span-1 md:col-span-2 xl:col-span-3 flex min-h-75 flex-col items-center justify-center rounded-3xl p-8 text-center">
              <AlertTriangle className="mb-4 h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-900">No honeypot events yet</h3>
              <p className="mt-2 max-w-xl text-sm font-medium text-slate-500">
                Post to `/api/honeypot2` with a valid session or log a vector through `/api/security/log` to see captured traps here.
              </p>
            </div>
          ) : (
            pots.map((pot, index) => (
              <motion.div
                key={pot.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="content-card relative flex w-full flex-col overflow-hidden rounded-3xl p-0 transition-all hover:border-slate-300 hover:shadow-md"
              >
                <div className="h-1.5 w-full bg-emerald-500" />
                <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/50 p-6 lg:p-7">
                  <div>
                    <span className="mb-3 inline-block rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-700">
                      {pot.type}
                    </span>
                    <h3 className="text-lg font-bold leading-tight text-slate-900">{pot.name}</h3>
                    <p className="mt-1 inline-block rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs font-medium text-slate-500 shadow-sm">
                      Source IP: {pot.ip}
                    </p>
                  </div>
                  <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                    {pot.status}
                  </span>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-4 bg-white p-6 lg:p-7">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <Activity className="w-6 h-6 mb-2 text-indigo-500" />
                    <span className="text-2xl font-bold leading-none text-slate-900">{pot.captures}</span>
                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Captures</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <ShieldCheck className="w-6 h-6 mb-2 text-emerald-500" />
                    <span className="mt-1 text-base font-bold leading-none text-slate-900">{pot.uptime}</span>
                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Status</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 rounded-b-3xl border-t border-slate-100 bg-slate-50/80 p-5 text-sm text-slate-600 lg:p-6">
                  <p><span className="font-semibold text-slate-900">Route:</span> {pot.route}</p>
                  <p><span className="font-semibold text-slate-900">Last Seen:</span> {pot.lastSeen}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </ThreatSectionShell>
  );
}
