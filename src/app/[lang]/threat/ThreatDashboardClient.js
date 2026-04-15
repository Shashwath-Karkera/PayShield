"use client";

import React from "react";
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

// MOCK DATA FOR VISUALIZATIONS
const attackTrafficData = [
  { time: '00:00', ddos: 120, botnet: 45, sql: 20 },
  { time: '04:00', ddos: 300, botnet: 80, sql: 35 },
  { time: '08:00', ddos: 150, botnet: 120, sql: 50 },
  { time: '12:00', ddos: 600, botnet: 200, sql: 90 },
  { time: '16:00', ddos: 450, botnet: 150, sql: 110 },
  { time: '20:00', ddos: 220, botnet: 90, sql: 40 },
  { time: '24:00', ddos: 180, botnet: 60, sql: 30 },
];

const attackOriginsData = [
  { name: 'APJ', value: 45 },
  { name: 'EMEA', value: 30 },
  { name: 'AMER', value: 15 },
  { name: 'LATAM', value: 10 }
];

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899'];

const recentLogs = [
  { id: 'EV-1029', type: 'SQLi Attempt', ip: '192.168.1.105', status: 'Blocked', time: '2 mins ago', severity: 'high' },
  { id: 'EV-1028', type: 'Brute Force', ip: '45.33.21.99', status: 'Blocked', time: '14 mins ago', severity: 'high' },
  { id: 'EV-1027', type: 'Anomalous Login', ip: '103.44.55.12', status: 'Flagged', time: '1 hr ago', severity: 'medium' },
  { id: 'EV-1026', type: 'Port Scan', ip: '8.8.4.4', status: 'Dropped', time: '3 hrs ago', severity: 'low' },
  { id: 'EV-1025', type: 'Data Exfil', ip: '185.33.2.1', status: 'Intercepted', time: '4 hrs ago', severity: 'critical' },
];

export default function ThreatDashboardClient() {
  return (
    <ThreatSectionShell
      title="Security Posture Dashboard"
      subtitle="Real-time analytical view of infrastructure health and active threats."
    >
      <div className="space-y-8 lg:space-y-10">
          {/* Header */}
          <div className="section mb-0 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Operational Health</h2>
              <p className="text-sm text-slate-500 mt-1">Live telemetry from edge, application, and core payment services.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-8 items-center rounded-full border border-emerald-200 bg-emerald-100 px-3 text-sm font-medium text-emerald-700">
                <Activity className="w-4 h-4 mr-2" /> System Healthy
              </span>
              <span className="inline-flex h-8 items-center rounded-full border border-indigo-200 bg-indigo-100 px-3 text-sm font-medium text-indigo-700">
                <ShieldCheck className="w-4 h-4 mr-2" /> Protection Online
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
            {[
              { label: "Threats Blocked (24h)", value: "24,892", icon: Ban, color: "text-rose-600", bg: "bg-rose-100", trend: "+12.5%" },
              { label: "Active Connections", value: "8,349", icon: ActivitySquare, color: "text-blue-600", bg: "bg-blue-100", trend: "+4.2%" },
              { label: "Infrastructure Nodes", value: "142", icon: Server, color: "text-indigo-600", bg: "bg-indigo-100", trend: "0%" },
              { label: "Anomalies Detected", value: "18", icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-100", trend: "-2.1%" },
            ].map((stat, i) => (
              <div key={i} className="content-card flex min-h-34 items-center gap-4 rounded-3xl p-6">
                <div className={`rounded-xl p-3 ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <p className="text-sm font-medium leading-snug text-slate-500">{stat.label}</p>
                  <div className="mt-2 flex items-end gap-2">
                    <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                    <span className={`text-xs font-semibold ${stat.trend.startsWith('+') ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
            
            {/* Area Chart: Traffic Over Time */}
            <div className="content-card rounded-3xl p-6 2xl:col-span-2 lg:p-7">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Attack Velocity & Vectors</h3>
                <p className="text-sm text-slate-500">Volumetric analysis of incoming malicious traffic patterns.</p>
              </div>
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attackTrafficData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    <Area type="monotone" dataKey="botnet" stroke="#ec4899" strokeWidth={2} fill="none" />
                    <Area type="monotone" dataKey="sql" stroke="#f59e0b" strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Attack Origins */}
            <div className="content-card flex min-h-90 flex-col rounded-3xl p-6 lg:p-7">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Regional Threats</h3>
                <p className="text-sm text-slate-500">Distribution of source geography.</p>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attackOriginsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={84}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {attackOriginsData.map((entry, index) => (
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
                {attackOriginsData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm font-medium text-slate-700">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="content-card overflow-hidden rounded-3xl p-0">
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
                  {recentLogs.map((log) => (
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
                          ${log.status === 'Blocked' ? 'bg-emerald-100 text-emerald-700' : ''}
                          ${log.status === 'Dropped' ? 'bg-slate-100 text-slate-700' : ''}
                          ${log.status === 'Flagged' ? 'bg-amber-100 text-amber-700' : ''}
                          ${log.status === 'Intercepted' ? 'bg-indigo-100 text-indigo-700' : ''}
                        `}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{log.time}</td>
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
