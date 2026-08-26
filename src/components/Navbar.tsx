"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { CurrencySwitcher } from "./CurrencySwitcher";

export function Navbar({
  cartCount = 0,
  onCartClick,
}: {
  cartCount?: number;
  onCartClick?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/95 text-neutral-900 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
        <button
          className="lg:hidden text-neutral-900"
          aria-label="Open menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link
          href="/"
          className="font-serif text-2xl font-bold tracking-tight lg:text-3xl text-neutral-900"
        >
          MAGNUM<span className="text-[#b8860b]">.</span>
        </Link>

        <nav
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 top-full z-20 w-full flex-col gap-5 bg-white border-b border-neutral-200 px-5 py-6 text-xs uppercase tracking-[0.18em] text-neutral-900 lg:static lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-8 lg:bg-transparent lg:border-none lg:p-0`}
        >
          <Link href="/discover" className="text-[#b8860b] font-semibold">
            Shop all
          </Link>
          <Link href="/#shop" className="hover:text-[#b8860b] transition">
            Wine
          </Link>
          <Link href="/#shop" className="hover:text-[#b8860b] transition">
            Spirits
          </Link>
          <Link href="/#shop" className="hover:text-[#b8860b] transition">
            Bourbon
          </Link>
          <Link href="/#about" className="hover:text-[#b8860b] transition">
            Our story
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Currency Switcher (UGX / USD) */}
          <CurrencySwitcher />

          {/* Theme Switcher Control */}
          <ThemeSwitcher />

          <button
            aria-label="Shopping bag"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200/80 bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition"
            onClick={onCartClick}
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d4af37] text-[9px] font-bold text-neutral-950">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
