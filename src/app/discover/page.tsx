"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Beer,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Filter,
  Flame,
  GlassWater,
  LayoutGrid,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Wine,
} from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Product, productHref } from "@/data/products";
import { FastVideo, isVideoMedia } from "@/components/FastVideo";

const categories = [
  { name: "All", icon: LayoutGrid },
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

const origins = [
  "Jalisco, Mexico",
  "Speyside, Scotland",
  "Cognac, France",
  "Champagne, France",
  "Veneto, Italy",
  "Provence-Alpes-Côte d'Azur, France",
];

function DiscoverContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState(categoryParam || "All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");

  // Left Sidebar Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceTier, setPriceTier] = useState<string>("all");
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { addToCart, openCart } = useCart();
  const { formatAmount } = useCurrency();
  const [addedProduct, setAddedProduct] = useState<string | null>(null);
  const [productList, setProductList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

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

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleOriginToggle = (originName: string) => {
    setSelectedOrigins((prev) =>
      prev.includes(originName)
        ? prev.filter((o) => o !== originName)
        : [...prev, originName]
    );
  };

  const clearAllFilters = () => {
    setActiveCategory("All");
    setSearchQuery("");
    setSortOption("featured");
    setSelectedCategories([]);
    setPriceTier("all");
    setSelectedOrigins([]);
    setInStockOnly(false);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...productList];

    // Top Category Pills Filter
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Search Query Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.producer.toLowerCase().includes(q) ||
          p.origin.toLowerCase().includes(q)
      );
    }

    // Sidebar Category Filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.some((sc) => sc.toLowerCase() === p.category.toLowerCase()));
    }

    // Origin Filter
    if (selectedOrigins.length > 0) {
      result = result.filter((p) => selectedOrigins.includes(p.origin));
    }

    // In Stock Only Filter
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Price Tier Filter
    if (priceTier !== "all") {
      result = result.filter((p) => {
        if (priceTier === "under-50") return p.numericPrice < 50;
        if (priceTier === "50-100") return p.numericPrice >= 50 && p.numericPrice <= 100;
        if (priceTier === "100-200") return p.numericPrice > 100 && p.numericPrice <= 200;
        if (priceTier === "above-200") return p.numericPrice > 200;
        return true;
      });
    }

    // Sorting
    if (sortOption === "price-asc") {
      result.sort((a, b) => a.numericPrice - b.numericPrice);
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => b.numericPrice - a.numericPrice);
    } else if (sortOption === "rating") {
      result.sort((a, b) => (b.rating ? 1 : 0) - (a.rating ? 1 : 0));
    }

    return result;
  }, [
    productList,
    activeCategory,
    searchQuery,
    selectedCategories,
    selectedOrigins,
    inStockOnly,
    priceTier,
    sortOption,
  ]);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-neutral-900 selection:bg-[#d4af37] selection:text-neutral-950">
      
      {/* Header Banner */}
      <section className="relative border-b border-neutral-200/80 bg-white px-5 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8860b]">
            The Master Collection
          </p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            Discover Fine Spirits & Estate Wines
          </h1>
          <p className="mt-3 max-w-2xl text-xs sm:text-sm font-light text-neutral-600 leading-relaxed">
            Explore rare vintage allocations, small batch single barrels, and prestige reserves curated from the world&apos;s most distinguished vineyards and distilleries.
          </p>

          {/* Search Bar */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by bottle name, distillery, or region (e.g. Jalisco, Speyside)..."
                className="w-full rounded-full border border-neutral-200/80 bg-[#faf8f5] pl-11 pr-4 py-3.5 text-xs text-neutral-900 placeholder:text-neutral-600 outline-none transition focus:border-[#b8860b] focus:bg-white"
              />
            </div>
            
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center justify-center gap-2 rounded-full border border-neutral-200/80 bg-white px-5 py-3 text-xs font-semibold text-neutral-800 shadow-xs"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-10">
        
        {/* Horizontal Category Carousel */}
        <div className="mb-10 flex items-center gap-3 overflow-x-auto pb-3 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#b8860b] text-white shadow-md"
                    : "border border-neutral-200/80 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-[#faf8f5]"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-[#b8860b]"} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Layout Grid (Sidebar + Product Catalog) */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
          
          {/* LEFT SIDEBAR FILTERS (Desktop) */}
          <aside className="hidden lg:block space-y-8">
            <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900">
                Filters
              </span>
              {(selectedCategories.length > 0 || selectedOrigins.length > 0 || priceTier !== "all" || inStockOnly) && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#b8860b] hover:underline"
                >
                  <RotateCcw size={11} /> Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Categories
              </h3>
              <div className="space-y-2">
                {categories
                  .filter((c) => c.name !== "All")
                  .map((cat) => (
                    <label
                      key={cat.name}
                      className="flex items-center gap-3 text-xs text-neutral-700 hover:text-neutral-900 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.name)}
                        onChange={() => handleCategoryToggle(cat.name)}
                        className="h-4 w-4 rounded border-neutral-300 text-[#b8860b] focus:ring-[#b8860b]"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
              </div>
            </div>

            {/* Price Tier Filter */}
            <div className="space-y-3 border-t border-neutral-200/80 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Price Range
              </h3>
              <div className="space-y-2 text-xs text-neutral-700">
                {[
                  { id: "all", label: "All Prices" },
                  { id: "under-50", label: "Under UGX 185,000" },
                  { id: "50-100", label: "UGX 185,000 - 370,000" },
                  { id: "100-200", label: "UGX 370,000 - 740,000" },
                  { id: "above-200", label: "UGX 740,000 & Above" },
                ].map((tier) => (
                  <label
                    key={tier.id}
                    className="flex items-center gap-3 cursor-pointer select-none hover:text-neutral-900"
                  >
                    <input
                      type="radio"
                      name="priceTier"
                      checked={priceTier === tier.id}
                      onChange={() => setPriceTier(tier.id)}
                      className="h-4 w-4 text-[#b8860b] focus:ring-[#b8860b]"
                    />
                    <span>{tier.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Origin Filter */}
            <div className="space-y-3 border-t border-neutral-200/80 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Distillery Region
              </h3>
              <div className="space-y-2">
                {origins.map((origin) => (
                  <label
                    key={origin}
                    className="flex items-center gap-3 text-xs text-neutral-700 hover:text-neutral-900 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedOrigins.includes(origin)}
                      onChange={() => handleOriginToggle(origin)}
                      className="h-4 w-4 rounded border-neutral-300 text-[#b8860b] focus:ring-[#b8860b]"
                    />
                    <span>{origin}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="border-t border-neutral-200/80 pt-6">
              <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer select-none">
                <span>In Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-[#b8860b] focus:ring-[#b8860b]"
                />
              </label>
            </div>
          </aside>

          {/* MAIN PRODUCT CATALOG GRID */}
          <div className="space-y-6">
            
            {/* Results Counter & Sort Selector */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/80 pb-4">
              <p className="text-xs text-neutral-600 font-light">
                Showing <strong className="font-semibold text-neutral-900">{filteredProducts.length}</strong> distinctive bottles
              </p>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-medium">Sort by:</span>
                <select
                  value={sortOption}
                  onChange={(e: any) => setSortOption(e.target.value)}
                  className="rounded-full border border-neutral-200/80 bg-white px-3 py-1.5 text-xs text-neutral-900 outline-none focus:border-[#b8860b]"
                >
                  <option value="featured">Sommelier Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Product Cards Grid / Skeletons */}
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="relative flex flex-col justify-between rounded-3xl border border-neutral-200/70 bg-white/90 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-pulse"
                  >
                    <div className="relative flex aspect-[1.1] w-full items-center justify-center overflow-hidden rounded-2xl bg-neutral-100">
                      <div className="absolute left-3.5 top-3.5 h-6 w-24 rounded-full bg-neutral-200" />
                      <div className="absolute right-3.5 top-3.5 h-9 w-9 rounded-full bg-neutral-200" />
                    </div>
                    <div className="mt-4 flex flex-col justify-between flex-1 space-y-3">
                      <div className="space-y-2">
                        <div className="h-3 w-28 rounded-md bg-neutral-200" />
                        <div className="h-5 w-44 rounded-md bg-neutral-300" />
                        <div className="h-3 w-20 rounded-md bg-neutral-200" />
                      </div>
                      <div className="flex items-end justify-between border-t border-neutral-100 pt-3">
                        <div className="h-4 w-16 rounded-md bg-neutral-300" />
                        <div className="h-3 w-10 rounded-md bg-neutral-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group relative flex flex-col justify-between rounded-3xl border border-neutral-200/70 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Product Image Container */}
                    <Link
                      href={productHref(product)}
                      className="relative flex aspect-[1.1] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#fafafa]"
                    >
                      {/* Floating Upper Badge & Circular Arrow */}
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

                    {/* Product Meta & Information */}
                    <div className="mt-4 flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8e8e8e]">
                          {product.producer} • {product.origin}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-neutral-900 mt-1 line-clamp-1">
                          <Link href={productHref(product)} className="hover:text-[#b8860b] transition">
                            {product.name}
                          </Link>
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-1 font-light">
                          <span>{product.volume}</span>
                          <span>•</span>
                          <span>{product.abv}</span>
                        </div>
                      </div>

                      {/* Price & Add to Cart Action */}
                      <div className="mt-4 flex items-end justify-between border-t border-neutral-100 pt-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-neutral-400">Price</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-sans text-sm sm:text-base font-bold tracking-tight text-neutral-900">
                              {formatAmount(product.numericPrice)}
                            </span>
                          </div>
                        </div>

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
            ) : (
              <div className="py-24 text-center rounded-3xl border border-neutral-200/80 bg-white p-8 space-y-4">
                <p className="font-serif text-3xl text-neutral-600">
                  No bottles match your active filters.
                </p>
                <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed font-light">
                  Try clearing some filter criteria or adjusting your search query to view our available collection.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-xs font-semibold text-white uppercase tracking-widest transition hover:bg-neutral-800"
                >
                  <RotateCcw size={14} /> Reset All Filters
                </button>
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8f5] flex items-center justify-center text-xs font-semibold text-neutral-500">Loading fine collection…</div>}>
      <DiscoverContent />
    </Suspense>
  );
}
