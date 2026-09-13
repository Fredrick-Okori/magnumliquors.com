import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover Fine Spirits & Estate Wines",
  description:
    "Explore our complete catalog of rare single malt whiskies, prestige champagnes, vintage estate wines, and small-batch gins. Filter by origin, category, and price for fast express delivery in Kampala.",
  alternates: {
    canonical: "/discover",
  },
  openGraph: {
    title: "The Master Collection — Fine Spirits & Vintage Wine | Magnum",
    description:
      "Explore rare vintage allocations and small batch single barrels curated from the world's most distinguished distilleries.",
    url: "/discover",
  },
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

