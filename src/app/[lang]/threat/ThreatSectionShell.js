"use client";

import React, { useState, useEffect } from "react";
import { Shield, Lock, Terminal, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ThreatSectionShell({ title, subtitle, showEntryLoader = false, children }) {
  const [showLoader, setShowLoader] = useState(showEntryLoader);

  useEffect(() => {
    if (!showEntryLoader) return;
    const timer = setTimeout(() => setShowLoader(false), 5000);
    return () => clearTimeout(timer);
  }, [showEntryLoader]);

  const pathname = usePathname();
  const lang = (pathname || "").split("/").filter(Boolean)[0] || "en";
  const pagePath = `/${(pathname || "").split("/").filter(Boolean).slice(0, 3).join("/")}`;
  const gridLabel = {
    en: "Threat Analytics",
    hi: "Threat Analytics",
    kn: "Threat Analytics",
  }[lang] || "Threat Analytics";

  const tabs = [
    { label: "Overview", href: `/${lang}/threat` },
    { label: "Incidents", href: `/${lang}/threat/incidents` },
    { label: "Forensics", href: `/${lang}/threat/forensics` },
    { label: "Honeypots", href: `/${lang}/threat/honeypots` },
  ];

  const loadingText = "INITIALIZING CORE SECURITY PROTOCOLS AND THREAT INTELLIGENCE ENGINE...".split(" ");

  return (
    <>
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 font-mono text-indigo-400 overflow-hidden"
          >
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="relative flex items-center justify-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="absolute w-32 h-32 rounded-full border-t-2 border-b-2 border-indigo-500 opacity-50"
                ></motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute w-24 h-24 rounded-full border-l-2 border-r-2 border-cyan-400 opacity-80"
                ></motion.div>
                <Shield className="w-12 h-12 text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
              </div>

              <div className="flex flex-wrap justify-center max-w-xl text-center gap-x-2 text-sm max-sm:text-xs tracking-widest uppercase">
                {loadingText.map((word, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.4, duration: 0.3 }}
                    className="text-cyan-200"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 4.5, ease: "linear" }}
                className="mt-8 h-1 max-w-xs w-64 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    <section className="page-shell page-home page-container relative">
      <div className="container px-4 py-8">
        <div className="mb-10 w-fit mx-auto overflow-x-auto rounded-full p-2 bg-slate-50/80 border border-slate-200/60 shadow-inner backdrop-blur-xl supports-[backdrop-filter]:bg-slate-50/50">
          <div className="flex items-center gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const isActive = pagePath === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={[
                    "relative flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 ring-2 ring-indigo-600 ring-offset-2 ring-offset-slate-50"
                      : "text-slate-500 hover:bg-white hover:text-slate-900 transition-colors",
                  ].join(" ")}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="w-full min-w-0">{children}</div>
      </div>
    </section>
    </>
  );
}

