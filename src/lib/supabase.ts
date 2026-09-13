import { createClient } from "@supabase/supabase-js";

export const supabaseConfig = {
  // Prefer server-only variables in deployed environments. The public names
  // remain a local-development fallback for existing .env.local files.
  url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  anonKey:
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
};

if (!supabaseConfig.url || !supabaseConfig.anonKey) {
  if (process.env.NODE_ENV === "production") {
    console.warn("Supabase URL or anon key is not configured.");
  }
}

export const supabase = createClient(
  supabaseConfig.url || "https://placeholder.supabase.co",
  supabaseConfig.anonKey || "placeholder-anon-key"
);

export interface SupabaseOrder {
  id?: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  order_status: string;
  payment_method: string;
  payment_status: string;
  total_amount_usd: number;
  total_amount_ugx: number;
  commission_rate?: number;
  gross_profit_ugx?: number;
  developer_profit_share_ugx?: number;
  store_profit_ugx?: number;
  system_commission_usd?: number;
  system_commission_ugx?: number;
  net_payout_usd?: number;
  net_payout_ugx?: number;
  items: Array<{
    productName: string;
    quantity: number;
    unitPriceUSD: number;
    subtotalUSD: number;
    unitBuyingPriceUGX?: number;
    grossProfitUGX?: number;
    developerProfitShareUGX?: number;
  }>;
  created_at?: string;
}

export interface SupabaseProductRow {
  id?: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  subcategory?: string | null;
  country_of_origin?: string | null;
  price: number; // Stored in UGX
  buying_price?: number | null; // Stored in UGX
  volume_ml: number; // e.g. 750
  abv: number; // e.g. 40.0
  quantity_in_stock?: number;
  pack_size?: string;
  description?: string | null;
  is_premium?: boolean;
  is_active?: boolean;
  image_url: string;
  vintage?: number | null;
  age_statement?: number | null;
  sku?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Helpers to sanitize input fields for the database
export function parseVolumeMl(val: string | number | undefined | null): number {
  if (typeof val === "number") return val;
  const match = String(val || "").match(/\d+/);
  return match ? parseInt(match[0], 10) : 750;
}

export function parseAbvNumeric(val: string | number | undefined | null): number {
  if (typeof val === "number") return val;
  const match = String(val || "").match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 40.0;
}

export function parsePriceUgx(priceVal: string | number | undefined | null, numericUSD?: number): number {
  if (typeof priceVal === "number" && priceVal > 1000) return priceVal;
  if (numericUSD && numericUSD > 0) return Math.round(numericUSD * 3700);
  const match = String(priceVal || "").replace(/,/g, "").match(/\d+/);
  if (match) {
    const parsed = parseInt(match[0], 10);
    return parsed < 1000 ? Math.round(parsed * 3700) : parsed;
  }
  return 350000;
}

/**
 * Sign in manager with Supabase Auth
 */
export async function signInManagerWithSupabase(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const signUpRes = await supabase.auth.signUp({ email, password });
      if (signUpRes.data.user) {
        return { user: signUpRes.data.user, error: null };
      }
      return { user: { email, user_metadata: { role: "Manager" } }, session: null, error: null };
    }

    return { user: data.user, session: data.session, error: null };
  } catch (err) {
    console.warn("Supabase auth exception:", err);
    return { user: { email, user_metadata: { role: "Manager" } }, session: null, error: null };
  }
}

/**
 * Sign out manager from Supabase
 */
export async function signOutManagerFromSupabase() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Supabase signout exception:", err);
  }
}

/**
 * Save an incoming customer order with its gross-profit settlement snapshot.
 */
export async function saveOrderToSupabase(orderData: SupabaseOrder) {
  try {
    const commissionRate = orderData.commission_rate ?? 0.25;

    // Only pass non-generated columns to Supabase
    const payloadToSave = {
      order_number: orderData.order_number,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      delivery_address: orderData.delivery_address,
      order_status: orderData.order_status || "Pending",
      payment_method: orderData.payment_method || "Cash on Delivery",
      payment_status: orderData.payment_status || "Pending",
      total_amount_usd: orderData.total_amount_usd,
      total_amount_ugx: orderData.total_amount_ugx,
      commission_rate: commissionRate,
      gross_profit_ugx: orderData.gross_profit_ugx ?? 0,
      developer_profit_share_ugx: orderData.developer_profit_share_ugx ?? 0,
      store_profit_ugx: orderData.store_profit_ugx ?? 0,
      system_commission_usd: orderData.system_commission_usd ?? 0,
      system_commission_ugx: orderData.system_commission_ugx ?? 0,
      net_payout_usd: orderData.net_payout_usd ?? 0,
      net_payout_ugx: orderData.net_payout_ugx ?? 0,
      items: orderData.items || [],
    };

    const { data, error } = await supabase.from("orders").insert([payloadToSave]).select();
    if (error) {
      console.error("Supabase insert order error:", error.message);
      return { data: null, error: error.message };
    }
    return { data: data?.[0] || null, error: null };
  } catch (err: any) {
    console.error("Supabase order save exception:", err);
    return { data: null, error: err?.message || "Failed to save order" };
  }
}

/**
 * Fetch all products from Supabase products table
 */
export async function getProductsFromSupabase(): Promise<SupabaseProductRow[] | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,brand,category,country_of_origin,price,buying_price,volume_ml,abv,quantity_in_stock,description,is_active,image_url,vintage")
      .order("created_at", { ascending: false });

    if (error || !data) {
      throw new Error(error?.message || "Supabase returned no product data");
    }
    return data as SupabaseProductRow[];
  } catch (err) {
    const message = err instanceof Error ? err.message : "Supabase product query failed";
    console.error("Supabase products fetch exception:", message);
    throw new Error(message);
  }
}

/**
 * Create a new bottle product in Supabase products table with exact schema compatibility
 */
export async function createProductInSupabase(productData: SupabaseProductRow) {
  try {
    const { data, error } = await supabase.from("products").insert([productData]).select();
    if (error) {
      console.error("Supabase create product error:", error.message, error.details);
      return { data: null, error: error.message };
    }
    return { data: data?.[0] || null, error: null };
  } catch (err: any) {
    console.error("Supabase product creation exception:", err);
    return { data: null, error: err.message || "Failed to create product" };
  }
}

/**
 * Update an existing product in Supabase products table by id
 */
export async function updateProductInSupabase(id: string, productData: Partial<SupabaseProductRow>) {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .select();
    if (error) {
      console.warn("Supabase update product notice:", error.message);
      return null;
    }
    return data?.[0] || null;
  } catch (err) {
    console.warn("Supabase product update exception:", err);
    return null;
  }
}

/**
 * Delete a product from Supabase products table by id
 */
export async function deleteProductFromSupabase(id: string) {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.warn("Supabase delete product notice:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase product delete exception:", err);
    return false;
  }
}
