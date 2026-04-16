const fs = require('fs');
let code = fs.readFileSync('PayShield/src/app/[lang]/threat/ThreatDashboardClient.js', 'utf8');

  const newCode = `      {!showLoader && (
        <motion.div 
          initial={{ opacity: 0, z: -100, scale: 0.95 }}
          animate={{ opacity: 1, z: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6 relative" style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
        >
          <div className="fixed inset-0 pointer-events-none opacity-20 bg-slate-950 z-[-1] min-h-screen">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)_translateY(-100px)_translateZ(200px)] origin-bottom" />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10 pt-4">
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">Security Posture Dashboard</h1>
              <p className="text-cyan-200/60 mt-1 font-mono text-sm tracking-wide">SYSTEM REAL-TIME HEALTH & THREAT ANALYSIS STREAMS</p>
            </div>
            <div className="flex gap-3">
              <motion.span whileHover={{ scale: 1.05 }} className="inline-flex items-center px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-sm font-mono shadow-[0_0_10px_rgba(16,185,129,0.2)] backdrop-blur-sm">
                <Activity className="w-4 h-4 mr-2" /> SYSTEM_OPT_OK
              </motion.span>
              <motion.span whileHover={{ scale: 1.05 }} className="inline-flex items-center px-3 py-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-sm font-mono shadow-[0_0_10px_rgba(99,102,241,0.2)] backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4 mr-2" /> CORE_ONLINE
              </motion.span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {[
              { label: "Threats Blocked (24h)", value: "24,892", icon: Ban, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", borderHover: "hover:border-rose-400/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]", trend: "+12.5%" },
              { label: "Active Connections", value: "8,349", icon: ActivitySquare, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", borderHover: "hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]", trend: "+4.2%" },
              { label: "Infrastructure Nodes", value: "142", icon: Server, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20", borderHover: "hover:border-indigo-400/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]", trend: "0%" },
              { label: "Anomalies Confirmed", value: "18", icon: ShieldAlert, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", borderHover: "hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]", trend: "-2.1%" },
            ].map((stat, i) => (
              <motion.div 
                whileHover={{ scale: 1.02, rotateX: 5, rotateY: 5, zIndex: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ perspective: 1000 }}
                key={i} 
                className={\`bg-slate-900/40 p-5 rounded-2xl border \${stat.bg} \${stat.borderHover} backdrop-blur-xl flex items-start gap-4 transition-all duration-300\`}
              >
                <div className={\`p-3 rounded-xl bg-black/40 border border-white/5\`}>
                  <stat.icon className={\`w-6 h-6 \${stat.color} drop-shadow-[0_0_8px_currentColor]\`} />
                </div>
                <div>
                  <p className="text-xs font-mono tracking-widest text-slate-400 uppercase">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-md">{stat.value}</h3>
                    <span className={\`text-xs font-mono font-bold \${stat.trend.startsWith('+') ? 'text-rose-400 drop-shadow-[0_0_5px_currentColor]' : 'text-emerald-400 drop-shadow-[0_0_5px_currentColor]'}\`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
             <div className="lg:col-span-3 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-white/10 overflow-hidden bg-slate-950">
                <ThreatGlobe />
             </div>
             
             {/* Terminal placeholder for logs */}
             <motion.div 
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="lg:col-span-3 bg-slate-900/40 rounded-2xl border border-indigo-500/20 backdrop-blur-xl shadow-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all overflow-hidden"
            >
              <div className="p-6 border-b border-indigo-500/10 bg-black/20 flex justify-between">
                <h3 className="text-lg font-bold text-white tracking-wide flex items-center"><Terminal className="w-5 h-5 mr-2 text-indigo-400" />Live Event Terminal</h3>
              </div>
              <div className="p-6 font-mono text-sm text-emerald-400 space-y-2 h-[200px] overflow-y-auto w-full bg-black/50">
                  <p className="animate-pulse">{'>'} INCOMING TRAFFIC NORMAL...</p>
                  <p>{'>'} SCANNED 48,230 PACKETS IN 0.4s.</p>
                  <p className="text-rose-400 opacity-80">{'>'} BLOCKED: SQL INJECTION [192.168.109.11] - SOURCE: MOSCOW</p>
                  <p>{'>'} REROUTING THREAT VECTOR...</p>
                  <p>{'>'} SECURE CONNECTION ESTABLISHED.</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </ThreatSectionShell>
  );
}
`;
  fs.writeFileSync('PayShield/src/app/[lang]/threat/ThreatDashboardClient.js', code + "\n" + newCode);
  console.log("Done appending");
