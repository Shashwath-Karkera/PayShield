"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Database, Terminal, FileCode2, Clock, Filter, Key, Network, Crosshair } from "lucide-react";
import ThreatSectionShell from "../ThreatSectionShell";

export default function ForensicsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const simulateSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    
    setIsSearching(true);
    setResults([]);
    
    try {
      const res = await fetch("/api/threat-dashboard");
      const json = await res.json();
      
      const q = query.toLowerCase();
      // Filter recentEvents by query matches
      const matches = (json.recentEvents || []).filter(evt => 
        evt.id.toLowerCase().includes(q) || 
        evt.ip.toLowerCase().includes(q) || 
        evt.type.toLowerCase().includes(q) || 
        evt.route.toLowerCase().includes(q)
      );

      setResults(matches.map((evt, idx) => ({
        id: idx + 1,
        type: "Network",
        source: "WAF Logs",
        match: query,
        time: evt.date,
        details: `Intercepted [${evt.action}] ${evt.type} from ${evt.ip} targeting ${evt.route}. ID: ${evt.id}`
      })));
    } catch (err) {
      console.error(err);
    }
    
    setIsSearching(false);
  };

  const getIcon = (type) => {
    switch (type) {
      case "Log": return <Terminal className="w-4 h-4 text-indigo-500" />;
      case "Database": return <Database className="w-4 h-4 text-emerald-500" />;
      case "Network": return <Network className="w-4 h-4 text-rose-500" />;
      default: return <FileCode2 className="w-4 h-4 text-slate-500" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "Log": return "bg-indigo-50 border-indigo-200 text-indigo-700";
      case "Database": return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "Network": return "bg-rose-50 border-rose-200 text-rose-700";
      default: return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  return (
    <ThreatSectionShell
      title="Threat Forensics"
      subtitle="Deep scan capabilities across all system logs, transaction records, and network telemetry."
    >
      <div className="flex w-full flex-col gap-8 lg:gap-10">

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="content-card rounded-3xl p-3 lg:p-4"
        >
           <form onSubmit={simulateSearch} className="flex flex-col gap-3 sm:flex-row">
             <div className="relative flex h-14 flex-1 items-center lg:h-16">
                <Search className="pointer-events-none absolute left-6 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter IP, Hash, ID, or Query Pattern..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-full w-full rounded-2xl border-none bg-transparent py-0 pl-14 pr-6 text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
                <button type="button" className="absolute right-4 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                  <Filter className="w-5 h-5" />
                </button>
             </div>

             <div className="flex h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 p-1.5 sm:w-auto sm:shrink-0 lg:h-16">
               <button
                  type="submit" 
                  disabled={isSearching || !query}
                className="flex h-full w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300 sm:w-auto"
               >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    "Init Scan"
                  )}
               </button>
             </div>
          </form>
        </motion.div>

        {/* Filters Grid */}
          <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.2 }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 lg:gap-4"
        >
           {[
             { name: "Timeline", icon: Clock, val: "Last 24 Hours", active: true },
             { name: "Data Source", icon: Database, val: "All Nodes", active: false },
             { name: "Match Type", icon: Key, val: "Exact Match", active: false },
             { name: "Confidence", icon: Target, val: "> 90%", active: false },
           ].map(f => (
             <div key={f.name} className={`content-card flex min-h-22 items-center gap-3 rounded-2xl p-4 ${f.active ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200'} cursor-pointer transition-colors hover:border-indigo-300`}>
               <div className={`shrink-0 rounded-xl p-2 ${f.active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
                 <f.icon className="w-4 h-4" />
               </div>
               <div className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden">
                 <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${f.active ? 'text-indigo-400' : 'text-slate-400'}`}>{f.name}</p>
                 <p className={`mt-1 truncate text-sm font-bold leading-snug ${f.active ? 'text-indigo-900' : 'text-slate-900'}`}>{f.val}</p>
               </div>
             </div>
           ))}
        </motion.div>

           <div className="w-full pt-1">
           {isSearching ? (
             <div className="w-full py-24 flex flex-col items-center justify-center">
                 <div className="flex gap-2 mb-6">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scaleY: [1, 2, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1.5 h-6 bg-indigo-500 rounded-full"
                      />
                    ))}
                 </div>
                 <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-900">Triangulating Signal</p>
                 <p className="mt-2 text-sm font-medium text-slate-500">Searching across live telemetry</p>
             </div>
           ) : results.length > 0 ? (
             <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">Scan Results</h3>
                  <span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    {results.length} Nodes Found
                  </span>
                </div>
                
                {results.map((res, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={res.id} 
                    className="content-card rounded-3xl p-6 transition-shadow lg:p-7"
                  >
                    <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                       <div className="flex min-w-0 items-center gap-3">
                         <span className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] shadow-sm ${getColor(res.type)}`}>
                           {getIcon(res.type)}
                           {res.type}
                         </span>
                         <span className="truncate text-sm font-bold text-slate-900">{res.source}</span>
                       </div>
                       <span className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 font-mono text-xs font-medium text-slate-500">
                         <Clock className="w-3.5 h-3.5 text-slate-400" />
                         {res.time}
                       </span>
                    </div>
                    
                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-inner overflow-x-auto custom-scrollbar">
                      <code className="block whitespace-pre-wrap wrap-break-word font-mono text-sm leading-relaxed text-indigo-300">
                        {res.details.split(query).map((part, index, arr) => (
                           <React.Fragment key={index}>
                             {part}
                             {index < arr.length - 1 && (
                               <span className="bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-1 rounded mx-0.5 font-bold">
                                 {query}
                               </span>
                             )}
                           </React.Fragment>
                        ))}
                      </code>
                    </div>
                  </motion.div>
                ))}
             </div>
           ) : query && !isSearching ? (
             <div className="content-card flex w-full flex-col items-center justify-center rounded-3xl py-24 text-center">
                 <Search className="w-16 h-16 text-slate-300 mb-6" />
                 <h3 className="mb-2 text-lg font-bold text-slate-900">Zero Matches</h3>
                 <p className="mx-auto max-w-md text-sm font-medium text-slate-500">No forensic evidence matching &quot;{query}&quot; was found across active databases and telemetry logs.</p>
             </div>
           ) : null}
        </div>
      </div>
    </ThreatSectionShell>
  );
}

// Icon helper since lucide doesn't export 'Target' natively without alias usually, substituting with Crosshair in intent, but using standard if available.
function Target(props) {
  return <Crosshair {...props} />;
}

