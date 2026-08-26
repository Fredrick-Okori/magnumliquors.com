"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Wine,
} from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { getProductById, products } from "@/data/products";

export default function ProductDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const initialProduct = getProductById(id || "1");

  const [product, setProduct] = useState(initialProduct);
  const [productList, setProductList] = useState<typeof products>(products);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"tasting" | "specs">("tasting");
  const { addToCart, openCart } = useCart();
  const { formatAmount } = useCurrency();

  useEffect(() => {
    fetch("/api/store-products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProductList(data);
          const found = data.find((p: any) => String(p.id) === String(id));
          if (found) {
            setProduct(found);
          }
        }
      })
      .catch((err) => console.warn("Failed to load Payload product details:", err));
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f4f4f3] flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-serif text-4xl text-neutral-900 mb-4">Pour Not Found</h1>
        <p className="text-neutral-600 mb-8">The bottle you are looking for may have been claimed or moved.</p>
        <Link
          href="/#shop"
          className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-xs font-semibold text-white uppercase tracking-widest transition hover:bg-neutral-800"
        >
          <ArrowLeft size={16} /> Back to Collection
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    openCart();
  };

  const relatedProducts = productList
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen transition-colors duration-400 pb-24">
      {/* Breadcrumb Header Strip */}
      <div className="border-b border-neutral-200/80 bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-neutral-900 transition">Home</Link>
            <ChevronRight size={13} className="text-neutral-400" />
            <Link href="/#shop" className="hover:text-neutral-900 transition">Shop</Link>
            <ChevronRight size={13} className="text-neutral-400" />
            <span className="font-medium text-neutral-900">{product.name}</span>
          </div>

          <Link
            href="/#shop"
            className="hidden sm:inline-flex items-center gap-1.5 font-medium text-neutral-700 hover:text-neutral-900 transition"
          >
            <ArrowLeft size={14} /> Back to bottles
          </Link>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <main className="mx-auto max-w-7xl px-5 pt-8 lg:px-10 lg:pt-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-start">
          
          {/* Left Column: Product Image Showcase */}
          <div className="lg:col-span-6">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-neutral-200/70 bg-white shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex items-center justify-center">
              
              {/* Badge Overlay */}
              {product.badge && (
                <div className="absolute left-6 top-6 z-10 inline-flex items-center gap-1.5 rounded-full border border-[#f3e5b8] bg-[#fffcf0] px-3.5 py-1.5 text-xs font-semibold text-[#b8860b]">
                  <CheckCircle2 size={14} className="text-[#d4af37]" />
                  <span>{product.badge}</span>
                </div>
              )}

              {/* Heart Wishlist Button */}
              <button
                aria-label="Save product"
                className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-neutral-600 shadow-xs transition hover:bg-neutral-900 hover:text-white"
              >
                <Heart size={18} />
              </button>

              {/* Edge-to-Edge Product Image (object-cover) */}
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* Quick Guarantees Strip */}
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-[11px] font-medium text-neutral-600">
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-xs">
                <Truck size={16} className="mx-auto mb-1 text-[#d4af37]" />
                <span>Express Delivery</span>
              </div>
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-xs">
                <ShieldCheck size={16} className="mx-auto mb-1 text-[#d4af37]" />
                <span>100% Authentic</span>
              </div>
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-xs">
                <Wine size={16} className="mx-auto mb-1 text-[#d4af37]" />
                <span>Sommelier Choice</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Purchasing Controls */}
          <div className="lg:col-span-6 flex flex-col">
            
            {/* Brand & Origin */}
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8860b]">
              {product.producer} · {product.origin}
            </p>

            {/* Title */}
            <h1 className="mt-2 font-serif text-4xl font-light tracking-tight text-neutral-900 sm:text-5xl">
              {product.name}
            </h1>

            {/* Rating & Stock */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1 font-medium text-white">
                <Award size={14} className="text-[#d4af37]" />
                <span>{product.rating}</span>
              </div>
              <span className="text-neutral-300">•</span>
              <span className="font-semibold text-emerald-700">In Stock</span>
              <span className="text-neutral-300">•</span>
              <span className="text-neutral-500">{product.volume}</span>
            </div>

            {/* Price Block */}
            <div className="mt-6 flex items-baseline gap-3 border-y border-neutral-200/80 py-4">
              <span className="text-3xl font-bold tracking-tight text-neutral-900">
                {formatAmount(product.numericPrice)}
              </span>
            </div>

            {/* Description */}
            <p className="mt-5 text-sm leading-relaxed text-neutral-600 font-light">
              {product.description}
            </p>

            {/* Quantity Selector & Add to Cart */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {/* Quantity Counter */}
              <div className="flex h-12 items-center rounded-full border border-neutral-200/80 bg-white px-3 shadow-xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 transition"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-mono text-sm font-semibold text-neutral-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 transition"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Primary CTA Button */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 min-w-[200px] flex h-12 items-center justify-center gap-2 rounded-full bg-neutral-900 px-8 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-md transition-all hover:bg-neutral-800 ${
                  added ? "bg-emerald-700 text-white" : ""
                }`}
              >
                <ShoppingBag size={16} />
                <span>{added ? "Added to Cart!" : `Add to Cart — ${formatAmount(product.numericPrice * quantity)}`}</span>
              </button>
            </div>

            {/* Specs & Tasting Tabs Section */}
            <div className="mt-10 rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs">
              
              {/* Tabs Switcher */}
              <div className="flex border-b border-neutral-200/80 pb-3">
                <button
                  onClick={() => setActiveTab("tasting")}
                  className={`flex items-center gap-2 pb-1 text-xs font-semibold uppercase tracking-wider transition ${
                    activeTab === "tasting"
                      ? "border-b-2 border-neutral-900 text-neutral-900"
                      : "text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  <Sparkles size={14} className="text-[#d4af37]" /> Tasting Notes
                </button>
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`ml-6 flex items-center gap-2 pb-1 text-xs font-semibold uppercase tracking-wider transition ${
                    activeTab === "specs"
                      ? "border-b-2 border-neutral-900 text-neutral-900"
                      : "text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  Specifications & Aging
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "tasting" ? (
                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-[#b8860b] uppercase tracking-wider block mb-0.5">
                      Nose & Aromatics
                    </span>
                    <p className="text-neutral-600 leading-relaxed">{product.tastingNotes.nose}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#b8860b] uppercase tracking-wider block mb-0.5">
                      Palate & Texture
                    </span>
                    <p className="text-neutral-600 leading-relaxed">{product.tastingNotes.palate}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#b8860b] uppercase tracking-wider block mb-0.5">
                      Finish
                    </span>
                    <p className="text-neutral-600 leading-relaxed">{product.tastingNotes.finish}</p>
                  </div>
                  <div className="rounded-xl border border-[#f3e5b8] bg-[#fffcf0] p-3">
                    <span className="font-semibold text-neutral-900 uppercase tracking-wider block mb-0.5">
                      Sommelier Pairing
                    </span>
                    <p className="text-neutral-700 leading-relaxed">{product.tastingNotes.pairing}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <span className="text-neutral-400 uppercase tracking-wider text-[10px] block">Strength / ABV</span>
                    <span className="font-semibold text-neutral-900">{product.abv}</span>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <span className="text-neutral-400 uppercase tracking-wider text-[10px] block">Volume</span>
                    <span className="font-semibold text-neutral-900">{product.volume}</span>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <span className="text-neutral-400 uppercase tracking-wider text-[10px] block">Vintage</span>
                    <span className="font-semibold text-neutral-900">{product.vintage || "N/A"}</span>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <span className="text-neutral-400 uppercase tracking-wider text-[10px] block">Maturation / Cask</span>
                    <span className="font-semibold text-neutral-900">{product.cask || "Standard Aging"}</span>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* You May Also Like Section */}
        <div className="mt-24 border-t border-neutral-200/80 pt-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8860b]">
                Complete Your Cellar
              </p>
              <h2 className="mt-1 font-serif text-3xl text-neutral-900">
                You May Also Enjoy
              </h2>
            </div>
            <Link
              href="/#shop"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 hover:text-[#b8860b] transition"
            >
              View Full Collection <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Related Products 3-Column Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                href={`/product/${rel.id}`}
                className="group relative flex flex-col justify-between rounded-3xl border border-neutral-200/70 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center justify-between z-10">
                  {rel.badge ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f3e5b8] bg-[#fffcf0] px-3 py-1 text-[11px] font-semibold text-[#b8860b]">
                      <CheckCircle2 size={13} className="text-[#d4af37]" />
                      <span>{rel.badge}</span>
                    </div>
                  ) : (
                    <div />
                  )}
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition group-hover:bg-neutral-900 group-hover:text-white">
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                <div className="relative my-6 flex aspect-[1.1] items-center justify-center overflow-hidden rounded-2xl bg-[#fafafa]">
                  <img
                    src={rel.image}
                    alt={rel.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex items-end justify-between gap-3 pt-2 z-10">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                      {rel.producer} · {rel.category}
                    </p>
                    <h3 className="mt-0.5 text-base font-semibold tracking-tight text-neutral-900">
                      {rel.name}
                    </h3>
                  </div>
                  <span className="text-base font-bold text-neutral-900">{formatAmount(rel.numericPrice)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
