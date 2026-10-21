"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CartDrawer } from "@/components/CartDrawer";
import { Header } from "@/components/Header";

/** Shows storefront navigation only on public store routes. */
export function StoreChrome({
  children,
  footer,
}: {
  children: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) return children;

  return (
    <>
      <Header />
      <main id="main" className="flex-1">{children}</main>
      {footer}
      <CartDrawer />
    </>
  );
}
