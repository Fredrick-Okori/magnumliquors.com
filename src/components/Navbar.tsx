"use client";

import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { useTheme } from "@/context/ThemeContext";

export function Navbar({
  cartCount = 0,
  onCartClick,
}: {
  cartCount?: number;
  onCartClick?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-300 ${
        isDark
          ? "border-white/10 bg-[#0c0a08]/95 text-white"
          : "border-neutral-200/80 bg-white/95 text-neutral-900"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
        
        {/* Mobile Hamburger Button */}
        <button
          className={`lg:hidden p-1 rounded-lg transition ${
            isDark ? "text-white hover:bg-white/10" : "text-neutral-900 hover:bg-neutral-100"
          }`}
          aria-label="Toggle navigation menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Brand Logo */}
        <Link
          href="/"
          className={`font-serif text-2xl font-bold tracking-tight lg:text-3xl ${
            isDark ? "text-white" : "text-neutral-900"
          }`}
        >
          MAGNUM<span className="text-[#b8860b]">.</span>
        </Link>

        {/* Main Navigation Links (Including Cart Nav Item) */}
        <nav
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 top-full z-20 w-full flex-col gap-5 border-b px-6 py-6 text-xs uppercase tracking-[0.18em] shadow-xl lg:static lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-8 lg:bg-transparent lg:border-none lg:p-0 lg:shadow-none ${
            isDark
              ? "bg-[#12100d] border-white/10 text-white"
              : "bg-white border-neutral-200 text-neutral-900"
          }`}
        >
          <Link
            href="/discover"
            onClick={() => setMenuOpen(false)}
            className="text-[#b8860b] font-bold hover:underline transition"
          >
            Shop all
          </Link>
          <Link
            href="/#shop"
            onClick={() => setMenuOpen(false)}
            className="hover:text-[#b8860b] transition font-medium"
          >
            Wine
          </Link>
          <Link
            href="/#shop"
            onClick={() => setMenuOpen(false)}
            className="hover:text-[#b8860b] transition font-medium"
          >
            Spirits
          </Link>
          <Link
            href="/#shop"
            onClick={() => setMenuOpen(false)}
            className="hover:text-[#b8860b] transition font-medium"
          >
            Bourbon
          </Link>
          <Link
            href="/#about"
            onClick={() => setMenuOpen(false)}
            className="hover:text-[#b8860b] transition font-medium"
          >
            Our story
          </Link>

          {/* CART NAV ITEM */}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              if (onCartClick) onCartClick();
            }}
            className="group inline-flex items-center gap-2 font-bold uppercase tracking-[0.18em] hover:text-[#b8860b] transition text-left"
          >
            <ShoppingBag size={15} className="text-[#b8860b] group-hover:scale-110 transition-transform" />
            <span>Cart</span>
            {cartCount > 0 ? (
              <span className="rounded-full bg-[#b8860b] px-2 py-0.5 text-[10px] font-extrabold text-white leading-none shadow-xs">
                {cartCount}
              </span>
            ) : (
              <span className="text-[10px] text-neutral-400 font-normal">
                (0)
              </span>
            )}
          </button>
        </nav>

        {/* Right Controls: Currency Switcher, Theme Switcher & Quick Cart Icon */}
        <div className="flex items-center gap-3">
          {/* Currency Switcher (UGX / USD) */}
          <CurrencySwitcher />

          {/* Theme Switcher Control */}
          <ThemeSwitcher />

          {/* Quick Cart Pill Button */}
          <button
            aria-label="Shopping cart"
            onClick={onCartClick}
            className={`relative flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-bold transition shadow-2xs ${
              isDark
                ? "border-white/10 bg-[#161310] text-white hover:border-[#b8860b]/40 hover:bg-[#1f1b16]"
                : "border-neutral-200/80 bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
            }`}
          >
            <ShoppingBag size={17} className="text-[#b8860b]" />
            <span className="hidden sm:inline font-mono">{cartCount}</span>
            {cartCount > 0 && (
              <span className="sm:hidden absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#b8860b] text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
