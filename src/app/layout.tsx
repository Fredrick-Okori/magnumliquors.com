import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans, Afacad_Flux } from "next/font/google";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

const afacadFlux = Afacad_Flux({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-afacad-flux",
});

export const metadata: Metadata = {
  title: "Magnum Liquors | Better bottles, delivered",
  description: "Thoughtfully sourced wine, spirits, and all the good stuff in between.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${cormorant.variable} ${plusJakarta.variable} ${afacadFlux.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
