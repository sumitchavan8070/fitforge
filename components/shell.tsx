"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3, Bell, Boxes, ChevronLeft, ClipboardList, FolderTree, LayoutDashboard, LogOut,
  Menu, MessageCircle, Package, Percent, Receipt, ScrollText, Search, Settings, Shield, ShoppingCart, Truck, Users, Wallet, X,
} from "lucide-react";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/auth-actions";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  pos: ShoppingCart,
  orders: ClipboardList,
  products: Package,
  categories: FolderTree,
  inventory: Boxes,
  suppliers: Truck,
  customers: Users,
  invoices: Receipt,
  expenses: Wallet,
  reports: BarChart3,
  whatsapp: MessageCircle,
  promotions: Percent,
  staff: Shield,
  settings: Settings,
  audit: ScrollText,
};

export function Shell({
  user,
  demo,
  notifications,
  children,
}: {
  user: { name: string; email: string; roleName: string; permissions: string[] };
  demo: boolean;
  notifications: { id: string; title: string; href: string; body: string }[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [notes, setNotes] = useState(false);
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const items = NAV.filter((item) => user.roleName === "Owner" || user.permissions.includes(item.permission));
  const crumbs = pathname.split("/").filter(Boolean);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className={cn("no-print fixed inset-y-0 left-0 z-40 hidden flex-col bg-sidebar text-sidebar-foreground transition-all md:flex", collapsed ? "w-[76px]" : "w-64")}>
        <div className="flex h-16 items-center gap-3 px-4">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent font-bold text-accent-foreground">FF</div>
          {!collapsed ? <div><p className="text-sm font-semibold">FitForge</p><p className="text-xs text-sidebar-muted">Shop admin</p></div> : null}
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
          {items.map((item) => {
            const Icon = ICONS[item.icon] ?? Package;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} title={item.label} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm", active ? "bg-white/10 text-white" : "text-sidebar-muted hover:bg-white/5 hover:text-white")}>
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>
        <button className="m-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-sidebar-muted hover:bg-white/5" onClick={() => setCollapsed((value) => !value)}>
          <ChevronLeft className={cn("h-4 w-4", collapsed && "rotate-180")} />
          {!collapsed ? "Collapse" : null}
        </button>
      </aside>
      {mobile ? (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setMobile(false)}>
          <div className="h-full w-72 bg-sidebar p-4 text-sidebar-foreground" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><span className="font-semibold">FitForge</span><button onClick={() => setMobile(false)}><X /></button></div>
            {items.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobile(false)} className="block rounded-xl px-3 py-2 text-sm text-sidebar-muted hover:bg-white/5 hover:text-white">{item.label}</Link>)}
          </div>
        </div>
      ) : null}
      <div className={cn("min-h-screen transition-all", collapsed ? "md:pl-[76px]" : "md:pl-64")}>
        <header className="no-print sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur">
          <button className="md:hidden" onClick={() => setMobile(true)} aria-label="Open navigation"><Menu /></button>
          <form className="relative flex-1" action="/search" onSubmit={(event) => { event.preventDefault(); router.push(`/search?q=${encodeURIComponent(query)}`); }}>
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input aria-label="Search the shop" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, customers, invoices" className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
          </form>
          <div className="relative">
            <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-border" onClick={() => setNotes((value) => !value)}>
              <Bell className="h-4 w-4" />
              {notifications.length ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" /> : null}
            </button>
            {notes ? (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-card p-2 shadow-lg">
                {notifications.length === 0 ? <p className="p-3 text-sm text-muted">No open alerts.</p> : notifications.map((note) => (
                  <Link key={note.id} href={note.href || "/"} className="block rounded-xl px-3 py-2 hover:bg-background" onClick={() => setNotes(false)}>
                    <p className="text-sm font-medium">{note.title}</p>
                    <p className="text-xs text-muted">{note.body}</p>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <div className="relative">
            <button className="flex items-center gap-2 rounded-xl border border-border px-2 py-1.5" onClick={() => setMenu((value) => !value)}>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-sidebar text-xs text-accent">{user.name.slice(0, 1)}</span>
              <span className="hidden text-left sm:block"><span className="block text-sm font-medium leading-4">{user.name}</span><span className="text-xs text-muted">{user.roleName}</span></span>
            </button>
            {menu ? (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-lg">
                <p className="px-3 py-2 text-xs text-muted">{user.email}</p>
                <form action={logoutAction}><button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-background"><LogOut className="h-4 w-4" /> Sign out</button></form>
              </div>
            ) : null}
          </div>
        </header>
        {demo ? <div className="no-print bg-sidebar px-4 py-2 text-center text-xs text-accent">Demo data for local development. This is not a real shop or real customer information.</div> : null}
        <div className="px-4 py-5 md:px-6">
          {crumbs.length ? <p className="mb-3 text-xs text-muted">{["Home", ...crumbs].join(" / ")}</p> : null}
          {children}
        </div>
      </div>
    </div>
  );
}
