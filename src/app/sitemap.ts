import type { MetadataRoute } from "next";
import { getStoreProductsCatalog } from "@/lib/products";
import { slugify } from "@/data/products";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://magnumliquors.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/discover`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/cart`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  // Dynamic Product Pages from Database
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const dbProducts = await getStoreProductsCatalog();

    if (Array.isArray(dbProducts) && dbProducts.length > 0) {
      productRoutes = dbProducts.map((p) => {
        const productSlug = slugify(p.name) || p.id;
        return {
          url: `${BASE_URL}/product/${productSlug}`,
          lastModified: currentDate,
          changeFrequency: "daily" as const,
          priority: 0.8,
        };
      });
    }
  } catch (error) {
    console.warn("Failed to generate dynamic product sitemap:", error);
  }

  return [...staticRoutes, ...productRoutes];
}
