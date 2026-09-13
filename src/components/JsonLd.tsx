import React from "react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://magnumliquors.com";

export function StoreJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LiquorStore",
    "@id": `${BASE_URL}/#store`,
    name: "Magnum Fine Wine & Spirits",
    alternateName: "Magnum Liquors Kampala",
    url: BASE_URL,
    logo: `${BASE_URL}/magnum_gold.png`,
    image: `${BASE_URL}/Screenshot 2026-08-22 at 22.19.03_converted.avif`,
    description:
      "Premier luxury liquor store and wine merchant in Kampala, Uganda. Fast climate-controlled express delivery of rare single malts, estate wines, champagne, and artisanal spirits.",
    telephone: "+256 700 000000",
    email: "concierge@magnumliquors.com",
    priceRange: "$$$$",
    currenciesAccepted: "UGX",
    paymentAccepted: "Cash, Mobile Money, Visa, Mastercard",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Acacia Avenue / Kololo",
      addressLocality: "Kampala",
      addressRegion: "Central Region",
      addressCountry: "UG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 0.3344,
      longitude: 32.5892,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "23:00",
      },
    ],
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "UG",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 3,
      returnMethod: "https://schema.org/ReturnInStore",
      returnFees: "https://schema.org/FreeReturn",
    },
    sameAs: [
      "https://instagram.com/magnumliquors",
      "https://facebook.com/magnumliquors",
      "https://twitter.com/magnumliquors",
    ],
  };

  const websiteSchema = {
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "Magnum Liquors",
    description: "Better bottles, delivered. Rare Single Malts, Fine Wines & Spirits.",
    publisher: {
      "@id": `${BASE_URL}/#store`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/discover?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}

export function ProductJsonLd({
  product,
}: {
  product: {
    id: string;
    name: string;
    producer: string;
    origin?: string;
    description?: string;
    image?: string;
    numericPrice: number;
    category?: string;
    rating?: string | number;
    inStock?: boolean;
    sku?: string;
  };
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image ? [product.image] : [],
    description:
      product.description ||
      `Buy authentic ${product.name} from ${product.producer}. Premium liquor delivery in Kampala with Magnum Liquors.`,
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: product.producer,
    },
    category: product.category,
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: typeof product.rating === "string" ? parseFloat(product.rating) || 4.9 : product.rating,
          reviewCount: 28,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/product/${product.id}`,
      priceCurrency: "UGX",
      price: Math.round(product.numericPrice * 3700),
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock !== false
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "LiquorStore",
        name: "Magnum Fine Wine & Spirits",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

