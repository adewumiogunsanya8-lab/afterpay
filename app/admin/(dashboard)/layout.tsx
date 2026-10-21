import Link from "next/link";
import { requireAdmin, type AdminIdentity } from "@/lib/auth/index";
import { adminLogout } from "../actions/logout";
import { GridIcon, PackageIcon, TagIcon, TruckIcon, UserIcon } from "@/components/Icons";
import { cn } from "@/lib/cn";

/**
 * Protected admin layout.
 *
 * Requires a valid admin session on every render. Unauthenticated requests are
 * redirected to /admin/login. When the session is valid, the admin shell
 * (sidebar + top bar + content area) renders full-bleed because the root
 * layout skips storefront chrome on admin routes.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  return <AdminShell admin={admin}>{children}</AdminShell>;
}

function AdminShell({ admin, children }: { admin: AdminIdentity; children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full bg-ink-50">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-line bg-white">
        <AdminNav />
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader admin={admin} />
        <main className="flex-1 overflow-y-auto bg-ink-50 p-6 sm:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}

const ADMIN_NAV: { href: string; label: string; icon: React.ElementType }[] = [
  { href: "/admin", label: "Dashboard", icon: GridIcon },
  { href: "/admin/products", label: "Products", icon: PackageIcon },
  { href: "/admin/categories", label: "Categories", icon: TagIcon },
  { href: "/admin/markets", label: "Markets", icon: GlobeIcon },
  { href: "/admin/orders", label: "Orders", icon: TruckIcon },
  { href: "/admin/images", label: "Images", icon: ImageIcon },
];

function AdminNav() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/admin";
  return (
    <nav className="flex flex-col p-4 space-y-1">
      <div className="flex items-center gap-3 px-3 py-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-base font-black text-white">
          A
        </div>
        <span className="font-semibold text-ink-950">EasyVend Admin</span>
      </div>
      {ADMIN_NAV.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              isActive
                ? "bg-brand-50 text-brand-700"
                : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
      <div className="mt-auto border-t border-line pt-4">
        <form action={adminLogout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
          >
            <UserIcon className="h-5 w-5 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}

function AdminHeader({ admin }: { admin: AdminIdentity }) {
  return (
    <header className="flex items-center justify-between border-b border-line bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-ink-950 uppercase tracking-wider">Dashboard</h2>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-ink-500">{admin.email}</span>
      </div>
    </header>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.4 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.4-3.3-8.5S9.8 5.9 12 3.5z" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.25" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
