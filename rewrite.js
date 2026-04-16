const fs = require('fs');
let code = fs.readFileSync('PayShield/src/app/[lang]/threat/ThreatDashboardClient.js', 'utf8');
const startIdx = code.indexOf('{!showLoader && (');
if (startIdx > -1) {
  code = code.substring(0, startIdx);
  const newCode = `{!showLoader && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
             <div className="lg:col-span-4 rounded-xl shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-white/10 p-2 bg-slate-900/30 backdrop-blur-md">
                <ThreatGlobe />
             </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
              <div className="rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.1)] ring-1 ring-white/10 p-6 bg-slate-900/30 backdrop-blur-md min-h-[300px]">
                <h3 className="text-lg font-bold text-cyan-300"><Terminal className="inline w-5 h-5 mr-2" />LIVE_EVENT_TERMINAL</h3>
                <div className="mt-4 font-mono text-sm text-emerald-400 space-y-2">
                   <p className="animate-pulse">{'>'} INCOMING TRAFFIC NORMAL...</p>
                   <p>{'>'} SCANNED 48,230 PACKETS IN 0.4s.</p>
                   <p className="text-rose-400 opacity-80">{'>'} BLOCKED: SQL INJECTION [192.168.x.x]</p>
                </div>
              </div>
          </div>

        </motion.div>
      )}
    </ThreatSectionShell>
  );
}
`;
  fs.writeFileSync('PayShield/src/app/[lang]/threat/ThreatDashboardClient.js', code + newCode);
  console.log("Done");
} else {
  console.log("Could not find start index");
}
