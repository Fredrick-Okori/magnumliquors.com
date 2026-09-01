"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Beer,
  CheckCircle2,
  ChevronDown,
  Flame,
  GlassWater,
  LayoutGrid,
  Search,
  Sparkles,
  Wine,
} from "lucide-react";
import { Hero } from "@/components/Hero";
import { BrandsShelf } from "@/components/BrandsShelf";
import { useCart } from "@/components/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { products, Product, productHref } from "@/data/products";

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

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All bottles");
  const [query, setQuery] = useState("");
  const [addedProduct, setAddedProduct] = useState<string | null>(null);
  const [productList, setProductList] = useState<Product[]>([]);

  const { addToCart, openCart } = useCart();
  const { formatAmount } = useCurrency();

  useEffect(() => {
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
      .catch((err) => console.warn("Failed to load store products:", err));
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
    <div className="min-h-screen transition-colors duration-400">
      <main>
        {/* Sleek Hero Component */}
        <Hero />

        {/* Redesigned Products Section matching Reference UI */}
        <section id="shop" className="mx-auto max-w-7xl px-5 py-14 lg:px-10 lg:py-20">
          
          {/* Top Category Pills Bar & Controls */}
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            
            {/* Horizontal Floating Category Pills */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? "bg-neutral-900 text-white shadow-sm border border-neutral-900"
                        : "bg-white text-neutral-600 border border-neutral-200/80 hover:bg-neutral-100 hover:text-neutral-900 shadow-xs"
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-white" : "text-neutral-400"} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Side Search & Sort Bar */}
            <div className="flex items-center gap-3 self-end lg:self-auto">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search bottles..."
                  className="h-10 w-36 sm:w-48 rounded-full border border-neutral-200/80 bg-white pl-9 pr-4 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition shadow-xs"
                />
              </div>

              <button
                className="flex h-10 items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white px-4 text-xs font-medium text-neutral-700 shadow-xs hover:bg-neutral-50 transition"
              >
                <span className="text-neutral-400">Sort by:</span>
                <span className="font-semibold text-neutral-900">Featured</span>
                <ChevronDown size={14} className="text-neutral-400" />
              </button>
            </div>

          </div>

          {/* 3-Column Products Grid Layout */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {visibleProducts.map((product) => (
              <article
                key={product.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-neutral-200/70 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Product Image Container Stretched Edge-to-Edge */}
                <Link
                  href={productHref(product)}
                  className="relative flex aspect-[1.1] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#fafafa]"
                >
                  {/* Floating Upper Contents Overlay: Badge & Circular Arrow Button */}
                  <div className="absolute left-3.5 top-3.5 right-3.5 z-10 flex items-center justify-between pointer-events-none">
                    {product.badge ? (
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f3e5b8]/90 bg-[#fffcf0]/90 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-[#b8860b] shadow-xs">
                        <CheckCircle2 size={13} className="text-[#d4af37]" />
                        <span>{product.badge}</span>
                      </div>
                    ) : (
                      <div />
                    )}

                    <div
                      className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-neutral-800 shadow-sm transition-all duration-300 group-hover:bg-neutral-900 group-hover:text-white"
                    >
                      <ArrowUpRight size={16} />
                    </div>
                  </div>

                  {/* Edge-to-Edge Sleek Image Fill */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                {/* Bottom Row: Producer, Title & Price */}
                <div className="flex items-end justify-between gap-3 pt-3 px-2 pb-1 z-10">
                  <Link href={productHref(product)} className="group/title">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                      {product.producer} · {product.category}
                    </p>
                    <h3 className="mt-0.5 font-serif text-lg font-bold tracking-tight text-neutral-900 group-hover/title:text-[#b8860b] transition">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex flex-col items-end">
                    <span className="font-sans text-sm sm:text-base font-bold tracking-tight text-neutral-900">
                      {formatAmount(product.numericPrice)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                        openCart();
                      }}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition"
                    >
                      <span>{addedProduct === product.id ? "Added ✓" : "+ Add"}</span>
                    </button>
                  </div>
                </div>

              </article>
            ))}
          </div>

          {visibleProducts.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-serif text-2xl text-neutral-500">No bottles found matching your search.</p>
            </div>
          )}
        </section>

        {/* Featured Brands Section */}
        <BrandsShelf />

        {/* Minimalist Story Section */}
        <section id="about" className="border-t border-neutral-200/80 bg-white px-5 py-16 lg:px-10 lg:py-24 text-neutral-900">
          <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-[0.7fr_1.3fr]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8860b]">
              More Than A Liquor Store
            </p>
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <h2 className="max-w-2xl font-serif text-3xl leading-tight tracking-tight text-neutral-900 lg:text-5xl">
                Good bottles have a story.<br />
                <i className="font-normal italic text-neutral-600">We&apos;re here for all of them.</i>
              </h2>
              <button className="flex w-fit items-center gap-3 text-xs font-semibold uppercase tracking-widest text-neutral-900 underline decoration-neutral-900 decoration-2 underline-offset-8 transition hover:text-[#b8860b]">
                Meet Magnum <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
