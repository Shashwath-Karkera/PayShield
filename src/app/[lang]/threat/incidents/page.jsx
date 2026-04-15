"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon, CheckCircle2, Search, Clock, ShieldAlert } from "lucide-react";
import ThreatSectionShell from "../ThreatSectionShell";

const INCIDENTS = [
  {
    id: "INC-001",
    type: "DDoS Attack",
    status: "Active",
    severity: "Critical",
    source: "Multiple (Botnet)",
    target: "Payment Gateway",
    time: "2 mins ago",
    description: "A sustained volumetric attack exceeding 50 Gbps targeting the main payment processing endpoints.",
  },
  {
    id: "INC-002",
    type: "SQL Injection Request",
    status: "Mitigated",
    severity: "High",
    source: "IP: 192.168.1.105",
    target: "User Database Auth",
    time: "15 mins ago",
    description: "Multiple malformed queries attempting to bypass authentication via classic SQLi patterns.",
  },
  {
    id: "INC-003",
    type: "Account Takeover",
    status: "Investigating",
    severity: "Medium",
    source: "IP: 203.0.113.42",
    target: "Customer Portals",
    time: "1 hour ago",
    description: "Credential stuffing attempt utilizing breached password lists across several retail accounts.",
  },
  {
    id: "INC-004",
    type: "API Rate Limit Exceeded",
    status: "Mitigated",
    severity: "Low",
    source: "IP: 198.51.100.14",
    target: "Transactions API",
    time: "3 hours ago",
    description: "Unusually high frequency of read requests triggering automated temporary IP ban.",
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "Active": return "bg-red-50 text-red-700 border-red-200";
    case "Investigating": return "bg-orange-50 text-orange-700 border-orange-200";
    case "Mitigated": return "bg-green-50 text-green-700 border-green-200";
    default: return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "Active": return <ShieldAlert className="w-4 h-4 text-red-500" />;
    case "Investigating": return <Clock className="w-4 h-4 text-orange-500" />;
    case "Mitigated": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    default: return <AlertOctagon className="w-4 h-4 text-slate-500" />;
  }
};

export default function IncidentsPage() {
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIncidents = INCIDENTS.filter(inc => {
    const matchesFilter = filter === "All" || inc.status === filter;
    const matchesSearch = inc.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inc.target.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <ThreatSectionShell
      title="Incident Response"
      subtitle="Track, analyze, and mitigate active security events and historical threats."
    >
      <div className="flex flex-col w-full gap-8 lg:gap-10">
        
        {/* Controls Bar */}
        <div className="content-card flex w-full flex-col items-stretch justify-between gap-4 rounded-3xl p-5 lg:flex-row lg:items-center lg:p-7">
          
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors" />
            <input
              type="text"
              placeholder="Search by ID, Type, or Target..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 placeholder:font-medium placeholder:text-slate-400 transition-all focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex w-full shrink-0 rounded-2xl border border-slate-200/50 bg-slate-100 p-1.5 lg:w-auto">
            {["All", "Active", "Investigating", "Mitigated"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none rounded-xl px-4 py-2.5 text-sm font-semibold transition-all lg:px-6 ${
                  filter === f 
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 border border-transparent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Incident Grid */}
        <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2 lg:gap-7">
          <AnimatePresence mode="popLayout">
            {filteredIncidents.length === 0 ? (
              <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="content-card col-span-1 xl:col-span-2 flex flex-col items-center justify-center rounded-3xl py-20 text-center align-middle"
              >
                 <ShieldAlert className="w-16 h-16 text-slate-300 mb-6" />
                <h3 className="mb-2 text-lg font-bold text-slate-900">No Incidents Found</h3>
                 <p className="mx-auto max-w-md text-sm font-medium text-slate-500">No threats match the current search or filter criteria. The perimeter is secure.</p>
              </motion.div>
            ) : (
              filteredIncidents.map((incident) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={incident.id}
                  className="content-card flex w-full flex-col overflow-hidden rounded-3xl p-0 transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/50 p-6 transition-colors group-hover:bg-white lg:p-7">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] shadow-sm ${getStatusColor(incident.status)}`}>
                          {getStatusIcon(incident.status)}
                          {incident.status}
                        </span>
                        <span className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          {incident.severity}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold leading-tight text-slate-900">{incident.type}</h3>
                      <p className="mt-1 font-mono text-xs font-medium text-slate-500">{incident.id}</p>
                    </div>
                    <div className="text-right">
                      <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {incident.time}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-white p-6 lg:p-7">
                    <p className="mb-6 text-sm font-medium leading-relaxed text-slate-600">
                      {incident.description}
                    </p>
                    
                    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
                      <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Source Origin</p>
                        <p className="inline-block w-full truncate rounded border border-slate-200 bg-white px-2 py-1 font-mono text-xs text-slate-800" title={incident.source}>
                          {incident.source}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Target Endpoint</p>
                        <p className="inline-block w-full truncate rounded border border-slate-200 bg-white px-2 py-1 font-mono text-xs text-slate-800" title={incident.target}>
                          {incident.target}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 rounded-b-3xl border-t border-slate-100 bg-slate-50/80 p-5 lg:p-6">
                    <button className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900">
                      View Logs
                    </button>
                    <button className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-all hover:bg-indigo-700">
                      Take Action
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </ThreatSectionShell>
  );
}

