import React from 'react';

export default function ThreatLayout({ children }) {
  // Ultra-hacker dark themed global layout - strips out main site nav wrapper
  return (
    <div className="min-h-screen bg-black text-green-500 font-mono overflow-hidden">
      {/* CRT scanline effect overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"></div>
      
      {/* Background vignette */}
      <div className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-80"></div>
      
      <main className="relative z-10 w-full h-full flex flex-col">
        {children}
      </main>
    </div>
  );
}
