"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Activity,
  Database,
  Lock,
  Server,
  Settings,
  Menu,
  X,
  ChevronRight,
  LogOut
} from "lucide-react";

export default function ThreatLayoutClient({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const langMatch = pathname ? pathname.match(/^\/([a-z]{2})/) : null;
  const lang = langMatch ? langMatch[1] : "en";
  const basePath = `/${lang}/threat`;

  const navItems = [
    { name: "Overview", href: basePath, icon: Shield },
    { name: "Incidents", href: `${basePath}/incidents`, icon: Activity },
    { name: "Forensics", href: `${basePath}/forensics`, icon: Database },
    { name: "Honeypots", href: `${basePath}/honeypots`, icon: Lock },
    { name: "Telemetry", href: `${basePath}/telemetry`, icon: Server },
    { name: "Settings", href: `${basePath}/settings`, icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-800 border-r border-slate-200 w-full relative z-40">
      <div className="p-6 shrink-0 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
          <Shield className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 truncate">PayShield</h2>
          <p className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Threat Engine</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Analytics</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full text-left flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span className="truncate">{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 shrink-0 text-indigo-400" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 shrink-0 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm shrink-0 flex items-center justify-center">
              <Shield className="w-4 h-4 text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">System Active</p>
              <p className="text-[10px] text-green-600 font-bold uppercase truncate">Protection ON</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] w-full bg-slate-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 z-40 bg-white border-r border-slate-200">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed left-0 top-0 h-[100dvh] w-[280px] z-50 bg-white shadow-2xl lg:hidden flex flex-col"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full z-50 bg-white/50 backdrop-blur"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden bg-slate-50/50 relative">
        
        {/* Mobile Header Topbar */}
        <header className="lg:hidden shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 z-30 sticky top-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Shield className="w-4 h-4" />
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">PayShield</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full overscroll-y-contain pb-24 md:pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Crosshair, Bug, Fingerprint, Settings, Activity, Radar, Sparkles, Menu, X } from "lucide-react";
import "./threat-styles.css";

const NAV_ITEMS = [
  { key: "overview", slug: "", icon: ShieldCheck },
  { key: "honeypots", slug: "honeypots", icon: Crosshair },
  { key: "incidents", slug: "incidents", icon: Bug },
  { key: "forensics", slug: "forensics", icon: Fingerprint },
  { key: "settings", slug: "settings", icon: Settings }
];

const COPY = {
  en: {
    center: "Threat Intelligence Hub",
    title: "Cyber Shield Grid",
    online: "AI defense network online",
    loading: "Loading",
    nav: {
      overview: "Overview",
      honeypots: "Honeypots",
      incidents: "Incidents",
      forensics: "Forensics",
      settings: "System Admin"
    }
  },
  hi: {
    center: "थ्रेट इंटेलिजेंस हब",
    title: "साइबर शील्ड ग्रिड",
    online: "AI डिफेंस नेटवर्क ऑनलाइन",
    loading: "लोड हो रहा है",
    nav: {
      overview: "अवलोकन",
      honeypots: "हनीपॉट्स",
      incidents: "घटनाएं",
      forensics: "फॉरेंसिक्स",
      settings: "सिस्टम एडमिन"
    }
  },
  kn: {
    center: "ಥ್ರೆಟ್ ಇಂಟೆಲಿಜೆನ್ಸ್ ಹಬ್",
    title: "ಸೈಬರ್ ಶೀಲ್ಡ್ ಗ್ರಿಡ್",
    online: "AI ರಕ್ಷಣಾ ನೆಟ್‌ವರ್ಕ್ ಆನ್‌ಲೈನ್",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ",
    nav: {
      overview: "ಅವಲೋಕನ",
      honeypots: "ಹನಿಪಾಟ್‌ಗಳು",
      incidents: "ಘಟನೆಗಳು",
      forensics: "ಫರೆನ್ಸಿಕ್ಸ್",
      settings: "ಸಿಸ್ಟಮ್ ಆಡ್ಮಿನ್"
    }
  }
};

function RouteLoader({ label }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
      className="fixed top-0 left-0 right-0 z-[100] h-1 bg-slate-100 overflow-hidden"
    >
      <motion.div 
        className="h-full bg-blue-600"
        initial={{ width: "0%" }}
        animate={{ width: "80%", transition: { duration: 2, ease: "easeOut" } }}
        exit={{ width: "100%", transition: { duration: 0.2 } }}
      />
    </motion.div>
  );
}

export default function ThreatLayoutClient({ children }) {
  const pathname = usePathname();
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { lang, basePath, routeKey } = useMemo(() => {
    const parts = (pathname || "").split("/").filter(Boolean);
    const currentLang = parts[0] || "en";
    const isThreat = parts[1] === "threat";
    const slug = isThreat ? parts.slice(2).join("/") : "";
    return { lang: currentLang, basePath: `/${currentLang}/threat`, routeKey: slug };
  }, [pathname]);

  const t = COPY[lang] || COPY.en;

  useEffect(() => {
    setMobileMenuOpen(false);
    setLoadingRoute(true);
    const timer = setTimeout(() => setLoadingRoute(false), 220);
    return () => clearTimeout(timer);
  }, [pathname]);

  const SidebarContent = () => (
    <>
      <div className="border-b border-slate-200 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-semibold">{t.center}</div>
            <div className="text-lg font-bold text-slate-900 leading-tight">PayShield</div>
          </div>
        </div>
        <button className="lg:hidden p-2 -mr-2 text-slate-400 hover:text-slate-600" onClick={() => setMobileMenuOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 py-5">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-slate-500 font-semibold">
            <Sparkles className="h-3 w-3 text-blue-500" />
            {t.title}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>{t.online}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-5 space-y-1">
        {NAV_ITEMS.map((item) => {
          const href = item.slug ? `${basePath}/${item.slug}` : basePath;
          const active = routeKey === item.slug;
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={href}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                active ? "text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="threat-active-nav-fixed"
                  className="absolute inset-0 rounded-lg bg-blue-50/80 border border-blue-100/50"
                  transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                />
              )}
              <Icon className={`relative z-10 h-[18px] w-[18px] ${active ? "text-blue-600" : "text-slate-400"}`} />
              <span className={`relative z-10 text-[14px] font-medium leading-none ${active ? "text-blue-800 font-semibold" : "text-slate-600"}`}>
                {t.nav[item.key]}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-50/50 rounded-lg py-2">
          <Radar className="h-3.5 w-3.5" />
          Cyber AI Ready
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex overflow-x-hidden w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 z-40 flex-col border-r border-slate-200 bg-white">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlays */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed left-0 top-0 h-screen w-72 z-50 flex flex-col border-r border-slate-200 bg-white lg:hidden shadow-xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 min-h-screen w-full overflow-x-hidden">
        <header className="lg:hidden sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="p-1 -ml-1 text-slate-500 hover:text-slate-800">
              <Menu className="h-6 w-6" />
            </button>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <div className="text-[15px] font-bold text-slate-900 tracking-tight leading-none tracking-tight">PayShield</div>
          </div>
          <div className="h-8 w-8 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center">
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
        </header>

        <main className="flex-1 flex flex-col relative w-full h-full">
          {children}
        </main>
      </div>

      <AnimatePresence>{loadingRoute && <RouteLoader label={t.loading} />}</AnimatePresence>
    </div>
  );
}
