"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ThreatSectionShell({ title, subtitle, children }) {
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
    { label: "Settings", href: `/${lang}/threat/settings` },
  ];

  return (
    <section className="page-shell page-home page-container">
      <div className="container">
        <div className="section-header page-header-left mb-6">
          <div className="section-kicker mb-3">
            <span>{gridLabel}</span>
            <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />
            <span>{title}</span>
          </div>

          <h1 className="section-title mb-3 text-left">{title}</h1>

          {subtitle && <p className="section-subtitle mx-0 text-left">{subtitle}</p>}
        </div>

        <div className="content-card mb-6 overflow-x-auto rounded-2xl p-2">
          <div className="flex min-w-max items-center gap-2">
            {tabs.map((tab) => {
              const isActive = pagePath === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={[
                    "inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
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
  );
}

