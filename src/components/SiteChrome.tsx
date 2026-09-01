"use client";

import { usePathname } from "next/navigation";
import { Cart } from "./Cart";
import { Footer } from "./Footer";
import { CartProvider, useCart } from "./CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { Navbar } from "./Navbar";
import { AgeGate } from "./AgeGate";
import { ScrollBrandBanner } from "./ScrollBrandBanner";
import { HeroNavStrip } from "./HeroNavStrip";

function ChromeContent({ children }: { children: React.ReactNode }) {
  const { count, cartOpen, openCart, closeCart } = useCart();
  const pathname = usePathname();

  // Omit storefront chrome on Payload Admin & Custom Dashboard routes
  const isPayloadAdmin =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/api") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/login");

  if (isPayloadAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <AgeGate />
      <Navbar cartCount={count} onCartClick={openCart} />
      <HeroNavStrip />
      {children}
      <ScrollBrandBanner />
      <Footer />
      <Cart count={count} open={cartOpen} onClose={closeCart} />
    </>
  );
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <CartProvider>
          <ChromeContent>{children}</ChromeContent>
        </CartProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
