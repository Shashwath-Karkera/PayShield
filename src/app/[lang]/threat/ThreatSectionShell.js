"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

export default function ThreatSectionShell({ title, subtitle, children }) {
  const pathname = usePathname();
  const lang = (pathname || "").split("/").filter(Boolean)[0] || "en";
  const gridLabel = {
    en: "Threat Analytics",
    hi: "à¤–à¤¤à¤°à¤¾ à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£",
    kn: "à²¬à³†à²¦à²°à²¿à²•à³† à²µà²¿à²¶à³à²²à³‡à²·à²£à³†"
  }[lang] || "Threat Analytics";

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex-1"
    >
      <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10 mb-20 overflow-x-hidden relative">
        <div className="relative flex flex-col gap-2 pb-6 border-b border-slate-200 mb-8 bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-[10px] md: text-indigo-600  tracking-[0.2em] ">
            <span>{gridLabel}</span>
            <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-800">{title}</span>
          </div>

          <h1 className=" md: lg:  text-slate-900  leading-tight">
            {title}
          </h1>
          
          {subtitle && (
            <p className=" md:text-base text-slate-600 font-medium leading-relaxed max-w-3xl mt-1">
              {subtitle}
            </p>
          )}
          
          <div className="absolute -bottom-[1px] left-0 w-32 h-[3px] bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" />
        </div>

        <div className="w-full min-w-0">
          {children}
        </div>
      </div>
    </motion.section>
  );
}

