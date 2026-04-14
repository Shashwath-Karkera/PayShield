"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Save, Sliders, BellDot, ShieldAlert, Cpu, RotateCcw, ShieldCheck } from "lucide-react";
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
      <div className="flex flex-col w-full gap-6 lg:gap-8 max-w-4xl">

        {/* Global Controls */}
        <div className="bg-white p-4 lg:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div>
            <h3 className="  text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-500" />
              Engine Parameters
            </h3>
            <p className="  text-slate-500 mt-1  ">
              Last updated: 2 hours ago by admin
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto shrink-0">
            <button className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600     rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white     rounded-xl shadow-sm shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 w-full">

          {/* Response Matrix Content */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full"
          >
            <div className="p-5 lg:p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
               <h4 className="  text-slate-900   flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4 text-rose-500" /> Action Matrix
               </h4>
            </div>
            <div className="p-5 lg:p-6 space-y-6 flex-1">
               
               <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggle('autoBlock')}>
                 <div>
                   <p className=" font-bold text-slate-900 leading-none">Automated IP Ban</p>
                   <p className=" text-slate-500 font-medium mt-1.5 max-w-[200px]">Instantly null-route hostile traffic lacking signature.</p>
                 </div>
                 <div className={`w-12 h-6 rounded-full p-1 transition-colors ${config.autoBlock ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                   <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${config.autoBlock ? 'translate-x-6' : 'translate-x-0'}`} />
                 </div>
               </div>

               <div className="pt-4 border-t border-slate-100">
                 <div className="mb-3">
                   <p className=" font-bold text-slate-900 leading-none">Tolerance Layer</p>
                   <p className=" text-slate-500 font-medium mt-1.5 max-w-[200px]">Base severity required to trigger lockdown protocol.</p>
                 </div>
                 <div className="flex gap-2">
                   {["Low", "Medium", "High", "Critical"].map(level => (
                     <button
                       key={level}
                       onClick={() => setConfig({ ...config, alertThreshold: level })}
                       className={`flex-1 py-2 rounded-lg     transition-all border ${
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
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full"
          >
            <div className="p-5 lg:p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
               <h4 className="  text-slate-900   flex items-center gap-2">
                 <Cpu className="w-4 h-4 text-emerald-500" /> Neural Core Params
               </h4>
            </div>
            <div className="p-5 lg:p-6 space-y-6 flex-1">
               
               <div>
                 <div className="flex justify-between items-end mb-3">
                   <div>
                     <p className=" font-bold text-slate-900 leading-none">Detection Sensitivity</p>
                     <p className=" text-slate-500 font-medium mt-1.5 max-w-[200px]">Higher values flag anomalies faster but increase false positives.</p>
                   </div>
                   <span className="  text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
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
                 <div className="flex justify-between text-[10px]    text-slate-400 mt-2">
                   <span>Permissive</span>
                   <span>Strict</span>
                 </div>
               </div>

            </div>
          </motion.div>

          {/* Routing Content */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full md:col-span-2"
          >
            <div className="p-5 lg:p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
               <h4 className="  text-slate-900   flex items-center gap-2">
                 <BellDot className="w-4 h-4 text-blue-500" /> Notification Routing
               </h4>
            </div>
            <div className="p-5 lg:p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
               
               <div className="flex items-center justify-between group cursor-pointer bg-slate-50 p-4 rounded-2xl border border-slate-100" onClick={() => toggle('notifyEmail')}>
                 <div>
                   <p className=" font-bold text-slate-900 leading-none mb-1">Email Escalation</p>
                   <p className="text-[10px]    text-indigo-500">soc@payshield.app</p>
                 </div>
                 <div className={`w-12 h-6 rounded-full p-1 transition-colors ${config.notifyEmail ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                   <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${config.notifyEmail ? 'translate-x-6' : 'translate-x-0'}`} />
                 </div>
               </div>

               <div className="flex items-center justify-between group cursor-pointer bg-slate-50 p-4 rounded-2xl border border-slate-100" onClick={() => toggle('notifySlack')}>
                 <div>
                   <p className=" font-bold text-slate-900 leading-none mb-1">Slack Webhook</p>
                   <p className="text-[10px]    text-slate-400">#sec-alerts-critical</p>
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

