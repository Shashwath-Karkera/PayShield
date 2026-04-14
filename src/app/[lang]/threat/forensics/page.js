"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Database, Terminal, FileCode2, Clock, Filter, Key, Network } from "lucide-react";
import ThreatSectionShell from "../ThreatSectionShell";

export default function ForensicsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const simulateSearch = (e) => {
    e.preventDefault();
    if (!query) return;
    
    setIsSearching(true);
    setResults([]);
    
    setTimeout(() => {
      setResults([
        { id: 1, type: "Log", source: "Auth Service", match: query, time: "2023-11-20 14:32:01 UTC", details: `Failed login attempt matched pattern '${query}'.` },
        { id: 2, type: "Database", source: "Users Table", match: query, time: "2023-11-20 12:15:44 UTC", details: `Suspicious query executed containing '${query}' in WHERE clause.` },
        { id: 3, type: "Network", source: "WAF Logs", match: query, time: "2023-11-19 09:01:22 UTC", details: `Blocked payload matching signature for '${query}'.` },
      ]);
      setIsSearching(false);
    }, 1500);
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
      <div className="flex flex-col w-full gap-6 lg:gap-8 max-w-5xl mx-auto">
        
        {/* Search Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-2 lg:p-3"
        >
          <form onSubmit={simulateSearch} className="flex flex-col sm:flex-row gap-3">
             <div className="flex-1 relative flex items-center">
                <Search className="absolute left-6 w-6 h-6 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter IP, Hash, ID, or Query Pattern..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-none  lg: font-bold text-slate-900 rounded-2xl pl-16 pr-6 py-4 lg:py-5 focus:outline-none focus:ring-0 placeholder:text-slate-300 placeholder:"
                />
                <button type="button" className="absolute right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  <Filter className="w-5 h-5" />
                </button>
             </div>
             
             <div className="flex bg-slate-50 p-1.5 rounded-2xl sm:w-auto w-full sm:shrink-0 border border-slate-100">
               <button 
                  type="submit" 
                  disabled={isSearching || !query}
                  className="w-full sm:w-auto px-8 py-4 lg:py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white     rounded-xl shadow-sm shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
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
           className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
        >
           {[
             { name: "Timeline", icon: Clock, val: "Last 24 Hours", active: true },
             { name: "Data Source", icon: Database, val: "All Nodes", active: false },
             { name: "Match Type", icon: Key, val: "Exact Match", active: false },
             { name: "Confidence", icon: Target, val: "> 90%", active: false },
           ].map(f => (
             <div key={f.name} className={`flex items-center gap-3 p-3 lg:p-4 rounded-2xl border ${f.active ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200'} cursor-pointer hover:border-indigo-300 transition-colors`}>
               <div className={`p-2 rounded-xl ${f.active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-500'} shrink-0`}>
                 <f.icon className="w-4 h-4" />
               </div>
               <div className="overflow-hidden">
                 <p className={`text-[10px]    ${f.active ? 'text-indigo-400' : 'text-slate-400'}`}>{f.name}</p>
                 <p className={` font-bold truncate mt-0.5 ${f.active ? 'text-indigo-900' : 'text-slate-900'}`}>{f.val}</p>
               </div>
             </div>
           ))}
        </motion.div>

        {/* Results Area */}
        <div className="w-full">
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
                 <p className="  text-indigo-900  tracking-[0.2em]">Triangulating Signal</p>
                 <p className=" font-medium text-slate-500 mt-2">Searching across 2.4TB of telemetry</p>
             </div>
           ) : results.length > 0 ? (
             <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <h3 className="  text-slate-900">Scan Results</h3>
                  <span className=" font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200  ">
                    {results.length} Nodes Found
                  </span>
                </div>
                
                {results.map((res, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={res.id} 
                    className="bg-white rounded-2xl border border-slate-200 p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                       <div className="flex items-center gap-3">
                         <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px]    shadow-sm ${getColor(res.type)}`}>
                           {getIcon(res.type)}
                           {res.type}
                         </span>
                         <span className=" font-bold text-slate-900">{res.source}</span>
                       </div>
                       <span className=" font-mono font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-2">
                         <Clock className="w-3.5 h-3.5 text-slate-400" />
                         {res.time}
                       </span>
                    </div>
                    
                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-inner overflow-x-auto custom-scrollbar">
                      <code className=" font-mono text-indigo-300">
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
             <div className="w-full text-center py-24 bg-white border border-slate-200 shadow-sm rounded-3xl flex flex-col items-center justify-center">
                 <Search className="w-16 h-16 text-slate-300 mb-6" />
                 <h3 className="  text-slate-900 mb-2">Zero Matches</h3>
                 <p className="text-slate-500 font-medium max-w-md mx-auto ">No forensic evidence matching &quot;{query}&quot; was found across active databases and telemetry logs.</p>
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
import { Crosshair } from "lucide-react";

