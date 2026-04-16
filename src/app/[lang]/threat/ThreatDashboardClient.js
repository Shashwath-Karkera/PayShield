"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  Activity,
  Server,
  Terminal,
  ArrowUpRight,
  ShieldCheck,
  Ban,
  ActivitySquare,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import ThreatSectionShell from "./ThreatSectionShell";

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899'];

export default function ThreatDashboardClient() {
  const [dashboardData, setDashboardData] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const lastEventIdRef = useRef(null);

  const enableAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance("Active defense audio monitoring engaged.");
      window.speechSynthesis.speak(u);
      setAudioEnabled(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/threat-dashboard");
        const data = await res.json();
        
        if (data && data.recentEvents && data.recentEvents.length > 0) {
          const latestEvent = data.recentEvents[0];
          
          // Voice Agent Trigger for new attacks
          if (lastEventIdRef.current && lastEventIdRef.current !== latestEvent.id) {
            triggerVoiceAgent(latestEvent);
          }
          lastEventIdRef.current = latestEvent.id;
        }

        setDashboardData(data);
      } catch (err) {
        console.error("Failed to fetch threat data:", err);
      }
    };

    fetchData(); // initial fetch
    const pID = setInterval(fetchData, 1500);

    return () => clearInterval(pID);
  }, [audioEnabled]);

  const triggerVoiceAgent = (event) => {
    if (!('speechSynthesis' in window) || !audioEnabled) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const msg = `ALERT ALERT ALERT. PAYSHIELD DEFENSE MECHANISM ACTIVATED. THERE WAS A CYBERSECURITY ATTACK ON PAYSHIELD. 
    TYPE OF ATTACK : ${event.type}. 
    TIMESTAMP OF ATTACK : ${event.date}. 
    ROUTES ATTACKED : ${event.route || 'SYSTEM CORE'}. 
    IP ADDRESS OF ATTACKER : ${event.ip}. 
    RESULT : PAYSHIELD ACCESS IS BLOCKED FOR HACKER FOR NEXT 24 HOURS.`;

    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.voiceURI = 'Google UK English Female'; 
    utterance.volume = 1;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    // Load available voices and pick a serious/robotic or British female voice for dramatic effect if available
    const voices = window.speechSynthesis.getVoices();
    const systemVoice = voices.find(v => v.name.includes("Google UK English") || v.name.includes("Samantha"));
    if (systemVoice) utterance.voice = systemVoice;

    window.speechSynthesis.speak(utterance);
  };

  if (!dashboardData) return null; // Wait for initial load

  return (
    <ThreatSectionShell
      title="Security Posture Dashboard"
      subtitle="Real-time analytical view of infrastructure health and active threats."
      showEntryLoader={true}
    >
        <div className="space-y-12">
          {/* Header */}
          <div className="section mb-0 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Operational Health</h2>
              <p className="text-sm text-slate-500 mt-1">Live telemetry from edge, application, and core payment services.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={enableAudio} 
                className={`inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors ${
                  audioEnabled ? "border-red-500 bg-red-500/10 text-red-600 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ShieldAlert className="w-4 h-4 mr-2" /> 
                {audioEnabled ? "Audio Alarm: ARMED" : "Enable Audio Alarm"}
              </button>
              <span className="inline-flex h-8 items-center rounded-full border border-emerald-200 bg-emerald-100 px-3 text-sm font-medium text-emerald-700">
                <Activity className="w-4 h-4 mr-2" /> System Healthy
              </span>
              <span className="inline-flex h-8 items-center rounded-full border border-indigo-200 bg-indigo-100 px-3 text-sm font-medium text-indigo-700">
                <ShieldCheck className="w-4 h-4 mr-2" /> Protection Online
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-4">
            {[
              { label: "Threats Captured", value: dashboardData.overview.totalThreats.toLocaleString(), icon: Ban, color: "text-rose-600", bg: "bg-rose-100", trend: `${dashboardData.recentEvents.length} live` },
              { label: "Unique Source IPs", value: dashboardData.overview.activeConnections.toLocaleString(), icon: ActivitySquare, color: "text-blue-600", bg: "bg-blue-100", trend: "live" },
              { label: "Targeted Routes", value: dashboardData.overview.serversOnline, icon: Server, color: "text-indigo-600", bg: "bg-indigo-100", trend: "live" },
              { label: "Open Incidents", value: dashboardData.overview.incidents, icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-100", trend: "live" },
            ].map((stat, i) => (
              <div key={i} className="content-card flex min-h-34 items-center gap-5 rounded-3xl p-6 shadow-sm border border-slate-200">
                <div className={`rounded-xl p-3 ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <p className="text-sm font-medium leading-snug text-slate-500">{stat.label}</p>
                  <div className="mt-2 flex items-end gap-2">
                    <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                    <span className="text-xs font-semibold text-emerald-600">
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 gap-8 2xl:grid-cols-3">
            
            {/* Area Chart: Traffic Over Time */}
            <div className="content-card rounded-3xl p-6 2xl:col-span-2 lg:p-7 shadow-sm border border-slate-200">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Attack Velocity & Vectors</h3>
                <p className="text-sm text-slate-500">Volumetric analysis of incoming malicious traffic patterns.</p>
              </div>
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.threatsOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDdos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Area type="monotone" dataKey="ddos" name="DDoS" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorDdos)" />
                    <Area type="monotone" dataKey="botnet" name="Botnet" stroke="#ec4899" strokeWidth={2} fill="none" />
                    <Area type="monotone" dataKey="firewall" name="Firewall blocks" stroke="#f59e0b" strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Attack Origins */}
            <div className="content-card flex min-h-90 flex-col rounded-3xl p-6 lg:p-7 shadow-sm border border-slate-200">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Regional Threats</h3>
                <p className="text-sm text-slate-500">Distribution of source geography.</p>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.topGeographies}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={84}
                      paddingAngle={5}
                      dataKey="percentage"
                      nameKey="country"
                      stroke="none"
                    >
                      {dashboardData.topGeographies.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Volume']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-4">
                {dashboardData.topGeographies.map((entry, index) => (
                  <div key={entry.country} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm font-medium text-slate-700">{entry.country}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="content-card overflow-hidden rounded-3xl p-0 shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Security Event Log</h3>
                <p className="text-sm text-slate-500">Most recent automated mitigations and alerts.</p>
              </div>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                View All <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3 border-b border-slate-200">Event ID</th>
                    <th className="px-6 py-3 border-b border-slate-200">Classification</th>
                    <th className="px-6 py-3 border-b border-slate-200">Source IP</th>
                    <th className="px-6 py-3 border-b border-slate-200">Status</th>
                    <th className="px-6 py-3 border-b border-slate-200">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboardData.recentEvents.length === 0 ? (
                    <tr>
                      <td className="px-6 py-8 text-center text-slate-500" colSpan="5">
                        No live threat events recorded yet. Send a request to `/api/security/log` to populate the feed.
                      </td>
                    </tr>
                  ) : dashboardData.recentEvents.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{log.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700">{log.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">{log.ip}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium
                          ${log.action === 'Blocked' ? 'bg-emerald-100 text-emerald-700' : ''}
                          ${log.action === 'Dropped' ? 'bg-slate-100 text-slate-700' : ''}
                          ${log.action === 'Flagged' ? 'bg-amber-100 text-amber-700' : ''}
                          ${log.action === 'Intercepted' ? 'bg-indigo-100 text-indigo-700' : ''}
                          ${log.action === 'Mitigated' ? 'bg-blue-100 text-blue-700' : ''}
                          ${log.action === 'Quarantined' ? 'bg-rose-100 text-rose-700' : ''}
                        `}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{log.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </ThreatSectionShell>
  );
}
