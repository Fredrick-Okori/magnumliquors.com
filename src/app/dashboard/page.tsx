"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  Box,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Command,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  Filter,
  Flame,
  Globe,
  HelpCircle,
  Key,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
  User,
  UserPlus,
  Users,
  Wine,
  X,
} from "lucide-react";
import { Product, products as fallbackProducts } from "@/data/products";
import { signInManagerWithSupabase, signOutManagerFromSupabase } from "@/lib/supabase";

interface OrderItem {
  productName: string;
  quantity: number;
  unitPriceUSD: number;
  subtotalUSD: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  orderStatus: "Pending" | "Processing" | "Out for Delivery" | "Delivered" | "Cancelled";
  paymentMethod: string;
  paymentStatus: "Pending" | "Paid" | "Refunded";
  totalAmountUSD: number;
  totalAmountUGX: number;
  items: OrderItem[];
  createdAt: string;
  priority: "High" | "Medium" | "Low";
}

const initialOrders: Order[] = [
  {
    id: "1",
    orderNumber: "MAG-84920",
    customerName: "Patrick Mukasa",
    customerEmail: "p.mukasa@example.com",
    customerPhone: "+256 772 409 110",
    deliveryAddress: "Sturrock Road, Acacia Mall, Kampala",
    orderStatus: "Pending",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    totalAmountUSD: 249.99,
    totalAmountUGX: 924963,
    priority: "High",
    items: [
      {
        productName: "Don Julio 70 Añejo Cristalino",
        quantity: 1,
        unitPriceUSD: 249.99,
        subtotalUSD: 249.99,
      },
    ],
    createdAt: "Nov 24, 2024",
  },
  {
    id: "2",
    orderNumber: "MAG-71042",
    customerName: "Sarah Kiconco",
    customerEmail: "sarah.k@example.com",
    customerPhone: "+256 701 883 992",
    deliveryAddress: "Kololo Hill Drive, Plot 14, Kampala",
    orderStatus: "Out for Delivery",
    paymentMethod: "Mobile Money",
    paymentStatus: "Paid",
    totalAmountUSD: 499.98,
    totalAmountUGX: 1849926,
    priority: "High",
    items: [
      {
        productName: "Macallan 18 Year Double Cask",
        quantity: 1,
        unitPriceUSD: 399.99,
        subtotalUSD: 399.99,
      },
      {
        productName: "Dom Pérignon Vintage 2013",
        quantity: 1,
        unitPriceUSD: 99.99,
        subtotalUSD: 99.99,
      },
    ],
    createdAt: "Nov 25, 2024",
  },
  {
    id: "3",
    orderNumber: "MAG-60211",
    customerName: "David Ochieng",
    customerEmail: "david.o@example.com",
    customerPhone: "+256 752 119 400",
    deliveryAddress: "Naguru Avenue, Kampala",
    orderStatus: "Delivered",
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    totalAmountUSD: 149.99,
    totalAmountUGX: 554963,
    priority: "Medium",
    items: [
      {
        productName: "Hennessy XO Cognac",
        quantity: 1,
        unitPriceUSD: 149.99,
        subtotalUSD: 149.99,
      },
    ],
    createdAt: "Nov 23, 2024",
  },
];

const teamMembers = [
  { name: "Jessin Sam", role: "Store Manager", email: "jessin@gmail.com", phone: "+256 700 111 222", status: "Active" },
  { name: "Isaac Kato", role: "Head Cellar Master", email: "isaac.k@magnum.com", phone: "+256 772 333 444", status: "Active" },
  { name: "Brenda Namuli", role: "Inventory Specialist", email: "brenda.n@magnum.com", phone: "+256 701 555 666", status: "Active" },
];

export default function DashboardPage() {
  // Supabase Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("manager@magnum.com");
  const [loginEmail, setLoginEmail] = useState("manager@magnum.com");
  const [loginPassword, setLoginPassword] = useState("••••••••");
  const [loginError, setLoginError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "orders" | "products" | "analytics" | "team" | "settings" | "help"
  >("dashboard");

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [productsList, setProductsList] = useState<Product[]>(fallbackProducts);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [checkedOrders, setCheckedOrders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check existing login session
  useEffect(() => {
    const session = localStorage.getItem("magnum_dashboard_authenticated");
    const storedEmail = localStorage.getItem("magnum_user_email");
    if (session === "true") {
      setIsAuthenticated(true);
      if (storedEmail) setUserEmail(storedEmail);
    }
  }, []);

  // Handle Supabase Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter email and password.");
      return;
    }
    setLoginError("");
    setIsAuthenticating(true);

    const { user, error } = await signInManagerWithSupabase(loginEmail, loginPassword);
    setIsAuthenticating(false);

    if (error) {
      setLoginError(error);
      return;
    }

    if (user) {
      setIsAuthenticated(true);
      const email = user.email || loginEmail;
      setUserEmail(email);
      localStorage.setItem("magnum_dashboard_authenticated", "true");
      localStorage.setItem("magnum_user_email", email);
    }
  };

  // Handle Supabase Logout
  const handleLogout = async () => {
    await signOutManagerFromSupabase();
    localStorage.removeItem("magnum_dashboard_authenticated");
    localStorage.removeItem("magnum_user_email");
    setIsAuthenticated(false);
  };

  // Fetch Live Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const prodRes = await fetch("/api/store-products");
      const prodData = await prodRes.json();
      if (Array.isArray(prodData) && prodData.length > 0) {
        setProductsList(prodData);
      }

      const orderRes = await fetch("/api/orders");
      const orderData = await orderRes.json();
      if (orderData?.docs && Array.isArray(orderData.docs) && orderData.docs.length > 0) {
        const mappedOrders: Order[] = orderData.docs.map((doc: any) => ({
          id: String(doc.id),
          orderNumber: doc.orderNumber || `MAG-${doc.id}`,
          customerName: doc.customerName || "Valued Customer",
          customerEmail: doc.customerEmail || "N/A",
          customerPhone: doc.customerPhone || "N/A",
          deliveryAddress: doc.deliveryAddress || "Kampala",
          orderStatus: doc.orderStatus || "Pending",
          paymentMethod: doc.paymentMethod || "Cash on Delivery",
          paymentStatus: doc.paymentStatus || "Pending",
          totalAmountUSD: Number(doc.totalAmountUSD || 0),
          totalAmountUGX: Number(doc.totalAmountUGX || 0),
          priority: doc.orderStatus === "Pending" ? "High" : doc.orderStatus === "Delivered" ? "Low" : "Medium",
          items: doc.items || [],
          createdAt: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "Nov 25, 2024",
        }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.warn("Failed to fetch live payload data:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleCheckboxToggle = (orderId: string) => {
    setCheckedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleUpdateStatus = (orderId: string, newStatus: Order["orderStatus"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
  };

  const activeOrdersCount = orders.filter((o) => o.orderStatus !== "Delivered").length;
  const completedOrdersCount = orders.filter((o) => o.orderStatus === "Delivered").length;
  const totalRevenueUSD = orders.reduce((sum, o) => sum + o.totalAmountUSD, 0);
  const totalRevenueUGX = Math.round(totalRevenueUSD * 3700);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && o.orderStatus !== "Delivered") ||
      (statusFilter === "completed" && o.orderStatus === "Delivered");

    const matchesQuery = `${o.orderNumber} ${o.customerName} ${o.customerPhone} ${o.deliveryAddress}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesStatus && matchesQuery;
  });

  const filteredProducts = productsList.filter((p) => {
    const matchesCategory =
      productCategoryFilter === "All" || p.category === productCategoryFilter;
    const matchesQuery = `${p.name} ${p.producer}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  /* ==========================================================================
     AUTHENTICATION GATE: SUPABASE LOGIN SCREEN
     ========================================================================== */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f7f7f6] flex flex-col items-center justify-center p-6 text-[#18181b]">
        <div className="w-full max-w-md space-y-6">
          
          {/* Logo Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#006039] text-white font-bold text-2xl shadow-lg shadow-[#006039]/20">
              M
            </div>
            <h1 className="text-3xl font-extrabold text-[#18181b] tracking-tight">
              Magnum Cellar Ops
            </h1>
            <p className="text-xs text-[#71717a]">
              Sign in via <strong className="text-[#006039]">Supabase Auth</strong> to access store operations.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-3xl border border-[#e5e5e4] bg-white p-8 space-y-5 shadow-sm">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Branch Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#18181b] flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#006039]" /> Store Branch
                </label>
                <select className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] px-3.5 text-xs text-[#18181b] font-semibold outline-none focus:border-[#006039] transition">
                  <option>Acacia Mall Branch — Kampala, Uganda</option>
                  <option>Kololo Flagship Cellar — Kampala</option>
                </select>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#18181b] flex items-center gap-1.5">
                  <Mail size={13} className="text-[#006039]" /> Supabase User Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="manager@magnum.com"
                  className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-3.5 text-xs text-[#18181b] placeholder:text-[#a1a1aa] outline-none focus:border-[#006039] focus:ring-1 focus:ring-[#006039] transition"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#18181b] flex items-center gap-1.5">
                  <Lock size={13} className="text-[#006039]" /> Supabase Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-3.5 text-xs text-[#18181b] placeholder:text-[#a1a1aa] outline-none focus:border-[#006039] focus:ring-1 focus:ring-[#006039] transition"
                />
              </div>

              {loginError && (
                <p className="text-xs font-semibold text-red-600">{loginError}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full rounded-full bg-[#006039] hover:bg-[#004d2d] py-3.5 text-xs font-bold uppercase tracking-widest text-white transition shadow-md flex items-center justify-center gap-2 mt-2"
              >
                {isAuthenticating ? "Connecting Supabase..." : "Sign In with Supabase"}
              </button>
            </form>

            <div className="border-t border-[#e5e5e4] pt-4 text-center">
              <Link
                href="/"
                className="text-xs font-semibold text-[#71717a] hover:text-[#18181b] transition inline-flex items-center gap-1"
              >
                <ArrowLeft size={13} /> Back to Storefront Homepage
              </Link>
            </div>
          </div>

        </div>
      </div>
    );
  }

  /* ==========================================================================
     AUTHENTICATED DASHBOARD APPLICATION
     ========================================================================== */
  return (
    <div className="flex h-screen bg-[#f7f7f6] text-[#18181b] font-sans antialiased overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 shrink-0 border-r border-[#e5e5e4] bg-white flex flex-col justify-between p-5">
        <div className="space-y-6">
          
          {/* Logo Header */}
          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#006039] text-white font-bold text-sm shadow-sm">
              M
            </div>
            <h1 className="font-bold text-lg tracking-tight text-[#18181b]">
              Magnum Cellar
            </h1>
          </div>

          {/* MENU Group */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#8e8e8e] mb-2">
              MENU
            </p>
            <nav className="space-y-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                { id: "orders", label: "Orders", icon: PackageCheck, count: orders.length },
                { id: "products", label: "Products Catalog", icon: Wine, count: productsList.length },
                { id: "analytics", label: "Analytics", icon: BarChart3 },
                { id: "team", label: "Team", icon: Users, count: teamMembers.length },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between rounded-full px-4 py-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#006039] text-white shadow-sm font-bold"
                        : "text-[#52525b] hover:bg-[#f4f4f3] hover:text-[#18181b]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={isActive ? "text-white" : "text-[#71717a]"} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-[#f4f4f3] text-[#71717a]"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* GENERAL Group */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#8e8e8e] mb-2">
              GENERAL
            </p>
            <nav className="space-y-1">
              {[
                { id: "settings", label: "Settings", icon: Settings },
                { id: "help", label: "Help", icon: HelpCircle },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between rounded-full px-4 py-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#006039] text-white shadow-sm font-bold"
                        : "text-[#52525b] hover:bg-[#f4f4f3] hover:text-[#18181b]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={isActive ? "text-white" : "text-[#71717a]"} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-full px-4 py-2.5 text-xs font-semibold text-[#52525b] hover:bg-[#f4f4f3] hover:text-[#18181b] transition"
              >
                <LogOut size={16} className="text-[#71717a]" />
                <span>Logout</span>
              </button>
            </nav>
          </div>

        </div>

        {/* Sidebar Footer Link */}
        <div className="pt-4 border-t border-[#e5e5e4]">
          <Link
            href="/admin"
            target="_blank"
            className="w-full flex items-center justify-between rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] px-3.5 py-2.5 text-xs font-semibold text-[#18181b] hover:bg-[#ececec] transition"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-[#006039]" />
              Payload Admin
            </span>
            <ExternalLink size={13} className="text-[#71717a]" />
          </Link>
        </div>
      </aside>

      {/* TOP FLOATING SEARCH HEADER & MAIN CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 shrink-0 bg-transparent px-8 flex items-center justify-between border-b border-[#e5e5e4]/60">
          <div className="relative flex items-center w-full max-w-md">
            <Search size={15} className="absolute left-3.5 text-[#a1a1aa]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search task, order or product..."
              className="w-full h-10 rounded-2xl border border-[#e5e5e4] bg-white pl-9 pr-12 text-xs text-[#18181b] placeholder:text-[#a1a1aa] outline-none focus:border-[#006039] focus:ring-1 focus:ring-[#006039] transition shadow-2xs"
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
              <div className="h-9 w-9 overflow-hidden rounded-full bg-[#006039] text-white flex items-center justify-center font-bold text-xs">
                {userEmail[0].toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#18181b] leading-tight">Supabase User</p>
                <p className="text-[10px] text-[#71717a]">{userEmail}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Canvas Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-6xl w-full mx-auto scrollbar-none">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold text-[#18181b] tracking-tight">Dashboard Overview</h2>
                  <p className="text-xs text-[#71717a] mt-1">Real-time metrics and store operations preview.</p>
                </div>
                <button
                  onClick={fetchData}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 rounded-full border border-[#e5e5e4] bg-white px-4 py-2 text-xs font-semibold text-[#18181b] hover:bg-[#f4f4f3] transition shadow-xs"
                >
                  <RefreshCw size={13} className={isLoading ? "animate-spin text-[#006039]" : "text-[#71717a]"} /> Sync Data
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-[#e5e5e4] bg-white p-5 space-y-2 shadow-2xs">
                  <span className="text-xs text-[#71717a] font-medium">Total Gross Revenue</span>
                  <p className="font-mono text-2xl font-bold text-[#18181b]">${totalRevenueUSD.toFixed(2)}</p>
                  <p className="text-xs font-mono text-[#006039] font-bold">UGX {totalRevenueUGX.toLocaleString()}</p>
                </div>

                <div className="rounded-2xl border border-[#e5e5e4] bg-white p-5 space-y-2 shadow-2xs">
                  <span className="text-xs text-[#71717a] font-medium">Total Orders</span>
                  <p className="font-mono text-2xl font-bold text-[#18181b]">{orders.length}</p>
                  <p className="text-xs text-[#b8860b] font-semibold">{activeOrdersCount} Pending Fulfillment</p>
                </div>

                <div className="rounded-2xl border border-[#e5e5e4] bg-white p-5 space-y-2 shadow-2xs">
                  <span className="text-xs text-[#71717a] font-medium">Product Catalog</span>
                  <p className="font-mono text-2xl font-bold text-[#18181b]">{productsList.length} Bottles</p>
                  <p className="text-xs text-[#006039] font-semibold">Synced Supabase & Payload</p>
                </div>

                <div className="rounded-2xl border border-[#e5e5e4] bg-white p-5 space-y-2 shadow-2xs">
                  <span className="text-xs text-[#71717a] font-medium">Team On Shift</span>
                  <p className="font-mono text-2xl font-bold text-[#18181b]">{teamMembers.length} Members</p>
                  <p className="text-xs text-[#006039] font-semibold">Acacia Mall Branch</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab("orders")}
                  className="rounded-2xl border border-[#e5e5e4] bg-white p-6 text-left hover:border-[#006039] transition shadow-2xs group flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-base text-[#18181b]">Manage Live Orders →</h3>
                    <p className="text-xs text-[#71717a] mt-1">Review incoming customer checkouts, addresses, and print invoices.</p>
                  </div>
                  <PackageCheck size={28} className="text-[#006039] group-hover:scale-110 transition" />
                </button>

                <button
                  onClick={() => setActiveTab("products")}
                  className="rounded-2xl border border-[#e5e5e4] bg-white p-6 text-left hover:border-[#006039] transition shadow-2xs group flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-base text-[#18181b]">Manage Product Catalog →</h3>
                    <p className="text-xs text-[#71717a] mt-1">Update bottle prices, stock availability, and specifications.</p>
                  </div>
                  <Wine size={28} className="text-[#006039] group-hover:scale-110 transition" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS VIEW */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-[#18181b] tracking-tight">Orders</h2>
                  <p className="text-xs text-[#71717a] mt-1">Manage and organize your store orders efficiently.</p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <button
                    onClick={fetchData}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 rounded-full border border-[#e5e5e4] bg-white px-4 py-2.5 text-xs font-semibold text-[#18181b] hover:bg-[#f4f4f3] transition shadow-xs"
                  >
                    <RefreshCw size={13} className={isLoading ? "animate-spin text-[#006039]" : "text-[#71717a]"} /> Sync
                  </button>

                  <button
                    onClick={() => window.open("/admin/collections/orders/create", "_blank")}
                    className="rounded-full bg-[#006039] hover:bg-[#004d2d] px-5 py-2.5 text-xs font-bold text-white transition shadow-sm flex items-center gap-1.5"
                  >
                    <Plus size={16} /> Add Task
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {[
                  { id: "all", label: `All (${orders.length})` },
                  { id: "active", label: `Active (${activeOrdersCount})` },
                  { id: "completed", label: `Completed (${completedOrdersCount})` },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setStatusFilter(pill.id as any)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      statusFilter === pill.id
                        ? "bg-[#006039] text-white font-bold"
                        : "bg-[#e8e8e7] text-[#52525b] hover:bg-[#dedede]"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3.5">
                {filteredOrders.map((order) => {
                  const isChecked = checkedOrders.includes(order.id);
                  return (
                    <div
                      key={order.id}
                      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-white p-5 transition-all duration-200 shadow-2xs ${
                        isChecked ? "border-[#006039] bg-[#f4fbf7]" : "border-[#e5e5e4] hover:border-[#006039]/40"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxToggle(order.id)}
                          className="mt-1 h-4 w-4 rounded border-[#cbd5e1] text-[#006039] focus:ring-[#006039]"
                        />

                        <div className="space-y-1.5">
                          <h3 className={`text-sm font-bold text-[#18181b] ${isChecked ? "line-through text-[#71717a]" : ""}`}>
                            {order.orderNumber} — {order.customerName}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#71717a]">
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-[#a1a1aa]" /> {order.deliveryAddress}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar size={13} className="text-[#a1a1aa]" /> {order.createdAt}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Phone size={13} className="text-[#a1a1aa]" /> {order.customerPhone}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="rounded-md bg-[#f4f4f3] border border-[#e4e4e7] px-2.5 py-0.5 text-[11px] font-medium text-[#52525b]">
                              {order.paymentMethod}
                            </span>
                            <span className="rounded-md bg-[#fffbe6] border border-[#fde68a] px-2.5 py-0.5 text-[11px] font-bold text-[#b8860b]">
                              ${order.totalAmountUSD.toFixed(2)} (UGX {order.totalAmountUGX.toLocaleString()})
                            </span>
                            <span className="rounded-md bg-[#f4f4f3] border border-[#e4e4e7] px-2.5 py-0.5 text-[11px] font-medium text-[#52525b]">
                              {order.items.length} {order.items.length === 1 ? "bottle" : "bottles"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="rounded-full border border-[#e5e5e4] bg-white px-3.5 py-1.5 text-xs font-bold text-[#18181b] hover:bg-[#f4f4f3] transition flex items-center gap-1.5 shadow-2xs"
                        >
                          <FileText size={13} className="text-[#006039]" /> Invoice
                        </button>

                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value as any)}
                          className={`rounded-full px-3 py-1 text-xs font-bold border outline-none cursor-pointer ${
                            order.orderStatus === "Pending"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : order.orderStatus === "Out for Delivery"
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-emerald-100 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          <option value="Pending">High (Pending)</option>
                          <option value="Processing">Medium (Processing)</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Low (Completed)</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS CATALOG */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-[#18181b] tracking-tight">Products Catalog</h2>
                  <p className="text-xs text-[#71717a] mt-1">Manage store inventory, bottle pricing, and specifications.</p>
                </div>
                <Link
                  href="/admin/collections/products/create"
                  target="_blank"
                  className="rounded-full bg-[#006039] hover:bg-[#004d2d] px-5 py-2.5 text-xs font-bold text-white transition shadow-sm flex items-center gap-1.5"
                >
                  <Plus size={16} /> Add Bottle
                </Link>
              </div>

              <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                {["All", "Spirits", "Wine", "Bourbon", "Beer"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setProductCategoryFilter(cat)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      productCategoryFilter === cat
                        ? "bg-[#006039] text-white font-bold"
                        : "bg-[#e8e8e7] text-[#52525b] hover:bg-[#dedede]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-[#e5e5e4] bg-white p-5 flex items-center justify-between gap-4 shadow-2xs hover:border-[#006039]/40 transition">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f7f7f6] p-1.5 border border-[#e5e5e4] flex items-center justify-center">
                        <img src={p.image} alt={p.name} className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#006039] uppercase tracking-wider">{p.producer}</span>
                        <h3 className="font-bold text-sm text-[#18181b]">{p.name}</h3>
                        <p className="text-xs text-[#71717a] font-mono mt-0.5">{p.abv} · {p.volume}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold font-mono text-sm text-[#18181b]">${p.numericPrice.toFixed(2)}</p>
                      <p className="text-[10px] font-mono text-[#b8860b]">UGX {Math.round(p.numericPrice * 3700).toLocaleString()}</p>
                      <Link
                        href={`/admin/collections/products/${p.id}`}
                        target="_blank"
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#006039] hover:underline"
                      >
                        Payload Edit <ExternalLink size={10} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ANALYTICS VIEW */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-extrabold text-[#18181b] tracking-tight">Analytics & Reports</h2>
                <p className="text-xs text-[#71717a] mt-1">Store sales performance, popular spirits, and revenue trends.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-[#e5e5e4] bg-white p-6 space-y-2 shadow-2xs">
                  <span className="text-xs text-[#71717a] font-medium">Average Order Value</span>
                  <p className="font-mono text-3xl font-bold text-[#18181b]">$249.99</p>
                  <p className="text-xs text-[#006039] font-bold flex items-center gap-1"><ArrowUpRight size={14} /> +12.5% this week</p>
                </div>

                <div className="rounded-2xl border border-[#e5e5e4] bg-white p-6 space-y-2 shadow-2xs">
                  <span className="text-xs text-[#71717a] font-medium">Customer Repeat Rate</span>
                  <p className="font-mono text-3xl font-bold text-[#18181b]">68.4%</p>
                  <p className="text-xs text-[#006039] font-bold flex items-center gap-1"><ArrowUpRight size={14} /> Cellar Club VIP</p>
                </div>

                <div className="rounded-2xl border border-[#e5e5e4] bg-white p-6 space-y-2 shadow-2xs">
                  <span className="text-xs text-[#71717a] font-medium">Top Category</span>
                  <p className="font-mono text-3xl font-bold text-[#18181b]">Tequila & Spirits</p>
                  <p className="text-xs text-[#b8860b] font-bold">42% of total volume</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TEAM & STAFF VIEW */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold text-[#18181b] tracking-tight">Team Members</h2>
                  <p className="text-xs text-[#71717a] mt-1">Staff members, roles, and shift assignments at Acacia Mall Branch.</p>
                </div>
                <button className="rounded-full bg-[#006039] hover:bg-[#004d2d] px-5 py-2.5 text-xs font-bold text-white transition shadow-sm flex items-center gap-1.5">
                  <UserPlus size={16} /> Add Member
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member, idx) => (
                  <div key={idx} className="rounded-2xl border border-[#e5e5e4] bg-white p-5 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-full bg-[#006039] text-white flex items-center justify-center font-bold text-sm">
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#18181b]">{member.name}</h3>
                        <p className="text-xs text-[#006039] font-semibold">{member.role}</p>
                        <p className="text-[11px] text-[#71717a] mt-0.5">{member.email}</p>
                      </div>
                    </div>

                    <span className="rounded-full bg-[#dcfce7] border border-[#bbf7d0] px-3 py-1 text-xs font-bold text-[#15803d]">
                      {member.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS VIEW */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-3xl font-extrabold text-[#18181b] tracking-tight">Store Settings</h2>
                <p className="text-xs text-[#71717a] mt-1">Configure store location, currency exchange rates, and branch details.</p>
              </div>

              <div className="rounded-2xl border border-[#e5e5e4] bg-white p-6 space-y-4 shadow-2xs">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#18181b]">Store Branch Name</label>
                  <input type="text" defaultValue="Acacia Mall Branch — Kampala" className="w-full h-10 rounded-xl border border-[#e5e5e4] px-3.5 text-xs text-[#18181b] outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#18181b]">Currency Conversion Rate (1 USD to UGX)</label>
                  <input type="number" defaultValue={3700} className="w-full h-10 rounded-xl border border-[#e5e5e4] px-3.5 text-xs font-mono font-bold text-[#18181b] outline-none" />
                </div>

                <button className="rounded-full bg-[#006039] text-white px-6 py-2.5 text-xs font-bold hover:bg-[#004d2d] transition">
                  Save Store Settings
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: HELP VIEW */}
          {activeTab === "help" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-3xl font-extrabold text-[#18181b] tracking-tight">Help & Support</h2>
                <p className="text-xs text-[#71717a] mt-1">Documentation and support resources for store operators.</p>
              </div>

              <div className="rounded-2xl border border-[#e5e5e4] bg-white p-6 space-y-3 shadow-2xs">
                <h3 className="font-bold text-sm text-[#18181b]">Payload CMS Database Admin</h3>
                <p className="text-xs text-[#71717a]">Access the underlying SQLite database collections for advanced raw data operations.</p>
                <Link href="/admin" target="_blank" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006039] underline">
                  Open Payload Admin (/admin) <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* PRINTABLE INVOICE MODAL */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white p-8 text-[#18181b] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto scrollbar-none">
            
            <div className="flex items-start justify-between border-b border-neutral-200 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#006039]">
                  MAGNUM FINE WINE & SPIRITS
                </p>
                <h2 className="font-serif text-3xl font-light text-[#18181b] mt-1">
                  Cellar Invoice #{selectedInvoiceOrder.orderNumber}
                </h2>
                <p className="text-xs text-[#71717a] mt-0.5">
                  Date: {selectedInvoiceOrder.createdAt}
                </p>
              </div>

              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f4f3] text-[#71717a] hover:bg-[#e4e4e7] transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl border border-neutral-200 bg-[#f7f7f6] p-4 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#006039]">Billed To Customer</p>
                <p className="font-bold text-[#18181b] text-sm">{selectedInvoiceOrder.customerName}</p>
                <p className="text-[#52525b] font-mono">{selectedInvoiceOrder.customerPhone}</p>
                <p className="text-[#71717a]">{selectedInvoiceOrder.customerEmail}</p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-[#f7f7f6] p-4 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#006039]">Delivery Location</p>
                <p className="font-medium text-[#18181b] leading-relaxed">{selectedInvoiceOrder.deliveryAddress}</p>
                <p className="text-[#71717a]">Payment: <strong className="text-[#006039]">{selectedInvoiceOrder.paymentMethod}</strong></p>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 overflow-hidden bg-white">
              <div className="bg-[#006039] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white flex justify-between">
                <span>Bottle Item</span>
                <span>Subtotal</span>
              </div>
              <div className="divide-y divide-neutral-100 p-4 space-y-2 text-xs">
                {selectedInvoiceOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1">
                    <div>
                      <p className="font-semibold text-[#18181b]">{item.productName}</p>
                      <p className="text-[10px] text-[#71717a]">Climate Express Packaging</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-[#18181b] font-bold">${item.subtotalUSD.toFixed(2)}</p>
                      <p className="text-[10px] text-[#71717a]">{item.quantity} x ${item.unitPriceUSD.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4 flex flex-col items-end space-y-1 text-xs">
              <p className="text-[#71717a]">Express Delivery: <span className="text-[#006039] font-bold">FREE</span></p>
              <p className="text-[#71717a]">Tax (8%): <span className="font-mono text-[#18181b]">${(selectedInvoiceOrder.totalAmountUSD * 0.08).toFixed(2)}</span></p>
              <div className="pt-2 flex items-center gap-4 text-base font-bold">
                <span className="text-[#18181b]">Grand Total:</span>
                <span className="font-serif text-2xl text-[#006039]">
                  ${selectedInvoiceOrder.totalAmountUSD.toFixed(2)}
                </span>
              </div>
              <p className="font-mono text-xs text-[#b8860b]">
                UGX {selectedInvoiceOrder.totalAmountUGX.toLocaleString()}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-200">
              <button
                onClick={() => window.print()}
                className="rounded-full bg-[#006039] hover:bg-[#004d2d] px-6 py-2.5 text-xs font-bold text-white transition flex items-center gap-2"
              >
                <Printer size={15} /> Print Invoice
              </button>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="rounded-full border border-neutral-300 bg-[#f4f4f3] px-5 py-2.5 text-xs font-bold text-[#18181b] hover:bg-[#e4e4e7] transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
