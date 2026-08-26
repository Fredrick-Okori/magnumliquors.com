"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { products, Product } from "@/data/products";

const categories = [
  { name: "All", icon: LayoutGrid },
  { name: "Wine", icon: Wine },
  { name: "Spirits", icon: Flame },
  { name: "Bourbon", icon: GlassWater },
  { name: "Beer", icon: Beer },
  { name: "Non-alcoholic", icon: Sparkles },
];

const origins = [
  "Jalisco, Mexico",
  "Speyside, Scotland",
  "Cognac, France",
  "Champagne, France",
  "Veneto, Italy",
  "Provence-Alpes-Côte d'Azur, France",
];

export default function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState("All");
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
  const [productList, setProductList] = useState<Product[]>(products);

  useEffect(() => {
    fetch("/api/store-products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProductList(data);
        }
      })
      .catch((err) => console.warn("Failed to load Payload products:", err));
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
      result = result.filter((p) => p.category === activeCategory);
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

    // Sidebar Category Checkboxes Filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Sidebar Price Tier Filter (numericPrice in USD equivalent)
    if (priceTier === "under-35") {
      result = result.filter((p) => p.numericPrice < 35);
    } else if (priceTier === "35-100") {
      result = result.filter((p) => p.numericPrice >= 35 && p.numericPrice <= 100);
    } else if (priceTier === "100-plus") {
      result = result.filter((p) => p.numericPrice > 100);
    }

    // Sidebar Origins Filter
    if (selectedOrigins.length > 0) {
      result = result.filter((p) => selectedOrigins.includes(p.origin));
    }

    // In Stock Only Filter
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Sort Logic
    if (sortOption === "price-asc") {
      result.sort((a, b) => a.numericPrice - b.numericPrice);
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => b.numericPrice - a.numericPrice);
    } else if (sortOption === "rating") {
      result.sort((a, b) => b.rating.localeCompare(a.rating));
    }

    return result;
  }, [
    activeCategory,
    searchQuery,
    selectedCategories,
    priceTier,
    selectedOrigins,
    inStockOnly,
    sortOption,
  ]);

  return (
    <div className="min-h-screen bg-[#f4f4f3] transition-colors duration-400 text-neutral-900 pb-24 select-none">
      
      {/* Breadcrumb Header Strip */}
      <div className="border-b border-neutral-200/80 bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-neutral-900 transition">
              Home
            </Link>
            <ChevronRight size={13} className="text-neutral-400" />
            <span className="font-medium text-neutral-900">Discover Collection</span>
          </div>

          <span className="text-neutral-500 font-mono text-[11px]">
            {filteredProducts.length} {filteredProducts.length === 1 ? "bottle" : "bottles"} available
          </span>
        </div>
      </div>

      {/* Page Title & Hero Header */}
      <header className="border-b border-neutral-200/80 bg-white px-5 py-10 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-7xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b8860b]">
            Full Cellar Allocation
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-neutral-900">
            Discover Our Collection
          </h1>
          <p className="text-sm font-light text-neutral-600 max-w-2xl leading-relaxed">
            Filter through our complete catalog of single malts, estate wines, craft bourbons, and artisanal spirits. Delivered directly in climate-controlled packaging.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-12">
        
        {/* Top-Level Filter & Controls Bar */}
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between border-b border-neutral-200/80 pb-6">
          
          {/* Horizontal Category Selector Pills */}
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

          {/* Right Controls: Search, Sort & Mobile Filter Trigger */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex h-10 items-center gap-2 rounded-full border border-neutral-200/80 bg-white px-4 text-xs font-semibold text-neutral-800 shadow-xs"
            >
              <SlidersHorizontal size={14} className="text-[#b8860b]" />
              <span>Filters</span>
            </button>

            {/* Search Input Box */}
            <div className="relative flex items-center flex-1 sm:flex-initial">
              <Search size={14} className="absolute left-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by bottle, brand or origin..."
                className="h-10 w-full sm:w-64 rounded-full border border-neutral-200/80 bg-white pl-9 pr-4 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition shadow-xs"
              />
            </div>

            {/* Sort Dropdown Selector */}
            <div className="relative inline-flex items-center">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                aria-label="Sort products"
                className="h-10 appearance-none rounded-full border border-neutral-200/80 bg-white pl-4 pr-9 text-xs font-semibold text-neutral-900 outline-none focus:border-neutral-900 shadow-xs cursor-pointer"
              >
                <option value="featured">Featured Allocation</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 text-neutral-400" />
            </div>

          </div>

        </div>

        {/* Layout Grid: Left Sidebar Filters + Right Product Catalog */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Left Sidebar Filter Section */}
          <aside
            className={`${
              mobileFilterOpen ? "block" : "hidden"
            } lg:block lg:col-span-3 space-y-6 rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs h-fit sticky top-36`}
          >
            <div className="flex items-center justify-between border-b border-neutral-200/80 pb-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-[#b8860b]" />
                <h3 className="font-serif text-xl font-light text-neutral-900">
                  Refine Cellar
                </h3>
              </div>

              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 transition"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            {/* Filter Group 1: Product Categories */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-900">
                Categories
              </h4>
              <div className="space-y-2 text-xs text-neutral-600 font-light">
                {["Spirits", "Wine", "Bourbon", "Beer", "Non-alcoholic"].map((cat) => (
                  <label key={cat} className="flex items-center gap-2.5 cursor-pointer hover:text-neutral-900 transition">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryToggle(cat)}
                      className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Group 2: Price Range */}
            <div className="space-y-3 border-t border-neutral-200/80 pt-5">
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-900">
                Price Tiers
              </h4>
              <div className="space-y-2 text-xs text-neutral-600 font-light">
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-neutral-900 transition">
                  <input
                    type="radio"
                    name="priceTier"
                    checked={priceTier === "all"}
                    onChange={() => setPriceTier("all")}
                    className="h-4 w-4 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>All Prices</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-neutral-900 transition">
                  <input
                    type="radio"
                    name="priceTier"
                    checked={priceTier === "under-35"}
                    onChange={() => setPriceTier("under-35")}
                    className="h-4 w-4 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>Under {formatAmount(35)}</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-neutral-900 transition">
                  <input
                    type="radio"
                    name="priceTier"
                    checked={priceTier === "35-100"}
                    onChange={() => setPriceTier("35-100")}
                    className="h-4 w-4 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>{formatAmount(35)} – {formatAmount(100)}</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-neutral-900 transition">
                  <input
                    type="radio"
                    name="priceTier"
                    checked={priceTier === "100-plus"}
                    onChange={() => setPriceTier("100-plus")}
                    className="h-4 w-4 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>Over {formatAmount(100)}</span>
                </label>
              </div>
            </div>

            {/* Filter Group 3: Origin & Country */}
            <div className="space-y-3 border-t border-neutral-200/80 pt-5">
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-900">
                Origin & Region
              </h4>
              <div className="space-y-2 text-xs text-neutral-600 font-light">
                {origins.map((origin) => (
                  <label key={origin} className="flex items-center gap-2.5 cursor-pointer hover:text-neutral-900 transition">
                    <input
                      type="checkbox"
                      checked={selectedOrigins.includes(origin)}
                      onChange={() => handleOriginToggle(origin)}
                      className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                    <span>{origin}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Group 4: Availability */}
            <div className="border-t border-neutral-200/80 pt-5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-neutral-900">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <span>In-Stock Allocations Only</span>
              </label>
            </div>

          </aside>

          {/* Right Main Product Catalog Grid */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Catalog Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-neutral-200/70 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Product Image Container Stretched Edge-to-Edge */}
                  <Link
                    href={`/product/${product.id}`}
                    className="relative flex aspect-[1.1] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#fafafa]"
                  >
                    {/* Upper Contents Floating Overlay: Badge & Circular Arrow Link */}
                    <div className="absolute left-3.5 top-3.5 right-3.5 z-10 flex items-center justify-between pointer-events-none">
                      {product.badge ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f3e5b8]/90 bg-[#fffcf0]/90 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-[#b8860b] shadow-xs">
                          <CheckCircle2 size={13} className="text-[#d4af37]" />
                          <span>{product.badge}</span>
                        </div>
                      ) : (
                        <div />
                      )}

                      <div className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-neutral-800 shadow-sm transition-all duration-300 group-hover:bg-neutral-900 group-hover:text-white">
                        <ArrowUpRight size={16} />
                      </div>
                    </div>

                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  {/* Bottom Info Row */}
                  <div className="flex items-end justify-between gap-3 pt-3 px-2 pb-1 z-10">
                    <Link href={`/product/${product.id}`} className="group/title">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                        {product.producer} · {product.category}
                      </p>
                      <h3 className="mt-0.5 text-base font-semibold tracking-tight text-neutral-900 group-hover/title:text-[#b8860b] transition">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex flex-col items-end">
                      <span className="text-base font-bold text-neutral-900">
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

            {/* Empty State when no bottles match filters */}
            {filteredProducts.length === 0 && (
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

