"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Save, Sliders, BellDot, ShieldAlert, Cpu, RotateCcw } from "lucide-react";
import ThreatSectionShell from "../ThreatSectionShell";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    autoBlock: true,
    alertThreshold: "High",
    dataRetention: "90 Days",
    neuralSensitivity: 85,
    notifyEmail: true,
    notifySlack: false,
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
    }, 1500);
  };

  const toggle = (key) => setConfig({ ...config, [key]: !config[key] });

  return (
    <ThreatSectionShell
      title="System Configuration"
      subtitle="Manage global threat response thresholds, neural engine parameters, and alert routing."
    >
      <div className="flex w-full flex-col gap-8 lg:gap-10">

        {/* Global Controls */}
        <div className="content-card flex w-full flex-col items-stretch justify-between gap-4 rounded-3xl p-5 lg:flex-row lg:items-center lg:p-7">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Sliders className="w-5 h-5 text-indigo-500" />
              Engine Parameters
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Last updated: 2 hours ago by admin
            </p>
          </div>
          <div className="flex w-full shrink-0 gap-3 lg:w-auto">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-200 sm:flex-none">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-all hover:bg-indigo-700 disabled:bg-indigo-400 sm:flex-none"
            >
              {saving ? (
                 <>
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Applying...
                 </>
              ) : (
                 <>
                   <Save className="w-4 h-4" /> Save Rules
                 </>
              )}
            </button>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:gap-7">

          {/* Response Matrix Content */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="content-card flex w-full flex-col overflow-hidden rounded-3xl p-0"
          >
            <div className="shrink-0 border-b border-slate-100 bg-slate-50/50 p-6 lg:p-7">
               <h4 className="flex items-center gap-2 text-base font-bold text-slate-900">
                 <ShieldAlert className="w-4 h-4 text-rose-500" /> Action Matrix
               </h4>
            </div>
            <div className="flex-1 space-y-7 p-6 lg:p-7">
               
               <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggle('autoBlock')}>
                 <div>
                   <p className="text-sm font-bold leading-none text-slate-900">Automated IP Ban</p>
                   <p className="mt-1.5 max-w-55 text-sm font-medium text-slate-500">Instantly null-route hostile traffic lacking signature.</p>
                 </div>
                 <div className={`w-12 h-6 rounded-full p-1 transition-colors ${config.autoBlock ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                   <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${config.autoBlock ? 'translate-x-6' : 'translate-x-0'}`} />
                 </div>
               </div>

               <div className="pt-4 border-t border-slate-100">
                 <div className="mb-3">
                   <p className="text-sm font-bold leading-none text-slate-900">Tolerance Layer</p>
                   <p className="mt-1.5 max-w-55 text-sm font-medium text-slate-500">Base severity required to trigger lockdown protocol.</p>
                 </div>
                 <div className="flex gap-2">
                   {["Low", "Medium", "High", "Critical"].map(level => (
                     <button
                       key={level}
                       onClick={() => setConfig({ ...config, alertThreshold: level })}
                       className={`flex-1 rounded-lg border py-2 text-xs font-semibold uppercase tracking-widest transition-all ${
                         config.alertThreshold === level
                           ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
                           : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                       }`}
                     >
                       {level}
                     </button>
                   ))}
                 </div>
               </div>

            </div>
          </motion.div>

          {/* Neural Core Params Content */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="content-card flex w-full flex-col overflow-hidden rounded-3xl p-0"
          >
            <div className="shrink-0 border-b border-slate-100 bg-slate-50/50 p-6 lg:p-7">
               <h4 className="flex items-center gap-2 text-base font-bold text-slate-900">
                 <Cpu className="w-4 h-4 text-emerald-500" /> Neural Core Params
               </h4>
            </div>
            <div className="flex-1 space-y-7 p-6 lg:p-7">
               
               <div>
                 <div className="flex justify-between items-end mb-3">
                   <div>
                     <p className="text-sm font-bold leading-none text-slate-900">Detection Sensitivity</p>
                     <p className="mt-1.5 max-w-55 text-sm font-medium text-slate-500">Higher values flag anomalies faster but increase false positives.</p>
                   </div>
                   <span className="rounded border border-indigo-100 bg-indigo-50 px-2 py-1 text-sm font-bold text-indigo-600">
                     {config.neuralSensitivity}%
                   </span>
                 </div>
                 <input 
                   type="range" 
                   min="0" max="100" 
                   value={config.neuralSensitivity}
                   onChange={(e) => setConfig({ ...config, neuralSensitivity: e.target.value })}
                   className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-all hover:bg-slate-300"
                 />
                 <div className="mt-2 flex justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                   <span>Permissive</span>
                   <span>Strict</span>
                 </div>
               </div>

            </div>
          </motion.div>

          {/* Routing Content */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="content-card flex w-full flex-col overflow-hidden rounded-3xl p-0 md:col-span-2"
          >
            <div className="shrink-0 border-b border-slate-100 bg-slate-50/50 p-6 lg:p-7">
               <h4 className="flex items-center gap-2 text-base font-bold text-slate-900">
                 <BellDot className="w-4 h-4 text-blue-500" /> Notification Routing
               </h4>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:p-7">
               
               <div className="flex items-center justify-between group cursor-pointer bg-slate-50 p-4 rounded-2xl border border-slate-100" onClick={() => toggle('notifyEmail')}>
                 <div>
                   <p className="mb-1 text-sm font-bold leading-none text-slate-900">Email Escalation</p>
                   <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-500">soc@payshield.app</p>
                 </div>
                 <div className={`w-12 h-6 rounded-full p-1 transition-colors ${config.notifyEmail ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                   <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${config.notifyEmail ? 'translate-x-6' : 'translate-x-0'}`} />
                 </div>
               </div>

               <div className="flex items-center justify-between group cursor-pointer bg-slate-50 p-4 rounded-2xl border border-slate-100" onClick={() => toggle('notifySlack')}>
                 <div>
                   <p className="mb-1 text-sm font-bold leading-none text-slate-900">Slack Webhook</p>
                   <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">#sec-alerts-critical</p>
                 </div>
                 <div className={`w-12 h-6 rounded-full p-1 transition-colors ${config.notifySlack ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                   <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${config.notifySlack ? 'translate-x-6' : 'translate-x-0'}`} />
                 </div>
               </div>

            </div>
          </motion.div>

        </div>
      </div>
    </ThreatSectionShell>
  );
}

