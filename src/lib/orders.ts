import { supabase } from "@/lib/supabase";

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPriceUSD: number;
  subtotalUSD: number;
  unitBuyingPriceUGX?: number;
  grossProfitUGX?: number;
  developerProfitShareUGX?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
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

const ORDERS_CACHE_TTL_MS = 30_000; // 30 seconds memory cache
let ordersCache: { orders: Order[]; expiresAt: number } | null = null;
let ordersRequest: Promise<Order[]> | null = null;
let lastKnownGoodOrders: Order[] = [];

export function invalidateOrdersCache() {
  ordersCache = null;
  ordersRequest = null;
}

export function mapSupabaseOrder(so: any): Order {
  return {
    id: String(so.id),
    orderNumber: so.order_number || `MAG-${so.id}`,
    customerName: so.customer_name || "Valued Customer",
    customerEmail: so.customer_email || "N/A",
    customerPhone: so.customer_phone || "N/A",
    deliveryAddress: so.delivery_address || "Kampala, Uganda",
    orderStatus: so.order_status || "Pending",
    paymentMethod: so.payment_method || "Cash on Delivery",
    paymentStatus: so.payment_status || "Pending",
    totalAmountUSD: Number(so.total_amount_usd || 0),
    totalAmountUGX: Number(so.total_amount_ugx || 0),
    commissionRate: Number(so.commission_rate || 0.25),
    systemCommissionUSD: Number(so.system_commission_usd || 0),
    systemCommissionUGX: Number(so.system_commission_ugx || 0),
    netPayoutUSD: Number(so.net_payout_usd || 0),
    netPayoutUGX: Number(so.net_payout_ugx || 0),
    items: Array.isArray(so.items) ? so.items : [],
    createdAt: so.created_at || new Date().toISOString(),
  };
}

/**
 * High-performance cached orders getter with in-flight deduplication.
 * Eliminates slow multi-second roundtrips across all dashboard views.
 */
export async function getOrdersCatalog(): Promise<Order[]> {
  const cached = ordersCache;
  if (cached && cached.expiresAt > Date.now() && cached.orders.length > 0) {
    return cached.orders;
  }

  if (ordersRequest) return ordersRequest;

  ordersRequest = (async () => {
    try {
      const { data: supabaseOrders, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase orders query notice:", error.message);
        return lastKnownGoodOrders;
      }

      const mappedOrders = (supabaseOrders || []).map(mapSupabaseOrder);
      if (mappedOrders.length > 0) {
        lastKnownGoodOrders = mappedOrders;
      }
      return mappedOrders;
    } catch (err) {
      console.warn("Orders fetch exception:", err);
      return lastKnownGoodOrders;
    }
  })();

  try {
    const orders = await ordersRequest;
    ordersCache = { orders, expiresAt: Date.now() + ORDERS_CACHE_TTL_MS };
    return orders;
  } finally {
    ordersRequest = null;
  }
}

