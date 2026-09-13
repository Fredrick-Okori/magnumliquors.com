"use client";

import React, { useEffect, useRef, useState } from "react";
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
  X,
} from "lucide-react";
import { signOutManagerFromSupabase } from "@/lib/supabase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [latestOrder, setLatestOrder] = useState<{
    orderNumber: string;
    customerName: string;
    totalAmountUGX: number;
  } | null>(null);
  const [isOrderPopupVisible, setIsOrderPopupVisible] = useState(false);
  const knownOrderKeys = useRef<Set<string> | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("magnum_dashboard_authenticated");
    const storedEmail = localStorage.getItem("magnum_user_email");
    const storedName = localStorage.getItem("magnum_user_name");
    const storedRole = localStorage.getItem("magnum_user_role");
    if (session === "true") {
      setIsAuthenticated(true);
      if (storedEmail) setUserEmail(storedEmail);
      if (storedName) setUserName(storedName);
      if (storedRole) setUserRole(storedRole);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    const pollOrders = async () => {
      try {
        const pendingOrderRaw = localStorage.getItem("magnum_pending_order_notification");
        if (pendingOrderRaw) {
          try {
            const pendingOrder = JSON.parse(pendingOrderRaw);
            if (isMounted) {
              setLatestOrder({
                orderNumber: pendingOrder.orderNumber || "New order",
                customerName: pendingOrder.customerName || "A customer",
                totalAmountUGX: Number(pendingOrder.totalAmountUGX || 0),
              });
              setNewOrderCount((count) => count + 1);
              setIsOrderPopupVisible(true);
            }
          } finally {
            localStorage.removeItem("magnum_pending_order_notification");
          }
        }

        const response = await fetch("/api/orders", { cache: "no-store" });
        if (!response.ok) return;

        const data = await response.json();
        const orders = Array.isArray(data?.docs) ? data.docs : [];
        const currentOrderKeys = new Set<string>(
          orders.map((order: { id?: string; orderNumber?: string }) =>
            String(order.id || order.orderNumber || "")
          )
        );

        if (!knownOrderKeys.current) {
          knownOrderKeys.current = currentOrderKeys;
          return;
        }

        const newOrders = orders.filter(
          (order: { id?: string; orderNumber?: string }) =>
            !knownOrderKeys.current?.has(String(order.id || order.orderNumber || ""))
        );
        knownOrderKeys.current = currentOrderKeys;

        if (isMounted && newOrders.length > 0) {
          const newestOrder = newOrders[0];
          setLatestOrder({
            orderNumber: newestOrder.orderNumber || "New order",
            customerName: newestOrder.customerName || "A customer",
            totalAmountUGX: Number(newestOrder.totalAmountUGX || 0),
          });
          setNewOrderCount((count) => count + newOrders.length);
          setIsOrderPopupVisible(true);
        }
      } catch (error) {
        console.warn("Failed to poll dashboard orders:", error);
      }
    };

    pollOrders();
    const interval = window.setInterval(pollOrders, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await signOutManagerFromSupabase();
    localStorage.removeItem("magnum_dashboard_authenticated");
    localStorage.removeItem("magnum_user_email");
    localStorage.removeItem("magnum_user_name");
    localStorage.removeItem("magnum_user_role");
    localStorage.removeItem("magnum_access_token");
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

  const manageItems = [
    { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  ];

  const settingsItems = [
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ...( ["superadmin", "manager"].includes(userRole.toLowerCase())
      ? [{ href: "/dashboard/team", label: "Team", icon: Users }]
      : []),
    { href: "/dashboard/help", label: "Help", icon: HelpCircle },
  ];
  const isSalesEmployee = userRole.toLowerCase() === "sales";
  const displayName = userName || userEmail.split("@")[0] || "User";
  const markOrdersRead = () => {
    setNewOrderCount(0);
    setIsOrderPopupVisible(false);
  };

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
          
          <div className="px-2 pt-1">
            <Link href="/dashboard" aria-label="Magnum Liquors dashboard home" className="inline-flex items-center">
              <img
                src="/magnum_gold.png"
                alt="Magnum Liquors"
                width={166}
                height={42}
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          {/* 1. MENU SECTION */}
          {!isSalesEmployee && renderNavGroup("MENU", menuItems)}

          {/* 2. STOCK SECTION */}
          {renderNavGroup("STOCK", stockItems)}

          {/* 3. ORDERS SECTION */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#8e8e8e] mb-1.5">
              ORDERS
            </p>
            <nav className="space-y-0.5">
              <Link
                href="/dashboard/orders"
                onClick={markOrdersRead}
                className={`w-full flex items-center justify-between rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                  pathname?.startsWith("/dashboard/orders")
                    ? "bg-[#b8860b] text-white shadow-sm font-bold"
                    : "text-[#52525b] hover:bg-[#f4f4f3] hover:text-[#18181b]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <PackageCheck size={16} className={pathname?.startsWith("/dashboard/orders") ? "text-white" : "text-[#71717a]"} />
                  <span>Orders</span>
                </span>
                {newOrderCount > 0 && (
                  <span className="min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-extrabold text-white">
                    {newOrderCount > 99 ? "99+" : newOrderCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* 4. MANAGE SECTION */}
          {!isSalesEmployee && renderNavGroup("MANAGE", manageItems)}

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
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] px-3.5 py-2.5 text-xs font-semibold text-[#18181b] hover:bg-[#ececec] transition"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-[#b8860b]" />
              View Storefront
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

            <button
              onClick={() => setIsOrderPopupVisible((visible) => !visible)}
              className="relative text-[#71717a] hover:text-[#18181b] transition"
              aria-label="View order notifications"
            >
              <Bell size={18} />
              {newOrderCount > 0 && (
                <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-extrabold text-white">
                  {newOrderCount > 99 ? "99+" : newOrderCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-[#e5e5e4]">
              <div className="h-9 w-9 overflow-hidden rounded-full bg-[#b8860b] text-white flex items-center justify-center font-bold text-xs">
                {displayName[0].toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#18181b] leading-tight">{displayName}</p>
                <p className="text-[10px] text-[#71717a]">{userEmail}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Canvas Scroll Area */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6 max-w-7xl w-full mx-auto scrollbar-none">
          {children}
        </main>

        {isOrderPopupVisible && latestOrder && (
          <div className="fixed bottom-6 right-6 z-50 w-[min(20rem,calc(100vw-2rem))] max-w-sm rounded-2xl border border-[#f3e5b8] bg-white p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#b8860b]">New order received</p>
                <p className="mt-1 text-sm font-bold text-[#18181b]">{latestOrder.orderNumber}</p>
                <p className="mt-1 text-xs text-[#71717a]">
                  {latestOrder.customerName} · UGX {latestOrder.totalAmountUGX.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setIsOrderPopupVisible(false)}
                className="rounded-full p-1 text-[#71717a] hover:bg-[#f4f4f3]"
                aria-label="Dismiss order notification"
              >
                <X size={15} />
              </button>
            </div>
            <Link
              href="/dashboard/orders"
              onClick={markOrdersRead}
              className="mt-3 inline-flex rounded-full bg-[#b8860b] px-4 py-2 text-[11px] font-bold text-white hover:bg-[#996515]"
            >
              View order
            </Link>
          </div>
        )}

      </div>

      </div>
  );
}
