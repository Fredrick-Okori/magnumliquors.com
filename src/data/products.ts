export interface Product {
  id: string;
  name: string;
  producer: string;
  origin: string;
  category: string;
  price: string;
  numericPrice: number;
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
 * Matches slugified name, compound name-origin, or numerical ID.
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

  // 1. Exact match against common slug combinations
  for (const p of list) {
    if (!p) continue;
    const nameSlug = slugify(p.name || "");
    const fullNameOriginSlug = slugify(`${p.name || ""} ${p.origin || ""}`);
    const fullProducerNameOriginSlug = slugify(`${p.producer || ""} ${p.name || ""} ${p.origin || ""}`);
    const fullProducerNameSlug = slugify(`${p.producer || ""} ${p.name || ""}`);
    const pId = String(p.id || "").trim().toLowerCase();
    const pName = (p.name || "").trim().toLowerCase();

    if (
      nameSlug === normalizedSlug ||
      fullNameOriginSlug === normalizedSlug ||
      fullProducerNameOriginSlug === normalizedSlug ||
      fullProducerNameSlug === normalizedSlug ||
      nameSlug === decoded ||
      pId === decoded ||
      pId === rawSlug ||
      pName === decoded
    ) {
      return p;
    }
  }

  // 2. Prefix / containment match
  for (const p of list) {
    if (!p) continue;
    const nameSlug = slugify(p.name || "");
    if (nameSlug && nameSlug.length >= 3 && (normalizedSlug.startsWith(nameSlug) || normalizedSlug.includes(nameSlug))) {
      return p;
    }
  }

  // 3. Reverse prefix match
  for (const p of list) {
    if (!p) continue;
    const nameSlug = slugify(p.name || "");
    if (nameSlug && nameSlug.startsWith(normalizedSlug) && normalizedSlug.length >= 3) {
      return p;
    }
  }

  return undefined;
}
