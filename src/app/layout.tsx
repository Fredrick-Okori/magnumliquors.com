import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans, Afacad_Flux } from "next/font/google";
import { StoreJsonLd } from "@/components/JsonLd";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const afacadFlux = Afacad_Flux({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-afacad-flux",
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://magnumliquors.com";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a08" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Magnum Fine Wine & Spirits | Luxury Liquor Store & Express Delivery in Kampala",
    template: "%s | Magnum Fine Wine & Spirits",
  },
  description:
    "Kampala's premier luxury liquor merchant. Buy rare single malt whiskey, prestige champagnes, vintage estate wines, and artisanal spirits with climate-controlled 45-min express delivery in Uganda.",
  keywords: [
    "Magnum Liquors",
    "liquor store Kampala",
    "buy whiskey Uganda",
    "wine delivery Kampala",
    "champagne delivery Uganda",
    "luxury spirits Kampala",
    "Don Julio Uganda",
    "Johnnie Walker Blue Label Kampala",
    "online alcohol store Uganda",
    "rare single malts",
  ],
  authors: [{ name: "Magnum Fine Wine & Spirits" }],
  creator: "Magnum Liquors",
  publisher: "Magnum Liquors",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Magnum Fine Wine & Spirits | Rare Liquor & Express Delivery Kampala",
    description:
      "Curated rare single malts, estate vintage wines, and luxury spirits delivered in climate-controlled packaging across Kampala.",
    url: BASE_URL,
    siteName: "Magnum Fine Wine & Spirits",
    images: [
      {
        url: "/Screenshot 2026-08-22 at 22.19.03_converted.avif",
        width: 1200,
        height: 630,
        alt: "Magnum Fine Wine & Spirits Vault Collection",
      },
    ],
    locale: "en_UG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Magnum Fine Wine & Spirits | Luxury Liquor Store Kampala",
    description:
      "Buy rare whiskey, prestige champagnes, and fine wines online with 45-min express delivery in Kampala.",
    images: ["/Screenshot 2026-08-22 at 22.19.03_converted.avif"],
    creator: "@magnumliquors",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/magnum_logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`h-full antialiased ${cormorant.variable} ${plusJakarta.variable} ${afacadFlux.variable}`}
    >
      <head>
        <StoreJsonLd />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SpeedInsights />
        {children}
      </body>
    </html>
  );
}
