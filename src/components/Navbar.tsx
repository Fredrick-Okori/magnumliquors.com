"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { useTheme } from "@/context/ThemeContext";
import { Product, productHref } from "@/data/products";

export function Navbar({
  cartCount = 0,
  onCartClick,
}: {
  cartCount?: number;
  onCartClick?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!searchOpen || products.length > 0) return;

    fetch("/api/store-products", { cache: "force-cache" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, [searchOpen, products.length]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return products
      .filter((product) =>
        [product.name, product.producer, product.origin, product.category]
          .some((value) => value?.toLowerCase().includes(query))
      )
      .slice(0, 6);
  }, [products, searchQuery]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setSearchOpen(false);
    router.push(`/discover?search=${encodeURIComponent(query)}`);
  };

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
          aria-label="Magnum Liquors home"
          className="flex shrink-0 items-center"
        >
          <img
            src="/magnum_gold.png"
            alt="Magnum Liquors"
            width={132}
            height={40}
            className="h-8 w-auto object-contain lg:h-10"
          />
        </Link>

        {/* Main Navigation Links (Including Cart Nav Page Link) */}
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

          {/* CART NAV ITEM (Navigates to /cart) */}
          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
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
          </Link>
        </nav>

        {/* Right Controls: Search, Currency Switcher & Theme Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              aria-label="Search products"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                isDark ? "text-white hover:bg-white/10" : "text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              <Search size={18} />
            </button>

            {searchOpen && (
              <div className={`fixed left-4 right-4 top-20 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl p-3 shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[22rem] ${
                isDark ? "bg-[#161310] text-white" : "bg-white text-neutral-900"
              }`}>
                <form id="global-product-search" onSubmit={handleSearchSubmit}>
                  <div className="flex items-center gap-2 rounded-full border border-neutral-200/80 px-3 py-2">
                    <Search size={15} className="shrink-0 text-neutral-400" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search bottles, brands, origins..."
                      className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-neutral-400 sm:text-xs"
                    />
                  </div>
                </form>

                {searchQuery.trim() && (
                  <div className="mt-2 space-y-1">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={productHref(product)}
                        onClick={() => setSearchOpen(false)}
                        className="block rounded-lg px-2 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-white/10"
                      >
                        <span className="block truncate font-semibold">{product.name}</span>
                        <span className="block truncate text-[10px] text-neutral-500">{product.producer} · {product.category}</span>
                      </Link>
                    ))}
                    {searchResults.length === 0 && (
                      <p className="px-2 py-2 text-xs text-neutral-500">No bottles found.</p>
                    )}
                    <button
                      type="submit"
                      form="global-product-search"
                      className="w-full px-2 pt-2 text-left text-[11px] font-semibold text-[#b8860b] hover:underline"
                    >
                      View all search results
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Currency Switcher (UGX / USD) */}
          <CurrencySwitcher />

          {/* Theme Switcher Control */}
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
