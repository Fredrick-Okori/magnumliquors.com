"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  ExternalLink,
  HelpCircle,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  PackageCheck,
  Receipt,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Wine,
} from "lucide-react";
import { signOutManagerFromSupabase } from "@/lib/supabase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("manager@magnum.com");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const session = localStorage.getItem("magnum_dashboard_authenticated");
    const storedEmail = localStorage.getItem("magnum_user_email");
    if (session === "true") {
      setIsAuthenticated(true);
      if (storedEmail) setUserEmail(storedEmail);
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = async () => {
    await signOutManagerFromSupabase();
    localStorage.removeItem("magnum_dashboard_authenticated");
    localStorage.removeItem("magnum_user_email");
    setIsAuthenticated(false);
    router.push("/login");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f6] p-8">
        <div className="flex items-center gap-3 text-xs font-semibold text-[#71717a]">
          <RefreshCw size={16} className="animate-spin text-[#b8860b]" /> Redirecting to Login...
        </div>
      </div>
    );
  }

  // Sidebar Sections Configuration
  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const stockItems = [
    { href: "/dashboard/products", label: "Products", icon: Wine },
    { href: "/dashboard/categories", label: "Categories", icon: Layers },
  ];

  const orderItems = [
    { href: "/dashboard/orders", label: "Orders", icon: PackageCheck },
  ];

  const manageItems = [
    { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  ];

  const settingsItems = [
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
    { href: "/dashboard/team", label: "Team", icon: Users },
    { href: "/dashboard/help", label: "Help", icon: HelpCircle },
  ];

  const renderNavGroup = (title: string, items: typeof menuItems) => (
    <div className="space-y-1">
      <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#8e8e8e] mb-1.5">
        {title}
      </p>
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center justify-between rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#b8860b] text-white shadow-sm font-bold"
                  : "text-[#52525b] hover:bg-[#f4f4f3] hover:text-[#18181b]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className={isActive ? "text-white" : "text-[#71717a]"} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f7f7f6] text-[#18181b] font-sans antialiased overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 shrink-0 border-r border-[#e5e5e4] bg-white flex flex-col justify-between p-5 overflow-y-auto scrollbar-none">
        <div className="space-y-5">
          
          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b8860b] text-white font-bold text-sm shadow-sm">
              M
            </div>
            <h1 className="font-bold text-lg tracking-tight text-[#18181b]">
              Magnum Cellar
            </h1>
          </div>

          {/* 1. MENU SECTION */}
          {renderNavGroup("MENU", menuItems)}

          {/* 2. STOCK SECTION */}
          {renderNavGroup("STOCK", stockItems)}

          {/* 3. ORDERS SECTION */}
          {renderNavGroup("ORDERS", orderItems)}

          {/* 4. MANAGE SECTION */}
          {renderNavGroup("MANAGE", manageItems)}

          {/* 5. SETTINGS SECTION */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#8e8e8e] mb-1.5">
              SETTINGS
            </p>
            <nav className="space-y-0.5">
              {settingsItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-full flex items-center justify-between rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#b8860b] text-white shadow-sm font-bold"
                        : "text-[#52525b] hover:bg-[#f4f4f3] hover:text-[#18181b]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={isActive ? "text-white" : "text-[#71717a]"} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-full px-3.5 py-2 text-xs font-semibold text-[#52525b] hover:bg-[#f4f4f3] hover:text-[#18181b] transition"
              >
                <LogOut size={16} className="text-[#71717a]" />
                <span>Logout</span>
              </button>
            </nav>
          </div>

        </div>

        <div className="pt-4 border-t border-[#e5e5e4] mt-4">
          <Link
            href="/admin"
            target="_blank"
            className="w-full flex items-center justify-between rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] px-3.5 py-2.5 text-xs font-semibold text-[#18181b] hover:bg-[#ececec] transition"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-[#b8860b]" />
              Payload Admin
            </span>
            <ExternalLink size={13} className="text-[#71717a]" />
          </Link>
        </div>
      </aside>

      {/* TOP FLOATING SEARCH HEADER & MAIN CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <header className="h-16 shrink-0 bg-transparent px-8 flex items-center justify-between border-b border-[#e5e5e4]/60">
          <div className="relative flex items-center w-full max-w-md">
            <Search size={15} className="absolute left-3.5 text-[#a1a1aa]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search task, order or product..."
              className="w-full h-10 rounded-2xl border border-[#e5e5e4] bg-white pl-9 pr-12 text-xs text-[#18181b] placeholder:text-[#a1a1aa] outline-none focus:border-[#b8860b] focus:ring-1 focus:ring-[#b8860b] transition shadow-2xs"
            />
            <span className="absolute right-3 font-mono text-[10px] text-[#71717a] bg-[#f4f4f3] px-1.5 py-0.5 rounded border border-[#e4e4e7]">
              ⌘F
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-[#71717a] hover:text-[#18181b] transition">
              <Mail size={18} />
            </button>

            <button className="relative text-[#71717a] hover:text-[#18181b] transition">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-[#e5e5e4]">
              <div className="h-9 w-9 overflow-hidden rounded-full bg-[#b8860b] text-white flex items-center justify-center font-bold text-xs">
                {userEmail[0].toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#18181b] leading-tight">Store Manager</p>
                <p className="text-[10px] text-[#71717a]">{userEmail}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Canvas Scroll Area */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6 max-w-7xl w-full mx-auto scrollbar-none">
          {children}
        </main>

      </div>

    </div>
  );
}
