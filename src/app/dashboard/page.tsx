"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Code2,
  Coins,
  CreditCard,
  DollarSign,
  FileText,
  PackageCheck,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Tag,
  TrendingUp,
  Wine,
  X,
} from "lucide-react";
import { Product, products as fallbackProducts } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import { FastVideo, isVideoMedia } from "@/components/FastVideo";

interface OrderItem {
  productName: string;
  quantity: number;
  unitPriceUSD: number;
  subtotalUSD: number;
  unitBuyingPriceUGX?: number;
  grossProfitUGX?: number;
  developerProfitShareUGX?: number;
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

const initialOrders: Order[] = [];

export default function DashboardOverviewPage() {
  const { formatAmount } = useCurrency();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [productsList, setProductsList] = useState<Product[]>(fallbackProducts);
  const [teamMembersList, setTeamMembersList] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("All Employees");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [quickDateFilter, setQuickDateFilter] = useState<"all" | "today" | "this_month" | "last_month">("all");
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, teamRes] = await Promise.all([
        fetch("/api/store-products"),
        fetch("/api/team/users"),
      ]);
      const prodData = await prodRes.json();
      const teamData = await teamRes.json();

      if (Array.isArray(prodData) && prodData.length > 0) {
        setProductsList(prodData);
      }
      if (Array.isArray(teamData)) {
        setTeamMembersList(teamData);
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
        setOrders(fetchedOrders);
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
    const completedOrders = validOrders.filter((o) => o.orderStatus === "Delivered");
    const productCosts = new Map(productsList.map((product) => [product.name.toLowerCase(), product.buyingPrice || 0]));

    const getOrderGrossProfitUGX = (order: Order) =>
      order.items.reduce((sum, item) => {
        if (typeof item.grossProfitUGX === "number") return sum + item.grossProfitUGX;
        const buyingPrice = item.unitBuyingPriceUGX ?? productCosts.get(item.productName.toLowerCase()) ?? 0;
        const sellingPriceUGX = item.unitPriceUSD * 3700;
        return sum + Math.max(0, Math.round(sellingPriceUGX - buyingPrice) * item.quantity);
      }, 0);

    const grossStockUGX = productsList.reduce(
      (sum, product) => sum + Math.round(product.numericPrice * 3700) * (product.stockQuantity ?? 0),
      0
    );

    // Total Gross Sales (UGX)
    const totalSalesUGX = validOrders.reduce(
      (sum, o) => sum + (o.totalAmountUGX || o.totalAmountUSD * 3700),
      0
    );

    // Total Received / Paid Orders (UGX)
    const totalReceivedUGX = validOrders
      .filter((o) => o.paymentStatus === "Paid" || o.orderStatus === "Delivered")
      .reduce((sum, o) => sum + (o.totalAmountUGX || o.totalAmountUSD * 3700), 0);

    const completedSalesUGX = completedOrders.reduce(
      (sum, o) => sum + (o.totalAmountUGX || o.totalAmountUSD * 3700),
      0
    );
    const totalGrossProfitUGX = completedOrders.reduce((sum, order) => sum + getOrderGrossProfitUGX(order), 0);
    const developerCommissionRate = 0.25;
    const developerCommissionUGX = Math.round(totalGrossProfitUGX * developerCommissionRate);
    const developerCommissionUSD = Number((developerCommissionUGX / 3700).toFixed(2));
    
    // Developer Commission on collected funds vs pending invoices
    const developerPaidCommissionUGX = developerCommissionUGX;
    
    // Uncollected Invoices / Pending Orders (UGX)
    const invoicesUGX = validOrders
      .filter((o) => o.paymentStatus === "Pending" && o.orderStatus !== "Delivered")
      .reduce((sum, o) => sum + (o.totalAmountUGX || o.totalAmountUSD * 3700), 0);

    const developerPendingCommissionUGX = 0;

    // Store owner retains the remaining 75% of completed gross profit.
    const storeNetPayoutUGX = Math.max(0, totalGrossProfitUGX - developerCommissionUGX);
    const storeNetReceivedUGX = storeNetPayoutUGX;

    // Net liquid cash after the developer's completed-order profit share.
    const cashAtHandUGX = Math.max(0, completedSalesUGX - developerPaidCommissionUGX);

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
      grossStockUGX,
      completedSalesUGX,
      totalGrossProfitUGX,
      totalReceivedUGX,
      developerCommissionRate,
      developerCommissionUGX,
      developerCommissionUSD,
      developerPaidCommissionUGX,
      developerPendingCommissionUGX,
      storeNetPayoutUGX,
      storeNetReceivedUGX,
      invoicesUGX,
      cashAtHandUGX,
      airtelUGX,
      mtnUGX,
      cardUGX,
      cashPaymentUGX,
      orderCount: validOrders.length,
      completedOrderCount: completedOrders.length,
    };
  }, [filteredOrders, productsList]);

  return (
    <div className="space-y-6">
      
      {/* TOP FILTER CARD (Employee, From Date, To Date, Quick Pills) */}
      <div className="rounded-3xl border border-[#e5e5e4] bg-white p-6 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-[#18181b] whitespace-nowrap">Employee Name:</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="rounded-full border border-[#e5e5e4] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#18181b] outline-none focus:border-[#b8860b]"
            >
              <option>All Employees</option>
              {teamMembersList.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#18181b]">From:</label>
              <div className="relative flex items-center">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="rounded-full border border-[#e5e5e4] bg-white px-3 py-1.5 text-xs font-semibold text-[#18181b] outline-none focus:border-[#b8860b]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#18181b]">To:</label>
              <div className="relative flex items-center">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="rounded-full border border-[#e5e5e4] bg-white px-3 py-1.5 text-xs font-semibold text-[#18181b] outline-none focus:border-[#b8860b]"
                />
              </div>
            </div>

            <button
              onClick={fetchData}
              disabled={isLoading}
              className="rounded-full bg-[#b8860b] hover:bg-[#996515] px-4 py-1.5 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} /> Apply
            </button>
          </div>
        </div>

        {/* Quick Date Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#f4f4f3]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e8e] mr-2">Quick Range:</span>
          {[
            { id: "all", label: "All Time" },
            { id: "today", label: "Today" },
            { id: "this_month", label: "This Month" },
            { id: "last_month", label: "Last Month" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                setQuickDateFilter(pill.id as any);
                setFromDate("");
                setToDate("");
              }}
              className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
                quickDateFilter === pill.id
                  ? "bg-[#b8860b] text-white shadow-2xs"
                  : "bg-[#f4f4f3] text-[#71717a] hover:bg-[#e8e8e7]"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* PRIMARY FINANCIAL METRICS ROW (Calculated dynamically) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        
        {/* 1. Gross Stock: current selling-price value of inventory */}
        <div className="flex min-w-0 min-h-[132px] items-center gap-4 rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] p-5 shadow-2xs">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center shadow-xs">
            <TrendingUp size={20} />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-semibold text-[#71717a]">Gross Stock</span>
            <p className="break-words font-sans text-xl font-extrabold tracking-tight text-[#18181b] sm:text-2xl">
              {finances.grossStockUGX.toLocaleString()}
            </p>
            <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider font-sans">UGX</span>
          </div>
        </div>

        {/* 2. Total Received */}
        <div className="flex min-w-0 min-h-[132px] items-center gap-4 rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] p-5 shadow-2xs">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#b8860b] text-white flex items-center justify-center shadow-xs">
            <CreditCard size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-[#71717a] block">Total Received</span>
            <p className="break-words font-sans text-xl font-extrabold tracking-tight text-[#18181b] sm:text-2xl">
              {finances.totalReceivedUGX.toLocaleString()}
            </p>
            <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider font-sans">UGX</span>
          </div>
        </div>

        {/* 3. Total Orders */}
        <div className="flex min-w-0 min-h-[132px] items-center gap-4 rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] p-5 shadow-2xs">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#475569] text-white flex items-center justify-center shadow-xs">
            <PackageCheck size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-[#71717a] block">Total Orders</span>
            <p className="font-sans text-xl font-extrabold tracking-tight text-[#18181b] sm:text-2xl">{finances.orderCount}</p>
            <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Non-cancelled</span>
          </div>
        </div>

        {/* 4. Orders Completed */}
        <div className="flex min-w-0 min-h-[132px] items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-2xs">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#16a34a] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-emerald-700 block">Orders Completed</span>
            <p className="font-sans text-xl font-extrabold tracking-tight text-[#18181b] sm:text-2xl">{finances.completedOrderCount}</p>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Delivered</span>
          </div>
        </div>

        {/* 5. Gross Profit */}
        <div className="flex min-w-0 min-h-[132px] items-center gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-2xs">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center shadow-xs">
            <TrendingUp size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-[#71717a] block">Completed Gross Profit</span>
            <p className="break-words font-sans text-xl font-extrabold tracking-tight text-[#18181b] sm:text-2xl">{finances.totalGrossProfitUGX.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">UGX</span>
          </div>
        </div>

        {/* 6. Developer Commission (25% of completed gross profit) */}
        <div className="relative flex min-w-0 min-h-[132px] items-center gap-4 overflow-hidden rounded-2xl border border-[#d4af37]/40 bg-[#fffdf5] p-5 pt-10 shadow-xs sm:pt-5">
          <div className="absolute right-2.5 top-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#b8860b] text-white px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase shadow-2xs">
              Agreement 25%
            </span>
          </div>
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#b8860b] text-white flex items-center justify-center shadow-xs">
            <Code2 size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-[#b8860b] block">Dev Fee (25% Profit)</span>
            <p className="break-words font-sans text-xl font-extrabold tracking-tight text-[#18181b] sm:text-2xl">
              {finances.developerCommissionUGX.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-[#71717a] font-sans">
              <span className="font-bold uppercase tracking-wider text-[#b8860b]">UGX</span>
              <span>• ≈ ${finances.developerCommissionUSD.toLocaleString()} USD</span>
            </div>
          </div>
        </div>

        {/* 7. Store Owner Profit (75% of gross profit) */}
        <div className="flex min-w-0 min-h-[132px] items-center gap-4 rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] p-5 shadow-2xs">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#16a34a] text-white flex items-center justify-center shadow-xs">
            <Coins size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-[#71717a] block">Store Profit (75%)</span>
            <p className="break-words font-sans text-xl font-extrabold tracking-tight text-[#18181b] sm:text-2xl">
              {finances.storeNetPayoutUGX.toLocaleString()}
            </p>
            <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider font-sans">UGX</span>
          </div>
        </div>

        {/* 5. Invoices (Pending Accounts) */}
        <div className="flex min-w-0 min-h-[132px] items-center gap-4 rounded-2xl border border-[#e5e5e4] bg-[#f7f7f6] p-5 shadow-2xs">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#d97706] text-white flex items-center justify-center shadow-xs">
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-[#71717a] block">Invoices (Pending)</span>
            <p className="break-words font-sans text-xl font-extrabold tracking-tight text-[#18181b] sm:text-2xl">
              {finances.invoicesUGX.toLocaleString()}
            </p>
            <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider font-sans">UGX</span>
          </div>
        </div>

      </div>

      {/* DEVELOPER AGREEMENT & MONTH-END SETTLEMENT CARD */}
      <div className="rounded-3xl border border-[#d4af37]/30 bg-gradient-to-br from-[#fffdfa] to-[#faf6ed] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebdcb2]/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#b8860b] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Code2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#18181b] tracking-tight">
                Developer Platform Commission & Settlement Breakdown
              </h3>
              <p className="text-xs text-[#71717a] mt-0.5">
                Agreement terms: <span className="font-bold text-[#b8860b]">25% of gross profit</span> from completed (Delivered) orders, settled at month end.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fffcf0] border border-[#f3e5b8] px-3.5 py-1 text-xs font-bold text-[#b8860b]">
              <ShieldCheck size={14} className="text-[#b8860b]" /> End-of-Month Settlement
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          <div className="rounded-2xl bg-white p-4 border border-[#ebdcb2]/60 space-y-1 shadow-2xs">
            <p className="text-[11px] font-bold text-[#71717a] uppercase tracking-wider">Gross Platform Volume</p>
            <p className="font-sans text-xl font-extrabold text-[#18181b]">
              UGX {finances.totalSalesUGX.toLocaleString()}
            </p>
            <p className="text-[10px] text-[#71717a]">Selling-price value of {productsList.reduce((sum, product) => sum + (product.stockQuantity ?? 0), 0).toLocaleString()} bottles in stock</p>
          </div>

          <div className="rounded-2xl bg-[#fffcf0] p-4 border border-[#f3e5b8] space-y-1 shadow-2xs">
            <p className="text-[11px] font-bold text-[#b8860b] uppercase tracking-wider">Developer 25% Profit Share</p>
            <p className="font-sans text-xl font-extrabold text-[#b8860b]">
              UGX {finances.developerCommissionUGX.toLocaleString()}
            </p>
            <p className="text-[10px] text-[#854d0e] font-semibold">Total payout due to developer</p>
            <p className="text-[10px] text-[#71717a]">Base: UGX {finances.totalGrossProfitUGX.toLocaleString()} completed gross profit</p>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-[#ebdcb2]/60 space-y-1 shadow-2xs">
            <p className="text-[11px] font-bold text-[#16a34a] uppercase tracking-wider">Collected / Cleared Share</p>
            <p className="font-sans text-xl font-extrabold text-[#16a34a]">
              UGX {finances.developerPaidCommissionUGX.toLocaleString()}
            </p>
            <p className="text-[10px] text-[#71717a]">Based on {finances.completedOrderCount} completed orders</p>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-[#ebdcb2]/60 space-y-1 shadow-2xs">
            <p className="text-[11px] font-bold text-[#18181b] uppercase tracking-wider">Store Profit Retained (75%)</p>
            <p className="font-sans text-xl font-extrabold text-[#18181b]">
              UGX {finances.storeNetPayoutUGX.toLocaleString()}
            </p>
            <p className="text-[10px] text-[#71717a]">Remaining completed gross profit after developer share</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 border border-[#ebdcb2]/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold bg-[#f4f4f3] px-2 py-0.5 rounded border border-[#e4e4e7] text-[#18181b]">
              FORMULA: Completed Gross Profit × 0.25
            </span>
            <span className="text-[#71717a]">
              Calculation updates when orders become Delivered and products have a buying price.
            </span>
          </div>
          <div className="font-sans font-bold text-[#18181b] text-xs">
            Pending Collection: <span className="text-[#d97706]">UGX {finances.developerPendingCommissionUGX.toLocaleString()}</span>
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
                      {isVideoMedia(p.image) ? (
                        <FastVideo
                          src={p.image}
                          autoPlay
                          loop
                          muted
                          objectFit="contain"
                          className="h-full w-full rounded-lg"
                        />
                      ) : (
                        <img src={p.image} alt={p.name} className="h-full w-full object-contain" />
                      )}
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
