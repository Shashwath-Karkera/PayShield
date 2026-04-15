"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield, Activity, Search, Network, Cpu, Bell, Home, Target, ShieldAlert, Eye, Settings, User
} from "lucide-react";

export default function ThreatLayoutClient({ children, lang }) {
  const pathname = usePathname();

  const navigation = [
    { name: "Overview", href: `/${lang}/threat`, icon: Home },
    { name: "Forensics", href: `/${lang}/threat/forensics`, icon: Target },
    { name: "Honeypots", href: `/${lang}/threat/honeypots`, icon: Eye }
  ];

  return (
    <div className="flex h-screen w-full bg-[#0a0a0b] text-gray-300 font-sans overflow-hidden">
      {/* Very Thin Sidebar */}
      <div className="w-16 flex flex-col items-center py-6 border-r border-[#262626] bg-[#0f0f11]">
        <div className="mb-10 text-[#a855f7]">
          <Shield className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-6 flex-1 mt-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname === `/${lang}/threat` && item.href === `/${lang}/threat`);
            return (
              <Link href={item.href} key={item.name} title={item.name}
                className={`p-3 border rounded-xl transition-all flex items-center justify-center ${isActive ? 'bg-[#1a1025] text-[#a855f7] border-[#8b5cf6]/30' : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300'}`}>
                <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </Link>
            );
          })}
        </div>
        <div className="mt-auto flex flex-col gap-4">
           <button className="p-3 text-gray-500 hover:text-gray-300">
             <Settings className="w-6 h-6" />
           </button>
           <button className="p-3 text-gray-500 hover:text-gray-300">
             <User className="w-6 h-6" />
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-[#262626] shrink-0 bg-[#0a0a0b]">
          <div className="flex-1" />
          <div className="flex-1 flex items-center justify-center text-sm font-medium text-gray-400">
             <span className="text-gray-500 mr-2">Date/Time</span> |
             <span className="text-[#a855f7] ml-4 cursor-pointer hover:text-[#c084fc] transition-colors">Range Selector</span>
          </div>
          <div className="flex-1 flex justify-end items-center gap-4">
             <button className="w-10 h-10 rounded-full bg-[#161618] border border-[#27272a] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
               <Bell className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* Dashboard Canvas */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0a0a0b]">
          {children}
        </main>
      </div>
    </div>
  );
}