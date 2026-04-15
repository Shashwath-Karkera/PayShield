"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert, Activity, Server, Ban, Globe, ArrowRight, ShieldCheck, RefreshCcw, Lock
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import ThreatSectionShell from "./ThreatSectionShell";

// Mock data matching screenshot vibes
const data = {
  uptime: { management: "5.78%", updates: "5.78%" },
  networkMonitoring1: [
     { time: '12:56', val: 30 }, { time: '34:98', val: 40 }, { time: '23:78', val: 20 },
     { time: '34:50', val: 56 }, { time: '40:00', val: 20 }, { time: '50:00', val: 25 },
  ],
  incidentResponse: [
    { name: '2002', val1: 40, val2: 24, val3: 24 },
    { name: '2004', val1: 30, val2: 13, val3: 22 },
    { name: '2006', val1: 20, val2: 98, val3: 22 },
    { name: '2025', val1: 27, val2: 39, val3: 20 },
  ],
};

export default function ThreatDashboardClient({ lang }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0a0a0b]">
        <RefreshCcw className="w-10 h-10 animate-spin text-[#a855f7] mb-4" />
      </div>
    );
  }

  return (
    <ThreatSectionShell>
      <div className="h-full w-full max-w-[1600px] mx-auto text-gray-300 font-sans p-6 rounded-xl space-y-6">
        
        {/* Top Row Grid (4 columns combined) */}
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_2fr_2fr] lg:grid-cols-[1fr_1.5fr_1.5fr_2fr] gap-6">
          
          {/* Panel 1: Total Threats Detected */}
          <div className="bg-[#0f0f11] border border-[#262626] rounded-2xl p-6 relative overflow-hidden flex flex-col">
            <h2 className="text-sm font-semibold text-gray-400 mb-6 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" /> Total Threats Detected
            </h2>
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {/* Fake Donut Chart */}
              <div className="w-40 h-40 rounded-full border-[10px] border-[#1e1e24] border-t-[#22c55e] border-r-[#8b5cf6] border-l-[#22c55e] border-b-[#8b5cf6] flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.1)_inset]">
                <span className="text-4xl font-bold text-white">20%</span>
              </div>
            </div>
            <div className="mt-8 flex justify-center gap-4 text-xs font-medium text-gray-500">
               <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-500" /> Resolved</span>
               <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Blocked</span>
               <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]" /> Phishing</span>
            </div>
          </div>

          {/* Panel 2: System Uptime */}
          <div className="bg-[#0f0f11] border border-[#262626] rounded-2xl p-6 relative overflow-hidden">
             <div className="flex justify-between items-start mb-6">
               <h2 className="text-sm font-semibold text-gray-400">System Uptime</h2>
               <span className="text-xs text-gray-600 font-medium">Cybersecurity</span>
             </div>
             
             <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-xs text-gray-500 mb-1 font-medium">Management</p>
                  <p className="text-2xl font-bold text-gray-200">5.78%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 font-medium">System updates</p>
                  <p className="text-2xl font-bold text-gray-200">5.78%</p>
                </div>
             </div>

             <div className="relative pt-6 border-t border-[#1f1f23]">
               <div className="absolute top-0 left-10 w-4/5 h-[100px] bg-purple-600/10 blur-[40px] pointer-events-none rounded-full" />
               <div className="space-y-3 relative z-10">
                 {['Threats Increasing Daily', 'Incidents Resolved Quickly', 'Vulnerabilities Need Attention', 'Phishing Attempts Rising'].map((txt, i) => (
                   <div key={i} className="w-full bg-[#161619] border border-[#27272a] rounded-lg py-2.5 px-4 text-center text-xs font-medium text-gray-400 shadow-sm">
                     {txt}
                   </div>
                 ))}
               </div>
             </div>
          </div>

          {/* Panel 3: Network Monitoring & Suspicious Network Activities */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#0f0f11] border border-[#262626] rounded-2xl p-5 flex-1 relative overflow-hidden">
               <h2 className="text-sm font-semibold text-gray-400 mb-4">Network Monitoring</h2>
               <div className="h-[120px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.networkMonitoring1} margin={{top: 0, right: 0, left: 0, bottom: 0}}>
                       <defs>
                         <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 10}} dy={10} />
                       <Area type="monotone" dataKey="val" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorNet)" />
                    </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
            
            <div className="bg-[#0f0f11] border border-[#262626] rounded-2xl p-5 flex-1 flex flex-col justify-between">
               <h2 className="text-sm font-semibold text-gray-400 mb-4">Suspicious Network Activities</h2>
               <div className="mb-4 flex justify-start gap-4 text-[10px] font-medium text-gray-500">
                 <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-500" /> Resolved</span>
                 <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" /> Blocked</span>
                 <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Phishing</span>
               </div>
               <div className="space-y-3">
                 {[70, 40].map((perc, i) => (
                   <div key={i} className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded-full bg-[#1a1a24] flex items-center justify-center shrink-0">
                       <ShieldCheck className="w-3 h-3 text-purple-400" />
                     </div>
                     <div className="h-2 flex-1 bg-[#1e1e24] rounded-full overflow-hidden flex">
                       <div className="h-full bg-purple-500 rounded-full" style={{width: `${perc}%`}} />
                       <div className="h-full bg-gray-300 rounded-full ml-1" style={{width: '5%'}} />
                     </div>
                   </div>
                 ))}
                 <div className="flex items-center gap-3 pt-2">
                   <div className="w-6 h-6 rounded-full bg-[#1a1a24] flex items-center justify-center shrink-0">
                     <Activity className="w-3 h-3 text-purple-400" />
                   </div>
                   <span className="text-[11px] text-gray-500 font-medium">Current server health</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Panel 4: Right Side Columns */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#0f0f11] border border-[#262626] rounded-2xl p-5">
              <div className="space-y-4">
                {[
                  { label: "Weekly resolution rate", val: "5.78%", sub: "$564.86", color: "text-green-500" },
                  { label: "Threat Detection", val: "8.53%", sub: "$874.97", color: "text-green-500" },
                  { label: "Line or Area Graph", val: "8.04%", sub: "$765.34", color: "text-green-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 rounded-full h-8 bg-green-500" />
                    <div className="flex-1">
                      <p className="text-[11px] text-gray-300 font-medium">{item.label}</p>
                      <p className="text-[10px] text-gray-600">{item.sub}</p>
                    </div>
                    <div className="w-16 h-2 bg-[#1e1e24] rounded-full overflow-hidden flex">
                       <div className="h-full bg-purple-500 rounded-full" style={{width: '60%'}} />
                       <div className="h-full w-2 bg-white rounded-full ml-auto" />
                    </div>
                    <span className={`text-xs ml-4 font-bold ${item.color}`}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0f0f11] border border-[#262626] rounded-2xl p-6 flex-1 text-sm text-gray-400">
               <h2 className="text-sm font-semibold text-gray-300 mb-6">Behavior Monitoring</h2>
               <div className="space-y-4">
                 {[1,2,3].map((_, i) => (
                   <div key={i} className="flex items-center justify-between pb-4 border-b border-[#1f1f23] last:border-0 last:pb-0">
                     <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-[10px] font-medium border border-purple-500/20">Lorem</span>
                     <span className="text-[11px]">dolor sit</span>
                     <span className="text-[11px] font-bold text-green-500">5.78%</span>
                     <span className="text-[11px]">consectetuer</span>
                   </div>
                 ))}
               </div>
               
               <div className="mt-8 pt-4 flex justify-between items-center text-[10px] text-gray-500 border-t border-[#1f1f23] border-dashed">
                 <span>Cybersecurity</span>
                 <div className="flex gap-2">
                   <span className="px-2 py-0.5 bg-[#161619] rounded border border-[#27272a]">Time</span>
                   <span className="px-2 py-0.5 bg-[#161619] rounded border border-[#27272a]">Alert</span>
                   <span className="px-2 py-0.5 bg-[#161619] rounded border border-[#27272a]">Severity</span>
                   <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded border border-purple-500/30">Status</span>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Row Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_2.5fr_3fr] gap-6">
          
          {/* Panel 5: Threats Overview (Half Donut) */}
          <div className="bg-[#0f0f11] border border-[#262626] rounded-2xl p-6 relative">
            <h2 className="text-sm font-semibold text-gray-400 mb-8">Threats Overview</h2>
            <div className="relative flex justify-center items-end h-[160px] overflow-hidden -mx-4">
               {/* Semicircle */}
               <div className="w-[200px] h-[200px] rounded-full border-[12px] border-[#1e1e24] border-l-purple-600 border-b-[#8b5cf6] border-r-transparent border-t-transparent absolute bottom-0 transform -rotate-45" />
               <div className="absolute text-center pb-4">
                 <p className="text-2xl font-bold text-white">3.56%</p>
               </div>
            </div>
            <div className="mt-6 flex flex-col gap-2.5 text-[11px] font-medium text-gray-500 px-4">
               <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Threats Detected</span>
               <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> New Threats Today</span>
               <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-300" /> High Severity Threats</span>
               <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Blocked Automatically</span>
               <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Run full antivirus</span>
            </div>
          </div>

          {/* Panel 6: Incident Response */}
          <div className="bg-[#0f0f11] border border-[#262626] rounded-2xl p-6">
            <div className="flex justify-between items-start mb-6">
               <h2 className="text-sm font-semibold text-gray-400">Incident Response</h2>
               <div className="flex gap-4 text-[10px] text-gray-600">
                 <span className="text-purple-500">◆ Today</span>
                 <span>◆ Week</span>
                 <span>◆ Month</span>
               </div>
            </div>
            <div className="h-[180px] w-full opacity-80 mix-blend-screen">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.incidentResponse} margin={{top: 0, right: 0, left: 0, bottom: 0}} barGap={2} barCategoryGap={4}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 10}} dy={10} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                  <Bar dataKey="val1" fill="#4c1d95" radius={[2,2,0,0]} />
                  <Bar dataKey="val2" fill="#8b5cf6" radius={[2,2,0,0]} />
                  <Bar dataKey="val3" fill="#a855f7" radius={[2,2,0,0]} />
                  <Bar dataKey="val1" fill="#5b21b6" radius={[2,2,0,0]} />
                  <Bar dataKey="val2" fill="#6d28d9" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Columns logic matching the screenshot bottom dark bar */}
            <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-[#1f1f23] text-[9px] text-gray-600 text-center uppercase tracking-widest font-bold">
               <span>Threat<br/><span className="text-[10px] text-gray-500 tracking-normal mt-1 block">345.67</span></span>
               <span>Monitoring<br/><span className="text-[10px] text-gray-500 tracking-normal mt-1 block">476.09</span></span>
               <span>Logs<br/><span className="text-[10px] text-gray-500 tracking-normal mt-1 block">123.67</span></span>
               <span>System<br/><span className="text-[10px] text-gray-500 tracking-normal mt-1 block">345.12</span></span>
            </div>
          </div>

          {/* Panel 7 & 8: Network Monitoring Gauge & Bottom Decorative Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-[#0f0f11] border border-[#262626] rounded-2xl p-6 relative flex flex-col justify-between">
                <h2 className="text-sm font-semibold text-gray-400 mb-4">Network Monitoring</h2>
                <div className="flex-1 flex items-center justify-center flex-col relative w-full h-[120px] mb-4">
                  <div className="relative w-full h-full flex justify-center items-end">
                    <div className="absolute w-[180px] h-[90px] border-[12px] border-[#1e1e24] border-t-purple-600 border-r-purple-500 border-l-[#22c55e] rounded-t-full" />
                    <div className="bg-[#111116] border border-[#262626] rounded-xl px-3 py-1.5 z-10 -mb-2 shadow-lg z-[2]">
                       <span className="text-[10px] text-gray-400 font-medium">consectetuer adip</span>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white mt-4">$788.900</p>
                  <p className="text-[10px] text-gray-600 w-[180px] flex justify-between mt-1 font-bold"><span>20%</span><span>50%</span></p>
                </div>
             </div>
             
             <div className="grid grid-rows-3 gap-2">
                <div className="bg-[#0f0f11] border border-[#262626] rounded-xl p-3 flex justify-between items-center h-[60px]">
                   <div className="text-gray-300 font-bold text-sm">$78 <span className="text-[#a855f7] block text-[9px] font-medium leading-none mt-1">System Uptime <br/> 10:12 AM</span></div>
                   <div className="text-right text-[10px] text-gray-600">Heatmap <br/><span className="text-gray-500">345.767</span></div>
                </div>
                <div className="bg-[#0f0f11] border border-[#262626] rounded-xl p-3 flex justify-between items-center h-[60px]">
                   <div className="text-gray-300 font-bold text-sm">$35 <span className="text-[#a855f7] block text-[9px] font-medium leading-none mt-1">Login Attempts <br/> 10:45 AM</span></div>
                   <div className="text-right text-[10px] text-gray-600">Overview <br/><span className="text-gray-500">345.767</span></div>
                </div>
                <div className="bg-[#0f0f11] border border-[#262626] rounded-xl p-3 flex justify-between items-center h-[60px]">
                   <div className="text-gray-300 font-bold text-sm">$28 <span className="text-[#a855f7] block text-[9px] font-medium leading-none mt-1">Alerts Resolved <br/> 11:30 AM</span></div>
                   <div className="text-right text-[10px] text-gray-600">Pie Chart <br/><span className="text-gray-500">345.767</span></div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </ThreatSectionShell>
  );
}