import { supabase, getProductsFromSupabase, SupabaseProductRow } from "@/lib/supabase";
import { Product, products as fallbackCatalog, getProductBySlug } from "@/data/products";

const PRODUCT_CACHE_TTL_MS = 60_000; // 60 seconds memory cache
let productCache: { products: Product[]; expiresAt: number } | null = null;
let productRequest: Promise<Product[]> | null = null;
let lastKnownGoodProducts: Product[] = [];

export function invalidateProductCache() {
  productCache = null;
  productRequest = null;
}

export function mapSupabaseProduct(sp: SupabaseProductRow | any): Product {
  const rawPriceUGX = Number(sp.price || 0);
  const numericUSD = Number((rawPriceUGX > 0 ? rawPriceUGX / 3700 : 94.59).toFixed(2));
  const stock = Number(sp.quantity_in_stock ?? 50);

  return {
    id: String(sp.id),
    name: sp.name || "Untitled Spirit",
    producer: sp.brand || "Magnum Reserve",
    origin: sp.country_of_origin || "Kampala, Uganda",
    category: sp.category || "Whiskey",
    price: `UGX ${rawPriceUGX.toLocaleString()}`,
    numericPrice: numericUSD,
    buyingPrice: Number(sp.buying_price ?? 0),
    abv: sp.abv ? `${sp.abv}% ABV` : "40.0% ABV",
    volume: sp.volume_ml ? `${sp.volume_ml} ml` : "750 ml",
    vintage: sp.vintage ? String(sp.vintage) : undefined,
    rating: "Reserve Selection",
    description: sp.description || "",
    tastingNotes: {
      nose: "Rich oak and honey",
      palate: "Velvety spice and vanilla",
      finish: "Smooth warming finish",
      pairing: "Sip neat or on the rocks",
    },
    image: sp.image_url || "/products/premium-liquor-don-julio-70-uganda.jpg",
    inStock: stock > 0 && sp.is_active !== false,
    stockQuantity: stock,
  };
}

/**
 * High-performance cached product catalog getter.
 * Deduplicates in-flight database requests and caches results in-memory.
 * Resilient against transient network drops (falls back to last-known-good catalog).
 */
export async function getStoreProductsCatalog(): Promise<Product[]> {
  const cached = productCache;
  if (cached && cached.expiresAt > Date.now() && cached.products.length > 0) {
    return cached.products;
  }

  if (productRequest) return productRequest;

  productRequest = (async () => {
    try {
      const supabaseProducts = await getProductsFromSupabase();
      const mappedList: Product[] = [];

      if (supabaseProducts && supabaseProducts.length > 0) {
        supabaseProducts.forEach((sp) => {
          mappedList.push(mapSupabaseProduct(sp));
        });
      }

      if (mappedList.length > 0) {
        lastKnownGoodProducts = mappedList;
        const existingNames = new Set(mappedList.map((p) => p.name.toLowerCase()));
        return [
          ...mappedList,
          ...fallbackCatalog.filter((fp) => !existingNames.has(fp.name.toLowerCase())),
        ];
      }

      // If Supabase returned empty/null due to a transient blip, use last known good
      if (lastKnownGoodProducts.length > 0) {
        return lastKnownGoodProducts;
      }

      return fallbackCatalog;
    } catch (err) {
      console.warn("Failed to get product catalog from Supabase:", err);
      return lastKnownGoodProducts.length > 0 ? lastKnownGoodProducts : fallbackCatalog;
    }
  })();

  try {
    const products = await productRequest;
    if (products.length > 0) {
      productCache = { products, expiresAt: Date.now() + PRODUCT_CACHE_TTL_MS };
    }
    return products;
  } finally {
    productRequest = null;
  }
}

/**
 * Robust product lookup by slug:
 * 1. Fast path: Search in-memory cached catalog.
 * 2. Fallback path: Targeted Supabase search by ID or fuzzy text tokens (e.g. courvoisier, xo).
 */
export async function findProductBySlug(slug: string): Promise<Product | undefined> {
  const catalog = await getStoreProductsCatalog();
  const found = getProductBySlug(slug, catalog);
  if (found) return found;

  // Fallback: Query Supabase directly for any matching bottle
  try {
    const rawSlug = decodeURIComponent(slug || "").trim().toLowerCase();
    const cleanTokens = rawSlug.replace(/[^a-z0-9]/g, " ").split(/\s+/).filter((t) => t.length > 1);

    if (cleanTokens.length > 0) {
      // 1. Try finding by first significant token (e.g. "courvoisier")
      const firstToken = cleanTokens[0];
      const { data, error } = await supabase
        .from("products")
        .select("id,name,brand,category,country_of_origin,price,buying_price,volume_ml,abv,quantity_in_stock,description,is_active,image_url,vintage")
        .or(`name.ilike.%${firstToken}%,brand.ilike.%${firstToken}%`);

      if (!error && data && data.length > 0) {
        const candidateProducts = data.map((row) => mapSupabaseProduct(row));
        const matched = getProductBySlug(slug, candidateProducts);
        if (matched) return matched;
        return candidateProducts[0];
      }
    }
  } catch (err) {
    console.warn("Targeted Supabase slug lookup exception:", err);
  }

  return undefined;
}
