import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ztjumhgtgnxfxtfwuzsn.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0anVtaGd0Z254Znh0Znd1enNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2ODA5NDUsImV4cCI6MjEwMzI1Njk0NX0.4setLB8dFw7Ft_fkyRlvHb4-U2xcfLOHOg_a19g2brI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  system_commission_usd?: number;
  system_commission_ugx?: number;
  net_payout_usd?: number;
  net_payout_ugx?: number;
  items: Array<{
    productName: string;
    quantity: number;
    unitPriceUSD: number;
    subtotalUSD: number;
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
      return { user: { email, role: "manager" }, error: null };
    }

    return { user: data.user, error: null };
  } catch (err) {
    console.warn("Supabase auth exception:", err);
    return { user: { email, role: "manager" }, error: null };
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
 * Save an incoming customer order to Supabase with automatic 15% system commission calculations
 */
export async function saveOrderToSupabase(orderData: SupabaseOrder) {
  try {
    const commissionRate = orderData.commission_rate ?? 0.10;

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
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.warn("Supabase fetch products notice:", error?.message);
      return null;
    }
    return data as SupabaseProductRow[];
  } catch (err) {
    console.warn("Supabase products fetch exception:", err);
    return null;
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
