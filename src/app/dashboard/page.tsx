"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  PackageCheck,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Tag,
  TrendingUp,
  Wine,
  X,
} from "lucide-react";
import { Product, products as fallbackProducts } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";

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
  commissionRate?: number;
  systemCommissionUGX?: number;
  netPayoutUGX?: number;
  items: OrderItem[];
  createdAt: string;
  priority?: "High" | "Medium" | "Low";
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
    paymentMethod: "Cash",
    paymentStatus: "Pending",
    totalAmountUSD: 249.99,
    totalAmountUGX: 924963,
    systemCommissionUGX: 138744,
    netPayoutUGX: 786219,
    priority: "High",
    items: [
      {
        productName: "Don Julio 70 Añejo Cristalino",
        quantity: 1,
        unitPriceUSD: 249.99,
        subtotalUSD: 249.99,
      },
    ],
    createdAt: "2026-08-28",
  },
  {
    id: "2",
    orderNumber: "MAG-71042",
    customerName: "Sarah Kiconco",
    customerEmail: "sarah.k@example.com",
    customerPhone: "+256 701 883 992",
    deliveryAddress: "Kololo Hill Drive, Plot 14, Kampala",
    orderStatus: "Out for Delivery",
    paymentMethod: "MTN Mobile Money",
    paymentStatus: "Paid",
    totalAmountUSD: 499.98,
    totalAmountUGX: 1849926,
    systemCommissionUGX: 277489,
    netPayoutUGX: 1572437,
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
    createdAt: "2026-08-29",
  },
  {
    id: "3",
    orderNumber: "MAG-60211",
    customerName: "David Ochieng",
    customerEmail: "david.o@example.com",
    customerPhone: "+256 752 119 400",
    deliveryAddress: "Naguru Avenue, Kampala",
    orderStatus: "Delivered",
    paymentMethod: "Visa Card",
    paymentStatus: "Paid",
    totalAmountUSD: 149.99,
    totalAmountUGX: 554963,
    systemCommissionUGX: 83244,
    netPayoutUGX: 471719,
    priority: "Medium",
    items: [
      {
        productName: "Hennessy XO Cognac",
        quantity: 1,
        unitPriceUSD: 149.99,
        subtotalUSD: 149.99,
      },
    ],
    createdAt: "2026-08-27",
  },
  {
    id: "4",
    orderNumber: "MAG-51928",
    customerName: "Emmanuel Tumusiime",
    customerEmail: "e.tumu@example.com",
    customerPhone: "+256 782 990 114",
    deliveryAddress: "Muyenga Tank Hill, Kampala",
    orderStatus: "Delivered",
    paymentMethod: "Airtel Money",
    paymentStatus: "Paid",
    totalAmountUSD: 389.0,
    totalAmountUGX: 1439300,
    systemCommissionUGX: 215895,
    netPayoutUGX: 1223405,
    priority: "Low",
    items: [
      {
        productName: "Johnnie Walker Blue Label",
        quantity: 1,
        unitPriceUSD: 389.0,
        subtotalUSD: 389.0,
      },
    ],
    createdAt: "2026-08-26",
  },
];

export default function DashboardOverviewPage() {
  const { formatAmount } = useCurrency();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [productsList, setProductsList] = useState<Product[]>(fallbackProducts);
  const [selectedEmployee, setSelectedEmployee] = useState("All Employees");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [quickDateFilter, setQuickDateFilter] = useState<"all" | "today" | "this_month" | "last_month">("all");
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const prodRes = await fetch("/api/store-products");
      const prodData = await prodRes.json();
      if (Array.isArray(prodData) && prodData.length > 0) {
        setProductsList(prodData);
      }

      let fetchedOrders: Order[] = [];
      const orderRes = await fetch("/api/orders");
      const orderData = await orderRes.json();
      if (orderData?.docs && Array.isArray(orderData.docs) && orderData.docs.length > 0) {
        fetchedOrders = orderData.docs.map((doc: any) => ({
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
          totalAmountUGX: Number(doc.totalAmountUGX || (Number(doc.totalAmountUSD || 0) * 3700)),
          commissionRate: Number(doc.commissionRate || 0.15),
          systemCommissionUGX: Number(doc.systemCommissionUGX || Math.round((Number(doc.totalAmountUGX || 0) * 0.15))),
          netPayoutUGX: Number(doc.netPayoutUGX || Math.round((Number(doc.totalAmountUGX || 0) * 0.85))),
          priority: doc.orderStatus === "Pending" ? "High" : doc.orderStatus === "Delivered" ? "Low" : "Medium",
          items: doc.items || [],
          createdAt: doc.createdAt ? doc.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
        }));
      }

      const localOrdersRaw = localStorage.getItem("magnum_placed_orders");
      if (localOrdersRaw) {
        try {
          const localOrders = JSON.parse(localOrdersRaw);
          if (Array.isArray(localOrders)) {
            const existingOrderNums = new Set(fetchedOrders.map((o) => o.orderNumber));
            const uniqueLocal = localOrders.filter((lo: Order) => !existingOrderNums.has(lo.orderNumber));
            fetchedOrders = [...uniqueLocal, ...fetchedOrders];
          }
        } catch (e) {}
      }

      if (fetchedOrders.length > 0) {
        // Merge with initial fallback seed ensuring no duplicate IDs
        const existingIds = new Set(fetchedOrders.map((o) => o.orderNumber));
        const nonDuplicateInitial = initialOrders.filter((io) => !existingIds.has(io.orderNumber));
        setOrders([...fetchedOrders, ...nonDuplicateInitial]);
      }
    } catch (err) {
      console.warn("Failed to fetch dashboard data:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter orders based on Date range & quick filters
  const filteredOrders = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return orders.filter((o) => {
      const orderDate = o.createdAt ? o.createdAt.slice(0, 10) : todayStr;

      if (quickDateFilter === "today") {
        return orderDate === todayStr;
      }
      if (quickDateFilter === "this_month") {
        const currentMonth = todayStr.slice(0, 7);
        return orderDate.startsWith(currentMonth);
      }
      if (quickDateFilter === "last_month") {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        const lastMonthStr = d.toISOString().slice(0, 7);
        return orderDate.startsWith(lastMonthStr);
      }

      // Range check for custom date inputs
      if (fromDate && orderDate < fromDate) return false;
      if (toDate && orderDate > toDate) return false;
      return true;
    });
  }, [orders, quickDateFilter, fromDate, toDate]);

  // LIVE FINANCIAL CALCULATIONS BASED ON ORDERS
  const finances = useMemo(() => {
    const validOrders = filteredOrders.filter((o) => o.orderStatus !== "Cancelled");

    // Total Gross Sales (UGX)
    const totalSalesUGX = validOrders.reduce(
      (sum, o) => sum + (o.totalAmountUGX || o.totalAmountUSD * 3700),
      0
    );

    // Total Received / Paid Orders (UGX)
    const totalReceivedUGX = validOrders
      .filter((o) => o.paymentStatus === "Paid" || o.orderStatus === "Delivered")
      .reduce((sum, o) => sum + (o.totalAmountUGX || o.totalAmountUSD * 3700), 0);

    // 15% System Fee Platform Commission (UGX)
    const expensesUGX = Math.round(totalSalesUGX * 0.15);

    // Uncollected Invoices / Pending Orders (UGX)
    const invoicesUGX = validOrders
      .filter((o) => o.paymentStatus === "Pending" && o.orderStatus !== "Delivered")
      .reduce((sum, o) => sum + (o.totalAmountUGX || o.totalAmountUSD * 3700), 0);

    // Net Liquid Cash at Hand (Total Received minus system fee portion)
    const cashAtHandUGX = Math.max(0, totalReceivedUGX - Math.round(totalReceivedUGX * 0.15));

    // Payment Breakdown by Payment Method
    const airtelUGX = validOrders
      .filter((o) => o.paymentMethod?.toLowerCase().includes("airtel"))
      .reduce((sum, o) => sum + (o.totalAmountUGX || o.totalAmountUSD * 3700), 0);

    const mtnUGX = validOrders
      .filter(
        (o) =>
          o.paymentMethod?.toLowerCase().includes("mtn") ||
          o.paymentMethod?.toLowerCase().includes("mobile money")
      )
      .reduce((sum, o) => sum + (o.totalAmountUGX || o.totalAmountUSD * 3700), 0);

    const cardUGX = validOrders
      .filter(
        (o) =>
          o.paymentMethod?.toLowerCase().includes("visa") ||
          o.paymentMethod?.toLowerCase().includes("card") ||
          o.paymentMethod?.toLowerCase().includes("credit")
      )
      .reduce((sum, o) => sum + (o.totalAmountUGX || o.totalAmountUSD * 3700), 0);

    const cashPaymentUGX = validOrders
      .filter((o) => o.paymentMethod?.toLowerCase().includes("cash"))
      .reduce((sum, o) => sum + (o.totalAmountUGX || o.totalAmountUSD * 3700), 0);

    return {
      totalSalesUGX,
      totalReceivedUGX,
      expensesUGX,
      invoicesUGX,
      cashAtHandUGX,
      airtelUGX,
      mtnUGX,
      cardUGX,
      cashPaymentUGX,
      orderCount: validOrders.length,
    };
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      
      {/* TOP FILTER CARD (Employee, From Date, To Date, Quick Pills) */}
      <div className="rounded-3xl border border-[#e5e5e4] bg-white p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#f4f4f3] pb-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#18181b] tracking-tight">Dashboard Overview</h1>
            <p className="text-xs text-[#71717a] mt-0.5">
              Live cellar financial metrics calculated directly from {finances.orderCount} order transactions
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-full border border-[#e5e5e4] bg-[#f7f7f6] px-4 py-2 text-xs font-semibold text-[#18181b] hover:bg-[#ececec] transition shadow-2xs"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin text-[#b8860b]" : "text-[#71717a]"} /> Sync
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Employee Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#52525b] block">Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
            >
              <option>All Employees</option>
              <option>Jessin Sam (Store Manager)</option>
              <option>Isaac Kato (Cellar Master)</option>
              <option>Brenda Namuli (Inventory)</option>
            </select>
          </div>

          {/* From Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#52525b] block">From</label>
            <div className="relative flex items-center">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setQuickDateFilter("all");
                }}
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white pl-4 pr-10 text-xs font-mono font-semibold text-[#18181b] outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>
          </div>

          {/* To Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#52525b] block">To</label>
            <div className="relative flex items-center">
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setQuickDateFilter("all");
                }}
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white pl-4 pr-10 text-xs font-mono font-semibold text-[#18181b] outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>
          </div>

        </div>

        {/* Quick Date Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#f4f4f3]">
          <span className="text-xs font-bold text-[#8e8e8e] mr-2">Quick:</span>
          {[
            { id: "all", label: "All Time" },
            { id: "today", label: "Today" },
            { id: "this_month", label: "This Month" },
            { id: "last_month", label: "Last Month" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setQuickDateFilter(pill.id as any)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                quickDateFilter === pill.id
                  ? "bg-[#e8e8e7] text-[#18181b]"
                  : "bg-[#f4f4f3] text-[#71717a] hover:bg-[#e8e8e7]"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5 PRIMARY FINANCIAL METRICS ROW (Calculated dynamically) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Sales */}
        <div className="rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] p-5 flex items-center gap-4 shadow-2xs">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center shadow-xs">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#71717a] block">Total Sales</span>
            <p className="font-sans text-2xl font-extrabold tracking-tight text-[#18181b]">
              {finances.totalSalesUGX.toLocaleString()}
            </p>
            <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider font-sans">UGX</span>
          </div>
        </div>

        {/* Total Received */}
        <div className="rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] p-5 flex items-center gap-4 shadow-2xs">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#b8860b] text-white flex items-center justify-center shadow-xs">
            <CreditCard size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#71717a] block">Total Received</span>
            <p className="font-sans text-2xl font-extrabold tracking-tight text-[#18181b]">
              {finances.totalReceivedUGX.toLocaleString()}
            </p>
            <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider font-sans">UGX</span>
          </div>
        </div>

        {/* Expenses (15% System Commission) */}
        <div className="rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] p-5 flex items-center gap-4 shadow-2xs">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#dc2626] text-white flex items-center justify-center shadow-xs">
            <Tag size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#71717a] block">Expenses (15%)</span>
            <p className="font-sans text-2xl font-extrabold tracking-tight text-[#18181b]">
              {finances.expensesUGX.toLocaleString()}
            </p>
            <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider font-sans">UGX</span>
          </div>
        </div>

        {/* Invoices (Pending Accounts) */}
        <div className="rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] p-5 flex items-center gap-4 shadow-2xs">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#d97706] text-white flex items-center justify-center shadow-xs">
            <FileText size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#71717a] block">Invoices (Pending)</span>
            <p className="font-sans text-2xl font-extrabold tracking-tight text-[#18181b]">
              {finances.invoicesUGX.toLocaleString()}
            </p>
            <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider font-sans">UGX</span>
          </div>
        </div>

        {/* Cash at Hand (Net Liquid) */}
        <div className="rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] p-5 flex items-center gap-4 shadow-2xs">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#996515] text-white flex items-center justify-center shadow-xs">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#71717a] block">Cash at Hand</span>
            <p className="font-sans text-2xl font-extrabold tracking-tight text-[#18181b]">
              {finances.cashAtHandUGX.toLocaleString()}
            </p>
            <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider font-sans">UGX</span>
          </div>
        </div>

      </div>

      {/* PAYMENT BREAKDOWN SECTION (Calculated dynamically) */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#8e8e8e]">
          PAYMENT BREAKDOWN (FROM ORDERS)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Airtel Account */}
          <div className="rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] p-5 flex items-center gap-4 shadow-2xs">
            <img
              src="/constants/Airtel_logo.svg.png"
              alt="Airtel Money"
              className="h-14 w-16 shrink-0 object-contain"
            />
            <div>
              <span className="text-[11px] font-semibold text-[#71717a] block">Airtel Account</span>
              <p className="font-sans text-2xl font-extrabold tracking-tight text-[#18181b]">
                {finances.airtelUGX.toLocaleString()}
              </p>
              <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider font-sans">UGX</span>
            </div>
          </div>

          {/* MTN Account */}
          <div className="rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] p-5 flex items-center gap-4 shadow-2xs">
            <img
              src="/constants/MoMo-logo-1.png"
              alt="MTN Mobile Money"
              className="h-14 w-16 shrink-0 object-contain"
            />
            <div>
              <span className="text-[11px] font-semibold text-[#71717a] block">MTN Account</span>
              <p className="font-sans text-2xl font-extrabold tracking-tight text-[#18181b]">
                {finances.mtnUGX.toLocaleString()}
              </p>
              <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider font-sans">UGX</span>
            </div>
          </div>

          {/* Visa Card Account */}
          <div className="rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] p-5 flex items-center gap-4 shadow-2xs">
            <img
              src="/constants/Visa_Inc.-Logo.wine.png"
              alt="Visa Card"
              className="h-14 w-16 shrink-0 object-contain"
            />
            <div>
              <span className="text-[11px] font-semibold text-[#71717a] block">Visa Card Account</span>
              <p className="font-sans text-2xl font-extrabold tracking-tight text-[#18181b]">
                {finances.cardUGX.toLocaleString()}
              </p>
              <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider font-sans">UGX</span>
            </div>
          </div>

          {/* Cash */}
          <div className="rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] p-5 flex items-center gap-4 shadow-2xs">
            <img
              src="/constants/minimalist-money-logo-design-template-cash-money-for-business-finance-money-investing-logo-vector.jpg"
              alt="Cash"
              className="h-14 w-16 shrink-0 object-cover rounded-xl"
            />
            <div>
              <span className="text-[11px] font-semibold text-[#71717a] block">Cash</span>
              <p className="font-sans text-2xl font-extrabold tracking-tight text-[#18181b]">
                {finances.cashPaymentUGX.toLocaleString()}
              </p>
              <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider font-sans">UGX</span>
            </div>
          </div>

        </div>
      </div>

      {/* QUICK INVENTORY & RECENT ORDERS SHORTCUTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Recent Orders Overview */}
        <div className="rounded-3xl border border-[#e5e5e4] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#f4f4f3] pb-3">
            <div className="flex items-center gap-2">
              <PackageCheck size={18} className="text-[#b8860b]" />
              <h2 className="text-base font-bold text-[#18181b]">Recent Deliveries</h2>
            </div>
            <Link
              href="/dashboard/orders"
              className="text-xs font-bold text-[#b8860b] hover:underline flex items-center gap-1"
            >
              View All ({filteredOrders.length}) <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-[#f4f4f3]">
            {filteredOrders.slice(0, 4).map((order) => (
              <div key={order.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#18181b]">{order.orderNumber}</span>
                    <span className="text-[10px] text-[#71717a]">· {order.createdAt}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#18181b]">{order.customerName}</p>
                  <p className="text-[11px] text-[#71717a] truncate max-w-[220px]">{order.deliveryAddress}</p>
                </div>

                <div className="text-right space-y-1">
                  <span className="font-sans text-xs font-bold text-[#b8860b] block">
                    {formatAmount(order.totalAmountUSD)}
                  </span>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    order.orderStatus === "Delivered"
                      ? "bg-emerald-100 text-emerald-800"
                      : order.orderStatus === "Out for Delivery"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-[#fffcf0] text-[#b8860b] border border-[#f3e5b8]"
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Stock Status */}
        <div className="rounded-3xl border border-[#e5e5e4] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#f4f4f3] pb-3">
            <div className="flex items-center gap-2">
              <Wine size={18} className="text-[#b8860b]" />
              <h2 className="text-base font-bold text-[#18181b]">Stock Quick Glance</h2>
            </div>
            <Link
              href="/dashboard/products"
              className="text-xs font-bold text-[#b8860b] hover:underline flex items-center gap-1"
            >
              Manage Stock <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-[#f4f4f3]">
            {productsList.slice(0, 4).map((p) => {
              const stock = p.stockQuantity ?? 50;
              return (
                <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#f7f7f6] p-1 border border-[#e5e5e4] flex items-center justify-center">
                      <img src={p.image} alt={p.name} className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <p className="font-serif text-xs font-bold text-[#18181b] line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-[#71717a]">{p.producer} • {p.category}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-sans text-xs font-bold text-[#b8860b] block">
                      {formatAmount(p.numericPrice)}
                    </span>
                    <span className="text-[10px] font-semibold text-[#71717a]">
                      {stock} in stock
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
