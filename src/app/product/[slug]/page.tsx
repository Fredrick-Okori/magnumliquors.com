import type { Metadata } from "next";
import { getProductsFromSupabase } from "@/lib/supabase";
import { Product, getProductBySlug } from "@/data/products";
import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchProductsFromDb(): Promise<Product[]> {
  try {
    const supabaseProducts = await getProductsFromSupabase();
    if (!supabaseProducts || supabaseProducts.length === 0) return [];

    return supabaseProducts.map((sp: any) => ({
      id: String(sp.id),
      name: sp.name || "Untitled Spirit",
      producer: sp.producer || "Magnum Distillery",
      origin: sp.origin || "Kampala, Uganda",
      category: sp.category || "Spirits",
      price: sp.price || `UGX ${(Number(sp.numeric_price || 0) * 3700).toLocaleString()}`,
      numericPrice: Number(sp.numeric_price || 0),
      badge: sp.badge || undefined,
      abv: sp.abv || "40.0% ABV",
      volume: sp.volume || "750 ml",
      vintage: sp.vintage || undefined,
      cask: sp.cask || undefined,
      rating: sp.rating || "Reserve Selection",
      description: sp.description || "",
      tastingNotes: sp.tasting_notes || {
        nose: "",
        palate: "",
        finish: "",
        pairing: "",
      },
      image: sp.image_url || "/products/premium-liquor-don-julio-70-uganda.jpg",
      inStock: sp.in_stock !== false,
      stockQuantity: Number(sp.stock_quantity ?? 50),
    }));
  } catch (err) {
    console.warn("Supabase fetch exception in slug page:", err);
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug || "");

  let product: Product | undefined;
  try {
    const products = await fetchProductsFromDb();
    product = getProductBySlug(decodedSlug, products);
  } catch (err) {
    console.warn("Failed to fetch product for metadata:", err);
  }

  if (!product) {
    return {
      title: "Bottle Detail | Magnum Liquors",
      description: "Discover premium fine wine & spirits delivered by Magnum Liquors.",
    };
  }

  const title = `${product.name} — ${product.producer} (${product.origin}) | Magnum Liquors`;
  const description =
    product.description ||
    `Order ${product.name} (${product.volume}, ${product.abv}) online from Magnum Liquors. Fast delivery in Kampala, Uganda.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug || "");

  let initialProduct: Product | undefined;
  try {
    const products = await fetchProductsFromDb();
    initialProduct = getProductBySlug(decodedSlug, products);
  } catch (e) {}

  return (
    <ProductDetailClient
      initialSlug={decodedSlug}
      initialProduct={initialProduct}
    />
  );
}
