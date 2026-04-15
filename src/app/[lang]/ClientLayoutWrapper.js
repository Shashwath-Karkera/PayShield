"use client";

import { cloneElement, isValidElement } from "react";
import { usePathname } from "next/navigation";

export default function ClientLayoutWrapper({ children, navbar, footer }) {
  const pathname = usePathname();
  const isThreat = pathname && pathname.includes("/threat");
  const isAuthRoute = pathname && (pathname.includes("/login") || pathname.includes("/register") || pathname.includes("/verify"));
  const isAppRoute = pathname && (pathname.includes("/dashboard") || pathname.includes("/payment") || pathname.includes("/bank-credentials"));

  const layoutState = isAuthRoute ? "auth" : isAppRoute ? "app" : "default";

  if (isThreat) {
    return <main className="w-full">{children}</main>;
  }

  const navbarWithState = isValidElement(navbar)
    ? cloneElement(navbar, { layoutState })
    : navbar;

  const footerWithState = isValidElement(footer)
    ? cloneElement(footer, { layoutState })
    : footer;

  return (
    <>
      {navbarWithState}
      <main>{children}</main>
      {footerWithState}
    </>
  );
}
