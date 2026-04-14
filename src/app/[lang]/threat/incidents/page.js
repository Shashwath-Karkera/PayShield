"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon, Filter, CheckCircle2, XCircle, Search, Clock, ShieldAlert } from "lucide-react";
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
      <div className="flex flex-col w-full gap-6 lg:gap-8">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 lg:p-6 rounded-3xl border border-slate-200 shadow-sm w-full">
          
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by ID, Type, or Target..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900   rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto shrink-0 border border-slate-200/50">
            {["All", "Active", "Investigating", "Mitigated"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none px-4 lg:px-6 py-2.5 rounded-xl     transition-all ${
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 w-full">
          <AnimatePresence mode="popLayout">
            {filteredIncidents.length === 0 ? (
              <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="col-span-1 xl:col-span-2 text-center py-20 bg-white border border-slate-200 shadow-sm rounded-3xl flex flex-col items-center justify-center align-middle"
              >
                 <ShieldAlert className="w-16 h-16 text-slate-300 mb-6" />
                 <h3 className="  text-slate-900 mb-2">No Incidents Found</h3>
                 <p className="text-slate-500 font-medium max-w-md mx-auto ">No threats match the current search or filter criteria. The perimeter is secure.</p>
              </motion.div>
            ) : (
              filteredIncidents.map((incident, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={incident.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-slate-300 transition-all cursor-pointer w-full"
                >
                  <div className="p-5 lg:p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 group-hover:bg-white transition-colors">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border text-[10px]    shadow-sm ${getStatusColor(incident.status)}`}>
                          {getStatusIcon(incident.status)}
                          {incident.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200  ">
                          {incident.severity}
                        </span>
                      </div>
                      <h3 className="  text-slate-900 leading-tight">{incident.type}</h3>
                      <p className=" font-mono font-medium text-slate-500 mt-1">{incident.id}</p>
                    </div>
                    <div className="text-right">
                      <span className=" font-bold text-slate-500 bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-xl   flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {incident.time}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 lg:p-6 flex-1 bg-white">
                    <p className="  text-slate-600 leading-relaxed mb-6">
                      {incident.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div>
                        <p className="text-[10px]    text-slate-400 mb-1">Source Origin</p>
                        <p className=" font-mono  text-slate-800 bg-white px-2 py-1 rounded inline-block border border-slate-200 w-full truncate" title={incident.source}>
                          {incident.source}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px]    text-slate-400 mb-1">Target Endpoint</p>
                        <p className=" font-mono  text-slate-800 bg-white px-2 py-1 rounded inline-block border border-slate-200 w-full truncate" title={incident.target}>
                          {incident.target}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 lg:p-5 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 rounded-b-3xl">
                    <button className="px-5 py-2.5  font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl shadow-sm transition-all  ">
                      View Logs
                    </button>
                    <button className="px-5 py-2.5  font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/20 transition-all  ">
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

