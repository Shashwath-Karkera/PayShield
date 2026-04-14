"use client";

import { usePathname } from "next/navigation";

export default function ClientLayoutWrapper({ children, navbar, footer }) {
  const pathname = usePathname();
  const isThreat = pathname && pathname.includes("/threat");

  if (isThreat) {
    return <main className="w-full">{children}</main>;
  }

  return (
    <>
      {navbar}
      <main>{children}</main>
      {footer}
    </>
  );
}
