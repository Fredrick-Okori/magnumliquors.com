import { getPayload } from "payload";
import configPromise from "@payload-config";
import { products as fallbackProducts, Product } from "@/data/products";
import { getProductsFromSupabase } from "./supabase";

export async function getProductsFromPayload(): Promise<Product[]> {
  // 1. Attempt Payload CMS Database Fetch
  try {
    const payload = await getPayload({ config: configPromise });
    const response = await payload.find({
      collection: "products",
      limit: 100,
    });

    if (response.docs && response.docs.length > 0) {
      return response.docs.map((doc: any) => {
        let imageUrl = "/products/premium-liquor-don-julio-70-uganda.jpg";
        if (typeof doc.image === "string") {
          imageUrl = doc.image;
        } else if (typeof doc.image === "object" && doc.image !== null) {
          imageUrl = doc.image.url || (doc.image.filename ? `/media/${doc.image.filename}` : imageUrl);
        }

        return {
          id: String(doc.id),
          name: doc.name,
          producer: doc.producer,
          origin: doc.origin,
          category: doc.category,
          price: doc.price,
          numericPrice: Number(doc.numericPrice),
          badge: doc.badge || undefined,
          abv: doc.abv,
          volume: doc.volume,
          vintage: doc.vintage || undefined,
          cask: doc.cask || undefined,
          rating: doc.rating,
          description: doc.description,
          tastingNotes: {
            nose: doc.tastingNotes?.nose || "",
            palate: doc.tastingNotes?.palate || "",
            finish: doc.tastingNotes?.finish || "",
            pairing: doc.tastingNotes?.pairing || "",
          },
          image: imageUrl,
          inStock: doc.inStock !== false,
        };
      });
    }
  } catch (error) {
    console.warn("Payload CMS products query fallback:", error);
  }

  // 2. Attempt Supabase Database Fetch
  try {
    const supabaseProducts = await getProductsFromSupabase();
    if (supabaseProducts && supabaseProducts.length > 0) {
      return supabaseProducts.map((sp) => ({
        id: String(sp.id),
        name: sp.name,
        producer: sp.producer,
        origin: sp.origin,
        category: sp.category,
        price: sp.price,
        numericPrice: Number(sp.numeric_price),
        badge: sp.badge || undefined,
        abv: sp.abv,
        volume: sp.volume,
        vintage: sp.vintage || undefined,
        cask: sp.cask || undefined,
        rating: sp.rating,
        description: sp.description,
        tastingNotes: sp.tasting_notes || {
          nose: "",
          palate: "",
          finish: "",
          pairing: "",
        },
        image: sp.image_url || "/products/premium-liquor-don-julio-70-uganda.jpg",
        inStock: sp.in_stock !== false,
      }));
    }
  } catch (supabaseErr) {
    console.warn("Supabase products fetch fallback:", supabaseErr);
  }

  // 3. Fallback Dataset
  return fallbackProducts;
}
