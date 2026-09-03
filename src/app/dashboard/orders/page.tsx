"use client";

import { useEffect, useState } from "react";
import { FileText, Printer, Search, X } from "lucide-react";
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
  customerPhone: string;
  deliveryAddress: string;
  orderStatus: "Pending" | "Processing" | "Out for Delivery" | "Delivered" | "Cancelled";
  paymentMethod: string;
  paymentStatus: string;
  totalAmountUSD: number;
  totalAmountUGX: number;
  commissionRate?: number;
  systemCommissionUSD?: number;
  systemCommissionUGX?: number;
  netPayoutUSD?: number;
  netPayoutUGX?: number;
  items: OrderItem[];
  createdAt: string;
}

const initialOrders: Order[] = [
  {
    id: "ord-101",
    orderNumber: "#MAG-8821",
    customerName: "Patrick Mugisha",
    customerPhone: "+256 772 123456",
    deliveryAddress: "Sturrock Road, Acacia Mall, Kampala",
    orderStatus: "Out for Delivery",
    paymentMethod: "MTN MoMo",
    paymentStatus: "Paid",
    totalAmountUSD: 280.0,
    totalAmountUGX: 1036000,
    commissionRate: 0.15,
    systemCommissionUSD: 42.0,
    systemCommissionUGX: 155400,
    netPayoutUSD: 238.0,
    netPayoutUGX: 880600,
    items: [
      { productName: "Don Julio 70 Añejo Cristalino", quantity: 2, unitPriceUSD: 85.0, subtotalUSD: 170.0 },
      { productName: "Hennessy VS Cognac", quantity: 2, unitPriceUSD: 55.0, subtotalUSD: 110.0 },
    ],
    createdAt: "2026-08-26 10:15 AM",
  },
  {
    id: "ord-102",
    orderNumber: "#MAG-8822",
    customerName: "Sarah Kintu",
    customerPhone: "+256 701 987654",
    deliveryAddress: "Kololo Heights, Kampala",
    orderStatus: "Processing",
    paymentMethod: "Airtel Money",
    paymentStatus: "Paid",
    totalAmountUSD: 195.0,
    totalAmountUGX: 721500,
    commissionRate: 0.15,
    systemCommissionUSD: 29.25,
    systemCommissionUGX: 108225,
    netPayoutUSD: 165.75,
    netPayoutUGX: 613275,
    items: [
      { productName: "Don Julio 1942 Extra Añejo", quantity: 1, unitPriceUSD: 195.0, subtotalUSD: 195.0 },
    ],
    createdAt: "2026-08-26 11:30 AM",
  },
  {
    id: "ord-103",
    orderNumber: "#MAG-8823",
    customerName: "David Ochieng",
    customerPhone: "+256 782 555123",
    deliveryAddress: "Nakasero Road, Kampala",
    orderStatus: "Delivered",
    paymentMethod: "Visa Card",
    paymentStatus: "Paid",
    totalAmountUSD: 407.0,
    totalAmountUGX: 1505900,
    commissionRate: 0.15,
    systemCommissionUSD: 61.05,
    systemCommissionUGX: 225885,
    netPayoutUSD: 345.95,
    netPayoutUGX: 1280015,
    items: [
      { productName: "Ruinart Blanc de Blancs", quantity: 3, unitPriceUSD: 110.0, subtotalUSD: 330.0 },
      { productName: "Glenfiddich 18 Year Single Malt", quantity: 1, unitPriceUSD: 130.0, subtotalUSD: 130.0 },
    ],
    createdAt: "2026-08-25 04:45 PM",
  },
];

export default function OrdersPage() {
  const { formatAmount } = useCurrency();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      let apiOrders: Order[] = [];
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        apiOrders = Array.isArray(data) ? data : data?.docs && Array.isArray(data.docs) ? data.docs : [];
      } catch (err) {
        console.warn("Failed to load orders from API:", err);
      }

      let localOrders: Order[] = [];
      try {
        const rawLocal = localStorage.getItem("magnum_placed_orders");
        if (rawLocal) {
          localOrders = JSON.parse(rawLocal);
        }
      } catch (e) {}

      // Combine both sources, prioritizing newly placed website orders and preventing duplicate order numbers
      const combined = [
        ...localOrders,
        ...apiOrders.filter((ao) => !localOrders.some((lo) => lo.orderNumber === ao.orderNumber)),
        ...initialOrders.filter((io) => !apiOrders.some((ao) => ao.orderNumber === io.orderNumber) && !localOrders.some((lo) => lo.orderNumber === io.orderNumber)),
      ];

      setOrders(combined);
    };

    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: Order["orderStatus"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );

    try {
      await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
    } catch (err) {
      console.warn("Failed to patch order status in Supabase:", err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      searchQuery === "" ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "active") return matchesSearch && o.orderStatus !== "Delivered";
    if (statusFilter === "completed") return matchesSearch && o.orderStatus === "Delivered";
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#18181b] tracking-tight">Customer Orders & Deliveries</h1>
          <p className="text-xs text-[#71717a] mt-1">Track incoming customer orders, manage status, and print invoices.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders..."
            className="w-full h-9 rounded-full border border-[#e5e5e4] bg-white pl-9 pr-4 text-xs outline-none focus:border-[#b8860b]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            statusFilter === "all"
              ? "bg-[#b8860b] text-white shadow-2xs"
              : "bg-white text-[#71717a] border border-[#e5e5e4] hover:border-[#18181b]"
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setStatusFilter("active")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            statusFilter === "active"
              ? "bg-[#b8860b] text-white shadow-2xs"
              : "bg-white text-[#71717a] border border-[#e5e5e4] hover:border-[#18181b]"
          }`}
        >
          Active Deliveries ({orders.filter((o) => o.orderStatus !== "Delivered").length})
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            statusFilter === "completed"
              ? "bg-[#b8860b] text-white shadow-2xs"
              : "bg-white text-[#71717a] border border-[#e5e5e4] hover:border-[#18181b]"
          }`}
        >
          Completed ({orders.filter((o) => o.orderStatus === "Delivered").length})
        </button>
      </div>

      {/* Orders List Card */}
      <div className="rounded-3xl border border-[#e5e5e4] bg-white p-6 shadow-2xs space-y-4">
        <div className="divide-y divide-[#f4f4f3]">
          {filteredOrders.map((order) => (
            <div key={order.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-sans text-xs font-extrabold text-[#18181b] bg-[#f4f4f3] px-2 py-0.5 rounded border border-[#e4e4e7]">
                    {order.orderNumber}
                  </span>
                  <span className="rounded-full bg-[#fffcf0] border border-[#f3e5b8] px-2.5 py-0.5 text-[10px] font-bold text-[#b8860b]">
                    {order.paymentMethod}
                  </span>
                  <span className="text-[10px] text-[#71717a] font-sans">{order.createdAt}</span>
                </div>

                <p className="text-xs font-semibold text-[#18181b]">{order.customerName} ({order.customerPhone})</p>
                <p className="text-[11px] text-[#71717a]">{order.deliveryAddress}</p>

                <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-bold font-sans">
                  <span className="font-sans text-sm font-extrabold text-[#b8860b] tracking-tight">
                    Total: {formatAmount(order.totalAmountUSD)}
                  </span>
                  <span className="text-[#b8860b] text-[10px] font-sans font-bold bg-[#fffcf0] border border-[#f3e5b8] px-2 py-0.5 rounded-full">
                    10% Dev Fee: UGX {Math.round((order.totalAmountUGX || order.totalAmountUSD * 3700) * 0.10).toLocaleString()}
                  </span>
                  <span className="text-[#16a34a] text-[10px] font-sans font-bold bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    90% Store Net: UGX {Math.round((order.totalAmountUGX || order.totalAmountUSD * 3700) * 0.90).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedInvoiceOrder(order)}
                  className="rounded-full border border-[#e5e5e4] bg-white px-3.5 py-1.5 text-xs font-bold text-[#18181b] hover:bg-[#f4f4f3] transition flex items-center gap-1.5 shadow-2xs"
                >
                  <FileText size={13} className="text-[#b8860b]" /> Invoice
                </button>

                <select
                  value={order.orderStatus}
                  onChange={(e) => handleUpdateStatus(order.id, e.target.value as any)}
                  className={`rounded-full px-3 py-1 text-xs font-bold border outline-none cursor-pointer ${
                    order.orderStatus === "Pending"
                      ? "bg-red-100 text-red-700 border-red-200"
                      : order.orderStatus === "Out for Delivery"
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-[#fffcf0] text-[#b8860b] border-[#f3e5b8]"
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
          ))}
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-8 text-[#18181b] shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#18181b]">Invoice Details</h3>
                <p className="text-xs text-[#71717a] mt-0.5 font-sans">{selectedInvoiceOrder.orderNumber} • {selectedInvoiceOrder.createdAt}</p>
              </div>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f4f3] text-[#71717a] hover:bg-[#e4e4e7] transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-2xl bg-[#faf8f5] p-4 border border-[#f3e5b8]">
                <p className="font-bold text-[#18181b]">Customer Information</p>
                <p className="text-[#71717a] mt-1">{selectedInvoiceOrder.customerName} ({selectedInvoiceOrder.customerPhone})</p>
                <p className="text-[#71717a] text-[11px] mt-0.5">{selectedInvoiceOrder.deliveryAddress}</p>
              </div>

              <div className="space-y-2 pt-2">
                <p className="font-bold text-[#18181b] border-b border-neutral-200 pb-1">Items Ordered</p>
                {selectedInvoiceOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-neutral-100">
                    <div>
                      <p className="font-semibold text-[#18181b]">{item.productName}</p>
                      <p className="text-[10px] text-[#71717a] font-sans">{item.quantity} x ${item.unitPriceUSD.toFixed(2)}</p>
                    </div>
                    <p className="font-sans font-extrabold text-[#18181b]">${item.subtotalUSD.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-sm font-bold border-t border-neutral-200">
                <span>Grand Total:</span>
                <span className="font-sans text-xl font-extrabold text-[#b8860b] tracking-tight">
                  {formatAmount(selectedInvoiceOrder.totalAmountUSD)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-200">
              <button
                onClick={() => window.print()}
                className="rounded-full bg-[#b8860b] hover:bg-[#996515] px-6 py-2.5 text-xs font-bold text-white transition flex items-center gap-2"
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
