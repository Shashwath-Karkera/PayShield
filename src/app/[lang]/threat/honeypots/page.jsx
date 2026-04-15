"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Activity, Plus, Trash2, ShieldCheck, HelpCircle, Network, AlertTriangle } from "lucide-react";
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
      setPots([
        ...pots,
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
      <div className="flex flex-col w-full gap-6 lg:gap-8">

        {/* Action Bar */}
        <div className="bg-white p-4 lg:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div>
            <h3 className="  text-slate-900 flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-500" />
              Active Decoy Grid
            </h3>
            <p className="  text-slate-500 mt-1  ">
              {pots.length} Node(s) Online • {pots.reduce((a, b) => a + b.captures, 0)} Threats Captured
            </p>
          </div>
          <button
            onClick={simulateDeploy}
            disabled={isDeploying}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white     rounded-xl shadow-sm shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 w-full">
          <AnimatePresence>
            {pots.map((pot, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={pot.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-slate-300 transition-all w-full relative"
              >
                {/* Status Indicator Bar */}
                <div className={`h-1.5 w-full ${pot.status === 'Compromised' ? 'bg-red-500' : pot.status === 'Active' ? 'bg-emerald-500' : 'bg-indigo-400'}`} />
                
                <div className="p-5 lg:p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 group-hover:bg-white transition-colors relative">
                   {pot.status === 'Compromised' && (
                     <div className="absolute top-4 right-4 animate-pulse">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                     </div>
                   )}
                   <div>
                     <span className={`inline-block px-2.5 py-1 rounded-lg border text-[10px]    mb-3 ${getTypeColor(pot.type)}`}>
                        {pot.type}
                     </span>
                     <h3 className="  text-slate-900 leading-tight pr-8">{pot.name}</h3>
                     <p className=" font-mono font-medium text-slate-500 mt-1 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm inline-block">
                        IP: {pot.ip}
                     </p>
                   </div>
                </div>

                <div className="p-5 lg:p-6 flex-1 bg-white grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <Activity className={`w-6 h-6 mb-2 ${pot.captures > 0 ? 'text-indigo-500' : 'text-slate-400'}`} />
                    <span className="  text-slate-900 leading-none">{pot.captures}</span>
                    <span className="text-[10px]    text-slate-500 mt-1">Intrusions</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <Server className="w-6 h-6 mb-2 text-emerald-500" />
                    <span className=" font-bold text-slate-900 leading-none mt-1">{pot.uptime}</span>
                    <span className="text-[10px]    text-slate-500 mt-1">Uptime</span>
                  </div>
                </div>

                <div className="p-4 lg:p-5 border-t border-slate-100 bg-slate-50/80 flex justify-between items-center rounded-b-3xl">
                  <span className={`px-3 py-1.5 rounded-xl text-[10px]    border flex items-center gap-1.5 ${getStatusColor(pot.status)}`}>
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
            className={`bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 shadow-sm flex flex-col items-center justify-center p-8 text-center transition-all min-h-[300px] w-full ${isDeploying ? 'opacity-50 pointer-events-none' : 'hover:bg-indigo-50/50 hover:border-indigo-300 cursor-pointer group'}`}
            onClick={simulateDeploy}
          >
             <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors shadow-sm group-hover:shadow-indigo-500/30">
                <Plus className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
             </div>
             <h3 className="  text-slate-900 mb-1 group-hover:text-indigo-900 transition-colors">Expand Network</h3>
             <p className="  text-slate-500   max-w-[200px]">Click to deploy a new deception node into the proxy zone.</p>
          </motion.div>
        </div>
      </div>
    </ThreatSectionShell>
  );
}

