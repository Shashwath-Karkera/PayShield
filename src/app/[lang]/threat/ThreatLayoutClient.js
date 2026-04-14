"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Activity,
  AlertTriangle,
  Server,
  Zap,
  Crosshair,
  Lock,
  Menu,
  X,
  Search,
  Network,
  Cpu
} from "lucide-react";

const getNavigation = (lang, dict) => [
  {
    name: dict?.threat?.nav?.dashboard || "Overview",
    href: `/${lang}/threat`,
    icon: Activity,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    activeColor: "bg-indigo-600 text-white",
  },
  {
    name: dict?.threat?.nav?.incidents || "Incidents",
    href: `/${lang}/threat/incidents`,
    icon: AlertTriangle,
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-100",
    activeColor: "bg-orange-600 text-white",
  },
  {
    name: dict?.threat?.nav?.forensics || "Forensics",
    href: `/${lang}/threat/forensics`,
    icon: Search,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    activeColor: "bg-emerald-600 text-white",
  },
  {
    name: dict?.threat?.nav?.honeypots || "Honeypots",
    href: `/${lang}/threat/honeypots`,
    icon: Network,
    color: "text-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-100",
    activeColor: "bg-rose-600 text-white",
  },
  
  {
    name: dict?.threat?.nav?.settings || "Settings",
    href: `/${lang}/threat/settings`,
    icon: Cpu,
    color: "text-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-200",
    activeColor: "bg-slate-800 text-white",
  },
];

export default function ThreatLayoutClient({ children, lang, dict }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const navigation = getNavigation(lang, dict);

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-[1600px] w-full mx-auto overflow-hidden bg-slate-50 relative border-x border-slate-200 shadow-xl">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-72 flex-col bg-white border-r border-slate-200 shadow-sm shrink-0">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-100 bg-slate-50/50">
          <Shield className="h-7 w-7 text-indigo-600 mr-3" />
          <span className="    text-slate-900">
            {dict?.threat?.title || "Threat Intelligence"}
          </span>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto py-6 px-4">
          <nav className="flex flex-1 flex-col gap-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center gap-x-3 rounded-2xl p-3  font-bold transition-all
                    ${isActive
                      ? `${item.activeColor} shadow-md shadow-${item.color.split("-")[1]}-500/20`
                      : `text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200`
                    }
                  `}
                >
                  <item.icon
                    className={`
                      h-5 w-5 shrink-0 transition-colors
                      ${isActive ? "text-white" : item.color}
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                  
                  {/* Status Dot */}
                  {isActive && (
                    <motion.div 
                      layoutId="active-dot" 
                      className="ml-auto w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="relative">
              <Server className="w-8 h-8 text-indigo-600 bg-indigo-50 p-1.5 rounded-xl border border-indigo-100" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <p className="text-[10px]    text-slate-500">System Status</p>
              <p className=" font-bold text-slate-900 leading-none mt-1">All Nodes Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header Wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 w-full relative h-full">
        {/* Mobile Header */}
        <div className="sticky top-0 z-[60] flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 shadow-sm lg:hidden w-full">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-700 hover:text-indigo-600 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 flex items-center justify-center">
             <Shield className="h-5 w-5 text-indigo-600 mr-2" />
             <span className="    text-slate-900 truncate">
               {dict?.threat?.title || "Threat Intelligence"}
             </span>
          </div>
          <div className="w-6" /> {/* Placeholder for balance */}
        </div>

        {/* Main Workspace Area */}
        <main className="flex-1 w-full overflow-hidden flex flex-col relative bg-slate-50 h-full">
           <div className="w-full h-full overflow-y-auto overflow-x-hidden p-4 lg:p-8 custom-scrollbar">
             {children}
           </div>
        </main>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-[80] w-[85%] max-w-sm bg-white border-r border-slate-200 shadow-2xl flex flex-col lg:hidden"
            >
              <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center">
                  <Shield className="h-6 w-6 text-indigo-600 mr-3" />
                  <span className="    text-slate-900">
                    Menu
                  </span>
                </div>
                <button
                  type="button"
                  className="-m-2.5 p-2.5 text-slate-400 hover:text-red-500 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        group flex items-center gap-x-4 rounded-2xl p-4  font-bold transition-all
                        ${isActive
                          ? `${item.activeColor} shadow-lg shadow-${item.color.split("-")[1]}-500/20`
                          : `text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent border-slate-100`
                        }
                      `}
                    >
                      <item.icon
                        className={`h-6 w-6 shrink-0 transition-colors ${isActive ? "text-white" : item.color}`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


