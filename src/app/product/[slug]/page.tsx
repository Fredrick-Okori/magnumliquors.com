import { cache } from "react";
import type { Metadata } from "next";
import { getStoreProductsCatalog, findProductBySlug } from "@/lib/products";
import { Product } from "@/data/products";
import ProductDetailClient from "./ProductDetailClient";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// React request-scoped deduplication
const getCatalog = cache(async (): Promise<Product[]> => {
  return await getStoreProductsCatalog();
});

const getBottleBySlug = cache(async (slug: string): Promise<Product | undefined> => {
  return await findProductBySlug(slug);
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug || "");

  let product: Product | undefined;
  try {
    product = await getBottleBySlug(decodedSlug);
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
  let initialRelatedProducts: Product[] = [];

  try {
    initialProduct = await getBottleBySlug(decodedSlug);
    const products = await getCatalog();
    if (initialProduct) {
      initialRelatedProducts = products
        .filter((p) => p.id !== initialProduct?.id)
        .slice(0, 3);
    } else {
      initialRelatedProducts = products.slice(0, 3);
    }
  } catch (e) {
    console.warn("Error getting product for page:", e);
  }

  return (
    <>
      {initialProduct && (
        <>
          <ProductJsonLd product={initialProduct} />
          <BreadcrumbJsonLd
            items={[
              { name: "Home", url: "/" },
              { name: "Discover", url: "/discover" },
              { name: initialProduct.category || "Spirits", url: `/discover?category=${initialProduct.category}` },
              { name: initialProduct.name, url: `/product/${decodedSlug}` },
            ]}
          />
        </>
      )}
      <ProductDetailClient
        initialSlug={decodedSlug}
        initialProduct={initialProduct}
        initialRelatedProducts={initialRelatedProducts}
      />
    </>
  );
}
