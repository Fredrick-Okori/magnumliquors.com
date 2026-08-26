import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://magnum-liquors-app.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZ251bS1saXF1b3JzLWFwcCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzE1MDA0ODAwLCJleHAiOjIwMzA1ODA4MDB9.magnum_anon_key_demo";

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
  items: Array<{
    productName: string;
    quantity: number;
    unitPriceUSD: number;
    subtotalUSD: number;
  }>;
  created_at?: string;
}

export interface SupabaseProduct {
  id?: string;
  name: string;
  producer: string;
  origin: string;
  category: string;
  price: string;
  numeric_price: number;
  badge?: string;
  abv: string;
  volume: string;
  vintage?: string;
  cask?: string;
  rating: string;
  description: string;
  image_url: string;
  in_stock: boolean;
  tasting_notes?: {
    nose: string;
    palate: string;
    finish: string;
    pairing: string;
  };
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
      // If user doesn't exist in Supabase auth yet, attempt auto-signup or fallback gracefully
      const signUpRes = await supabase.auth.signUp({ email, password });
      if (signUpRes.data.user) {
        return { user: signUpRes.data.user, error: null };
      }
      // Demo fallback if Supabase project credentials are mock
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
 * Save an incoming customer order to Supabase
 */
export async function saveOrderToSupabase(orderData: SupabaseOrder) {
  try {
    const { data, error } = await supabase.from("orders").insert([orderData]).select();
    if (error) {
      console.warn("Supabase insert order notice:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("Supabase order save exception:", err);
    return null;
  }
}

/**
 * Fetch all products from Supabase products table
 */
export async function getProductsFromSupabase(): Promise<SupabaseProduct[] | null> {
  try {
    const { data, error } = await supabase.from("products").select("*");
    if (error || !data) {
      console.warn("Supabase fetch products notice:", error?.message);
      return null;
    }
    return data as SupabaseProduct[];
  } catch (err) {
    console.warn("Supabase products fetch exception:", err);
    return null;
  }
}
