import { getPayload } from "payload";
import configPromise from "@payload-config";
import { Product } from "@/data/products";
import { getProductsFromSupabase } from "./supabase";

// In-memory store for newly posted products during server session
const inMemoryProducts: Product[] = [];

export function addInMemoryProduct(product: Product) {
  inMemoryProducts.unshift(product);
}

export async function getProductsFromPayload(): Promise<Product[]> {
  const dbProducts: Product[] = [];

  // 1. Attempt Payload CMS Database Fetch
  try {
    const payload = await getPayload({ config: configPromise });
    const response = await payload.find({
      collection: "products",
      limit: 100,
    });

    if (response.docs && response.docs.length > 0) {
      response.docs.forEach((doc: any) => {
        let imageUrl = "/products/premium-liquor-don-julio-70-uganda.jpg";
        if (typeof doc.image === "string") {
          imageUrl = doc.image;
        } else if (typeof doc.image === "object" && doc.image !== null) {
          imageUrl = doc.image.url || (doc.image.filename ? `/media/${doc.image.filename}` : imageUrl);
        }

        dbProducts.push({
          id: String(doc.id),
          name: doc.name,
          producer: doc.producer,
          origin: doc.origin,
          category: doc.category,
          price: doc.price || `UGX ${(Number(doc.numericPrice || 0) * 3700).toLocaleString()}`,
          numericPrice: Number(doc.numericPrice || 0),
          badge: doc.badge || undefined,
          abv: doc.abv || "40.0% ABV",
          volume: doc.volume || "750 ml",
          vintage: doc.vintage || undefined,
          cask: doc.cask || undefined,
          rating: doc.rating || "Fine Liquor",
          description: doc.description || "",
          tastingNotes: {
            nose: doc.tastingNotes?.nose || "",
            palate: doc.tastingNotes?.palate || "",
            finish: doc.tastingNotes?.finish || "",
            pairing: doc.tastingNotes?.pairing || "",
          },
          image: imageUrl,
          inStock: doc.inStock !== false,
          stockQuantity: Number(doc.stockQuantity ?? 50),
        });
      });
    }
  } catch (error) {
    console.warn("Payload CMS products query fallback:", error);
  }

  // 2. Attempt Supabase Database Fetch
  try {
    const supabaseProducts = await getProductsFromSupabase();
    if (supabaseProducts && supabaseProducts.length > 0) {
      supabaseProducts.forEach((sp: any) => {
        if (!dbProducts.some((p) => String(p.id) === String(sp.id))) {
          dbProducts.push({
            id: String(sp.id),
            name: sp.name,
            producer: sp.producer,
            origin: sp.origin,
            category: sp.category,
            price: sp.price || `UGX ${(Number(sp.numeric_price || 0) * 3700).toLocaleString()}`,
            numericPrice: Number(sp.numeric_price || 0),
            badge: sp.badge || undefined,
            abv: sp.abv || "40.0% ABV",
            volume: sp.volume || "750 ml",
            vintage: sp.vintage || undefined,
            cask: sp.cask || undefined,
            rating: sp.rating || "Fine Liquor",
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
          });
        }
      });
    }
  } catch (supabaseErr) {
    console.warn("Supabase products fetch fallback:", supabaseErr);
  }

  // Combine in-memory created products with database products without duplicates
  const combined = [
    ...inMemoryProducts,
    ...dbProducts.filter((dbp) => !inMemoryProducts.some((imp) => String(imp.id) === String(dbp.id))),
  ];

  return combined;
}
