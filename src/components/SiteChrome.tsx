"use client";

import { Footer } from "./Footer";
import { CartProvider, useCart } from "./CartContext";
import { Navbar } from "./Navbar";
import { AgeGate } from "./AgeGate";
import { ScrollBrandBanner } from "./ScrollBrandBanner";
import { HeroNavStrip } from "./HeroNavStrip";
import { CookieConsent } from "./CookieConsent";

function ChromeContent({ children }: { children: React.ReactNode }) {
  const { count } = useCart();

  return (
    <>
      <AgeGate />
      <Navbar cartCount={count} />
      <HeroNavStrip />
      {children}
      <ScrollBrandBanner />
      <Footer />
      <CookieConsent />
    </>
  );
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return <CartProvider><ChromeContent>{children}</ChromeContent></CartProvider>;
}
