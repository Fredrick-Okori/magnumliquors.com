"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Filter,
  Search,
  Sparkles,
  Flame,
  GlassWater,
  Wine,
  Beer,
  LayoutGrid,
} from "lucide-react";
import { Hero } from "@/components/Hero";
import { BrandsShelf } from "@/components/BrandsShelf";
import { useCart } from "@/components/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useTheme } from "@/context/ThemeContext";
import { products, Product, productHref } from "@/data/products";
import { FastVideo, isVideoMedia } from "@/components/FastVideo";

const categories = [
  { name: "All bottles", icon: LayoutGrid },
  { name: "Whiskey", icon: GlassWater },
  { name: "Rum", icon: Flame },
  { name: "Vodka", icon: Sparkles },
  { name: "Liqueur", icon: Wine },
  { name: "Gin", icon: Beer },
  { name: "Tequila", icon: Flame },
  { name: "Brandy", icon: GlassWater },
  { name: "Champagne", icon: Sparkles },
  { name: "Wine", icon: Wine },
];

function ProductCardSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={`relative flex flex-col justify-between rounded-3xl border p-4 animate-pulse transition-all ${
        isDark
          ? "border-white/10 bg-[#14120f]/80"
          : "border-neutral-200/70 bg-white/80"
      }`}
    >
      {/* Image container skeleton */}
      <div
        className={`relative flex aspect-[1.1] w-full items-center justify-center overflow-hidden rounded-2xl ${
          isDark ? "bg-[#1c1813]" : "bg-neutral-100"
        }`}
      >
        <div className="absolute left-3.5 top-3.5 h-6 w-24 rounded-full bg-black/10 dark:bg-white/10" />
        <div className="absolute right-3.5 top-3.5 h-9 w-9 rounded-full bg-black/10 dark:bg-white/10" />
      </div>

      {/* Meta & Info skeleton */}
      <div className="flex items-end justify-between gap-3 pt-4 px-2 pb-1">
        <div className="space-y-2 flex-1">
          <div className={`h-3 w-28 rounded-md ${isDark ? "bg-white/10" : "bg-neutral-200"}`} />
          <div className={`h-5 w-44 rounded-md ${isDark ? "bg-white/15" : "bg-neutral-300"}`} />
        </div>

        <div className="flex flex-col items-end space-y-2">
          <div className={`h-4 w-16 rounded-md ${isDark ? "bg-white/15" : "bg-neutral-300"}`} />
          <div className={`h-3 w-10 rounded-md ${isDark ? "bg-[#b8860b]/30" : "bg-neutral-200"}`} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeCategory, setActiveCategory] = useState("All bottles");
  const [query, setQuery] = useState("");
  const [addedProduct, setAddedProduct] = useState<string | null>(null);
  const [productList, setProductList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart, openCart } = useCart();
  const { formatAmount } = useCurrency();

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/store-products")
      .then((res) => res.json())
      .then((data) => {
        const apiList = Array.isArray(data) ? data : [];
        let localProducts: Product[] = [];
        try {
          localProducts = JSON.parse(localStorage.getItem("magnum_added_products") || "[]");
        } catch (e) {}

        let deletedIds = new Set<string>();
        try {
          const raw = localStorage.getItem("magnum_deleted_product_ids");
          deletedIds = new Set(raw ? JSON.parse(raw) : []);
        } catch (e) {}

        const combined = [
          ...localProducts,
          ...apiList.filter((ap) => !localProducts.some((lp) => String(lp.id) === String(ap.id))),
        ].filter((p) => !deletedIds.has(String(p.id)));

        setProductList(combined);
      })
      .catch((err) => console.warn("Failed to load store products:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedProduct(product.id);
    setTimeout(() => setAddedProduct(null), 1200);
  };

  const visibleProducts = useMemo(() => {
    return productList.filter((product) => {
      const matchesCategory =
        activeCategory === "All bottles" || product.category === activeCategory;
      const matchesQuery = `${product.name} ${product.producer}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [productList, activeCategory, query]);

  return (
    <div className="min-h-screen transition-colors duration-300">
      <main>
        {/* Sleek Hero Component */}
        <Hero />

        {/* Redesigned Products Section matching Reference UI (Dark/Light compatible) */}
        <section id="shop" className="mx-auto max-w-7xl px-5 py-14 lg:px-10 lg:py-20">
          
          {/* Section Header: Title & Refined Search Bar */}
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8860b]">
                Curated Selection
              </p>
              <h2 className={`mt-1 font-serif text-3xl font-light tracking-tight sm:text-4xl ${isDark ? "text-white" : "text-neutral-900"}`}>
                Signature Cellar Allocations
              </h2>
            </div>

            {/* Glassmorphic Search Bar */}
            <div className="relative w-full md:w-80">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search vintage, brand or origin..."
                className={`w-full rounded-full border py-3 pl-11 pr-5 text-xs outline-none transition-all shadow-xs ${
                  isDark
                    ? "border-white/10 bg-[#161310]/80 text-white placeholder:text-neutral-500 focus:border-[#b8860b] focus:bg-[#1a1713]"
                    : "border-neutral-200/80 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900"
                }`}
              />
            </div>
          </div>

          {/* Category Filter Pills (Glass Pill Style with Icons) */}
          <div className="mb-10 flex items-center justify-between gap-4 border-b pb-4 overflow-x-auto scrollbar-none border-neutral-200/60 dark:border-white/10">
            <div className="flex items-center gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                      isActive
                        ? isDark
                          ? "bg-[#b8860b] text-white shadow-lg shadow-[#b8860b]/20 scale-105"
                          : "bg-neutral-900 text-white shadow-md scale-105"
                        : isDark
                        ? "border border-white/10 bg-[#14120f] text-neutral-300 hover:border-white/20 hover:text-white"
                        : "border border-neutral-200/80 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
                    }`}
                  >
                    <Icon size={14} className={isActive ? (isDark ? "text-white" : "text-[#d4af37]") : "text-neutral-400"} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Filter Info / Total counter */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-neutral-400">
              <Filter size={14} />
              <span>
                {isLoading ? "Loading bottles..." : `${visibleProducts.length} ${visibleProducts.length === 1 ? "bottle" : "bottles"}`}
              </span>
            </div>
          </div>

          {/* Products Grid Layout (Skeletons during load vs Real Cards) */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {Array.from({ length: 6 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} isDark={isDark} />
              ))}
            </div>
          ) : visibleProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {visibleProducts.map((product) => (
                <article
                  key={product.id}
                  className={`group relative flex flex-col justify-between rounded-3xl border p-4 transition-all duration-300 hover:-translate-y-1 ${
                    isDark
                      ? "border-white/10 bg-[#14120f] shadow-[0_4px_25px_rgba(0,0,0,0.5)] hover:border-[#b8860b]/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.8)]"
                      : "border-neutral-200/70 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl"
                  }`}
                >
                  {/* Product Image Container Stretched Edge-to-Edge */}
                  <Link
                    href={productHref(product)}
                    className={`relative flex aspect-[1.1] w-full items-center justify-center overflow-hidden rounded-2xl ${
                      isDark ? "bg-[#0c0a08]" : "bg-[#fafafa]"
                    }`}
                  >
                    {/* Floating Upper Contents Overlay: Badge & Circular Arrow Button */}
                    <div className="absolute left-3.5 top-3.5 right-3.5 z-10 flex items-center justify-between pointer-events-none">
                      {product.badge ? (
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md px-3 py-1 text-[11px] font-semibold shadow-xs ${
                            isDark
                              ? "border-[#b8860b]/40 bg-[#1c1813]/90 text-[#e5c875]"
                              : "border-[#f3e5b8]/90 bg-[#fffcf0]/90 text-[#b8860b]"
                          }`}
                        >
                          <CheckCircle2 size={13} className={isDark ? "text-[#e5c875]" : "text-[#d4af37]"} />
                          <span>{product.badge}</span>
                        </div>
                      ) : (
                        <div />
                      )}

                      <div
                        className={`pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md shadow-sm transition-all duration-300 ${
                          isDark
                            ? "bg-[#181512]/90 text-neutral-200 group-hover:bg-[#b8860b] group-hover:text-white"
                            : "bg-white/80 text-neutral-800 group-hover:bg-neutral-900 group-hover:text-white"
                        }`}
                      >
                        <ArrowUpRight size={16} />
                      </div>
                    </div>

                    {/* Edge-to-Edge Sleek Image / Fast Video Fill */}
                    {isVideoMedia(product.image) ? (
                      <FastVideo
                        src={product.image}
                        autoPlay
                        loop
                        muted
                        objectFit="cover"
                        className="h-full w-full"
                      />
                    ) : (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </Link>

                  {/* Bottom Row: Producer, Title & Price */}
                  <div className="flex items-end justify-between gap-3 pt-3 px-2 pb-1 z-10">
                    <Link href={productHref(product)} className="group/title">
                      <p className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? "text-neutral-400" : "text-neutral-400"}`}>
                        {product.producer} · {product.category}
                      </p>
                      <h3
                        className={`mt-0.5 font-serif text-lg font-bold tracking-tight transition ${
                          isDark
                            ? "text-white group-hover/title:text-[#e5c875]"
                            : "text-neutral-900 group-hover/title:text-[#b8860b]"
                        }`}
                      >
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex flex-col items-end">
                      <span
                        className={`font-sans text-sm sm:text-base font-bold tracking-tight ${
                          isDark ? "text-[#FAF7F2]" : "text-neutral-900"
                        }`}
                      >
                        {formatAmount(product.numericPrice)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                          openCart();
                        }}
                        className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold transition ${
                          isDark
                            ? "text-[#e5c875] hover:text-[#fff5df]"
                            : "text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        <span>{addedProduct === product.id ? "Added ✓" : "+ Add"}</span>
                      </button>
                    </div>
                  </div>

                </article>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className={`font-serif text-2xl ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                No bottles found matching your search.
              </p>
            </div>
          )}
        </section>

        {/* Featured Brands Section */}
        <BrandsShelf />

        {/* Minimalist Story Section */}
        <section
          id="about"
          className={`border-t px-5 py-16 lg:px-10 lg:py-24 transition-colors duration-300 ${
            isDark
              ? "border-white/10 bg-[#0e0c0a] text-[#FAF7F2]"
              : "border-neutral-200/80 bg-white text-neutral-900"
          }`}
        >
          <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-[0.7fr_1.3fr]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8860b]">
              More Than A Liquor Store
            </p>
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <h2 className="font-serif text-3xl font-light leading-tight sm:text-4xl">
                Magnum is an atelier of rare spirits, dedicated to curating the world&apos;s finest liquid craftsmanship.
              </h2>
              <Link
                href="/discover"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#b8860b] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#996515]"
              >
                Explore Cellar
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
