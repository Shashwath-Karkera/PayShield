"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Activity, Plus, Trash2, ShieldCheck, Network, AlertTriangle } from "lucide-react";
import ThreatSectionShell from "../ThreatSectionShell";

const INITIAL_HONEYPOTS = [
  { id: 1, name: "Legacy DB Node", type: "Database", status: "Active", captures: 142, uptime: "45d 12h", ip: "10.0.4.15" },
  { id: 2, name: "Admin Portal Fake", type: "Web", status: "Compromised", captures: 89, uptime: "2d 4h", ip: "10.0.5.22" },
  { id: 3, name: "API Gateway Trap", type: "API", status: "Active", captures: 34, uptime: "12d 1h", ip: "10.0.2.150" },
];

export default function HoneypotsPage() {
  const [pots, setPots] = useState(INITIAL_HONEYPOTS);
  const [isDeploying, setIsDeploying] = useState(false);

  const simulateDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setPots((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: `Decoy Node ${Math.floor(Math.random() * 1000)}`,
          type: ["Database", "Web", "API"][Math.floor(Math.random() * 3)],
          status: "Initializing",
          captures: 0,
          uptime: "0d 0h",
          ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        }
      ]);
      setIsDeploying(false);
    }, 2000);
  };

  const removePot = (id) => {
    setPots(pots.filter(p => p.id !== id));
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Database": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "Web": return "text-blue-600 bg-blue-50 border-blue-200";
      case "API": return "text-sky-700 bg-sky-50 border-sky-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "text-emerald-700 bg-emerald-50 border-emerald-200 shadow-sm";
      case "Compromised": return "text-red-700 bg-red-50 border-red-200 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
      case "Initializing": return "text-indigo-700 bg-indigo-50 border-indigo-200 shadow-sm animate-pulse";
      default: return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  return (
    <ThreatSectionShell
      title="Deception Network"
      subtitle="Deploy and monitor honeypots to attract, analyze, and divert attackers."
    >
      <div className="flex flex-col w-full gap-8 lg:gap-10">

        {/* Action Bar */}
        <div className="content-card flex w-full flex-col items-stretch justify-between gap-4 rounded-3xl p-5 lg:flex-row lg:items-center lg:p-7">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Network className="w-5 h-5 text-indigo-500" />
              Active Decoy Grid
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {pots.length} Node(s) Online • {pots.reduce((a, b) => a + b.captures, 0)} Threats Captured
            </p>
          </div>
          <button
            onClick={simulateDeploy}
            disabled={isDeploying}
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-all hover:bg-indigo-700 disabled:bg-indigo-400 lg:w-auto"
          >
            {isDeploying ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Deploy New Node
              </>
            )}
          </button>
        </div>

        {/* Nodes Grid */}
        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 lg:gap-7">
          <AnimatePresence>
            {pots.map((pot) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={pot.id}
                className="content-card relative flex w-full flex-col overflow-hidden rounded-3xl p-0 transition-all hover:border-slate-300 hover:shadow-md"
              >
                {/* Status Indicator Bar */}
                <div className={`h-1.5 w-full ${pot.status === 'Compromised' ? 'bg-red-500' : pot.status === 'Active' ? 'bg-emerald-500' : 'bg-indigo-400'}`} />
                
                <div className="relative flex items-start justify-between border-b border-slate-100 bg-slate-50/50 p-6 transition-colors group-hover:bg-white lg:p-7">
                   {pot.status === 'Compromised' && (
                     <div className="absolute top-4 right-4 animate-pulse">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                     </div>
                   )}
                   <div>
                    <span className={`mb-3 inline-block rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getTypeColor(pot.type)}`}>
                        {pot.type}
                     </span>
                    <h3 className="pr-8 text-lg font-bold leading-tight text-slate-900 wrap-break-word">{pot.name}</h3>
                    <p className="mt-1 inline-block rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs font-medium text-slate-500 shadow-sm">
                        IP: {pot.ip}
                     </p>
                   </div>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-4 bg-white p-6 lg:p-7">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <Activity className={`w-6 h-6 mb-2 ${pot.captures > 0 ? 'text-indigo-500' : 'text-slate-400'}`} />
                    <span className="text-2xl font-bold leading-none text-slate-900">{pot.captures}</span>
                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Intrusions</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <Server className="w-6 h-6 mb-2 text-emerald-500" />
                    <span className="mt-1 text-base font-bold leading-none text-slate-900">{pot.uptime}</span>
                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Uptime</span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-b-3xl border-t border-slate-100 bg-slate-50/80 p-5 lg:p-6">
                  <span className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${getStatusColor(pot.status)}`}>
                    {pot.status === "Active" && <ShieldCheck className="w-3.5 h-3.5" />}
                    {pot.status}
                  </span>
                  
                  <button 
                    onClick={() => removePot(pot.id)}
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                    title="Decommission Node"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State / Add Placeholder */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`content-card bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-8 text-center transition-all min-h-75 w-full ${isDeploying ? 'opacity-50 pointer-events-none' : 'hover:bg-indigo-50/50 hover:border-indigo-300 cursor-pointer group'}`}
            onClick={simulateDeploy}
          >
             <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors shadow-sm group-hover:shadow-indigo-500/30">
                <Plus className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
             </div>
             <h3 className="mb-1 text-lg font-bold text-slate-900 transition-colors group-hover:text-indigo-900">Expand Network</h3>
             <p className="max-w-55 text-sm font-medium text-slate-500">Click to deploy a new deception node into the proxy zone.</p>
          </motion.div>
        </div>
      </div>
    </ThreatSectionShell>
  );
}

