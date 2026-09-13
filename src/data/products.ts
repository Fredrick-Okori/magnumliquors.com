export interface Product {
  id: string;
  name: string;
  producer: string;
  origin: string;
  category: string;
  price: string;
  numericPrice: number;
  buyingPrice: number;
  oldPrice?: string;
  badge?: string;
  abv: string;
  volume: string;
  vintage?: string;
  cask?: string;
  rating: string;
  description: string;
  tastingNotes: {
    nose: string;
    palate: string;
    finish: string;
    pairing: string;
  };
  image: string;
  inStock: boolean;
  stockQuantity: number;
}

// Live product catalog populated dynamically from Supabase & Payload CMS DB
export const products: Product[] = [];

/** Convert a product name or text into a URL-safe slug, e.g. "Don Julio 1942 Añejo" → "don-julio-1942-anejo" */
export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .normalize("NFD")                        // decompose accented chars
    .replace(/[\u0300-\u036f]/g, "")         // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")           // remove non-alphanumeric except spaces/hyphens
    .replace(/\s+/g, "-")                    // spaces → hyphens
    .replace(/-+/g, "-");                    // collapse multiple hyphens
}

/** Build the canonical product detail URL using the product name slug */
export function productHref(product: Product): string {
  if (!product) return "/#shop";
  const nameSlug = slugify(product.name || "");
  const slug = nameSlug || slugify(product.producer || "") || String(product.id || "");
  return `/product/${slug}`;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => String(p.id) === String(id));
}

/**
 * Slug lookup against live database products:
 * 1. Exact match (name slug, full producer+name slug, compound origin slug, raw decoded name, or ID).
 * 2. Prefix & containment matches across all slug combinations.
 * 3. Token-set matching (all distinct words in the slug must exist in product attributes).
 */
export function getProductBySlug(rawSlug: string, list: Product[]): Product | undefined {
  if (!rawSlug || !Array.isArray(list) || list.length === 0) return undefined;
  
  let decoded = rawSlug;
  try {
    decoded = decodeURIComponent(rawSlug).trim().toLowerCase();
  } catch (e) {
    decoded = rawSlug.trim().toLowerCase();
  }

  const normalizedSlug = slugify(decoded);
  if (!normalizedSlug) return undefined;

  // Pass 1: Exact matches against all primary slug configurations
  for (const p of list) {
    if (!p) continue;
    const nameSlug = slugify(p.name || "");
    const fullProducerNameSlug = slugify(`${p.producer || ""} ${p.name || ""}`);
    const fullNameOriginSlug = slugify(`${p.name || ""} ${p.origin || ""}`);
    const fullProducerNameOriginSlug = slugify(`${p.producer || ""} ${p.name || ""} ${p.origin || ""}`);
    const pId = String(p.id || "").trim().toLowerCase();
    const pName = (p.name || "").trim().toLowerCase();

    if (
      nameSlug === normalizedSlug ||
      fullProducerNameSlug === normalizedSlug ||
      fullNameOriginSlug === normalizedSlug ||
      fullProducerNameOriginSlug === normalizedSlug ||
      nameSlug === decoded ||
      pId === decoded ||
      pId === rawSlug ||
      pName === decoded
    ) {
      return p;
    }
  }

  // Pass 2: Prefix and containment matches across both directions
  for (const p of list) {
    if (!p) continue;
    const nameSlug = slugify(p.name || "");
    const fullProducerNameSlug = slugify(`${p.producer || ""} ${p.name || ""}`);
    const fullNameOriginSlug = slugify(`${p.name || ""} ${p.origin || ""}`);

    const candidates = [nameSlug, fullProducerNameSlug, fullNameOriginSlug].filter(Boolean);

    for (const c of candidates) {
      if (
        (c.length >= 3 && (normalizedSlug.startsWith(c) || normalizedSlug.includes(c))) ||
        (normalizedSlug.length >= 3 && (c.startsWith(normalizedSlug) || c.includes(normalizedSlug)))
      ) {
        return p;
      }
    }
  }

  // Pass 3: Token-Set Intersection Match
  // E.g. "courvoisier-xo" -> tokens ["courvoisier", "xo"]
  // Matches "Courvoisier Cognac XO", "Courvoisier Imperial XO", etc.
  const slugTokens = normalizedSlug.split("-").filter((t) => t.length > 0);
  if (slugTokens.length > 0) {
    let bestProduct: Product | undefined;
    let maxMatchedTokens = 0;

    for (const p of list) {
      if (!p) continue;
      const combinedText = slugify(`${p.producer || ""} ${p.name || ""} ${p.category || ""} ${p.origin || ""}`);
      const productTokens = new Set(combinedText.split("-").filter((t) => t.length > 0));

      const matchedCount = slugTokens.filter((token) => productTokens.has(token) || combinedText.includes(token)).length;

      // If all slug tokens match this product
      if (matchedCount === slugTokens.length && matchedCount > maxMatchedTokens) {
        maxMatchedTokens = matchedCount;
        bestProduct = p;
      }
    }

    if (bestProduct) {
      return bestProduct;
    }
  }

  return undefined;
}
