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

  const withLayoutState = (element) => {
    if (!isValidElement(element)) {
      return element;
    }

    // Avoid forwarding custom props to intrinsic DOM elements (e.g., <div>, <nav>).
    if (typeof element.type === "string") {
      return element;
    }

    return cloneElement(element, { layoutState });
  };

  const navbarWithState = withLayoutState(navbar);
  const footerWithState = withLayoutState(footer);

  return (
    <>
      {navbarWithState}
      <main>{children}</main>
      {footerWithState}
    </>
  );
}
