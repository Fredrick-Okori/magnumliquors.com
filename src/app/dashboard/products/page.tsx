"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Minus,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wine,
} from "lucide-react";
import { Product } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import { FastVideo, isVideoMedia } from "@/components/FastVideo";

const DELETED_IDS_KEY = "magnum_deleted_product_ids";

function getDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markDeletedId(id: string) {
  try {
    const current = getDeletedIds();
    current.add(id);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify([...current]));
  } catch {}
}

export default function ProductsPage() {
  const { formatAmount } = useCurrency();
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/store-products");
      const data = await res.json();
      const apiList = Array.isArray(data) ? data : [];

      let localProducts: Product[] = [];
      try {
        localProducts = JSON.parse(localStorage.getItem("magnum_added_products") || "[]");
      } catch (e) {}

      // Get persisted deleted IDs so they never reappear
      const deletedIds = getDeletedIds();

      const combined = [
        ...localProducts,
        ...apiList.filter((ap) => !localProducts.some((lp) => String(lp.id) === String(ap.id))),
      ].filter((p) => !deletedIds.has(String(p.id)));

      setProductsList(combined);
    } catch (err) {
      console.warn("Failed to fetch products:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdjustStock = async (productId: string, delta: number) => {
    let updatedStock = 50;
    setProductsList((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const current = p.stockQuantity ?? 50;
          const updated = Math.max(0, current + delta);
          updatedStock = updated;
          return { ...p, stockQuantity: updated, inStock: updated > 0 };
        }
        return p;
      })
    );

    try {
      await fetch(`/api/store-products?id=${encodeURIComponent(productId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: updatedStock, inStock: updatedStock > 0 }),
      });
    } catch (err) {
      console.warn("Failed to patch stock quantity in Supabase:", err);
    }
  };

  const handleDelete = async (productId: string) => {
    setIsDeleting(true);
    try {
      await fetch(`/api/store-products?id=${productId}`, { method: "DELETE" });

      // Persist deleted ID so it won't come back on refresh
      markDeletedId(productId);

      // Remove from localStorage added-products cache
      try {
        const existing: Product[] = JSON.parse(localStorage.getItem("magnum_added_products") || "[]");
        const filtered = existing.filter((p) => String(p.id) !== productId);
        localStorage.setItem("magnum_added_products", JSON.stringify(filtered));
      } catch (e) {}

      // Remove from local state immediately
      setProductsList((prev) => prev.filter((p) => String(p.id) !== productId));
    } catch (err) {
      console.warn("Failed to delete product:", err);
    }
    setIsDeleting(false);
    setDeleteConfirmId(null);
  };

  const categories = ["All", "Whiskey", "Rum", "Vodka", "Liqueur", "Gin", "Tequila", "Brandy", "Champagne", "Wine"];

  const filteredProducts = productsList.filter((p) => {
    const matchesCat = productCategoryFilter === "All" || p.category === productCategoryFilter;
    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.producer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#18181b] tracking-tight">Inventory & Stock Manager</h1>
          <p className="text-xs text-[#71717a] mt-1">
            Manage bottle inventory, adjust stock levels, and add new items.
          </p>
        </div>
        <Link
          href="/dashboard/products/create"
          className="rounded-full bg-[#b8860b] hover:bg-[#996515] px-5 py-2.5 text-xs font-bold text-white transition shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={16} /> Add Bottle
        </Link>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setProductCategoryFilter(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                productCategoryFilter === cat
                  ? "bg-[#b8860b] text-white shadow-2xs"
                  : "bg-white text-[#71717a] border border-[#e5e5e4] hover:border-[#18181b]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inventory..."
            className="w-full h-9 rounded-full border border-[#e5e5e4] bg-white pl-9 pr-4 text-xs outline-none focus:border-[#b8860b]"
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <p className="text-xs text-[#71717a] font-semibold animate-pulse">Loading inventory…</p>
      )}

      {/* Empty State */}
      {!isLoading && filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#e5e5e4] bg-white py-20 text-center gap-3">
          <Wine size={36} className="text-[#a1a1aa]" />
          <p className="font-bold text-sm text-[#18181b]">No bottles found in Supabase database</p>
          <p className="text-xs text-[#71717a]">Add your first bottle to publish it to the store catalog.</p>
          <Link
            href="/dashboard/products/create"
            className="mt-2 rounded-full bg-[#b8860b] px-5 py-2 text-xs font-bold text-white hover:bg-[#996515] transition"
          >
            + Add Bottle
          </Link>
        </div>
      )}

      {/* Product Inventory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => {
          const stock = p.stockQuantity ?? 50;
          const isLowStock = stock <= 15;
          const isConfirmingDelete = deleteConfirmId === p.id;

          return (
            <div
              key={p.id}
              className="rounded-3xl border border-[#e5e5e4] bg-white p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#b8860b]/40 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-neutral-100 bg-[#faf8f5] p-2 flex items-center justify-center">
                  {isVideoMedia(p.image) ? (
                    <FastVideo
                      src={p.image}
                      autoPlay
                      loop
                      muted
                      objectFit="contain"
                      className="h-full w-full rounded-xl"
                    />
                  ) : (
                    <img src={p.image} alt={p.name} className="h-full w-full object-contain" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block rounded-full bg-[#f4f4f3] px-2.5 py-0.5 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                    {p.category}
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#18181b] truncate mt-1">{p.name}</h3>
                  <p className="text-xs text-[#71717a] truncate">{p.producer} • {p.origin}</p>
                  <p className="font-sans text-base font-extrabold text-[#b8860b] mt-0.5 tracking-tight">
                    {formatAmount(p.numericPrice)}
                  </p>
                </div>
              </div>

              {/* Stock Controls */}
              <div className="pt-4 border-t border-[#f4f4f3] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${stock > 0 ? "bg-[#b8860b]" : "bg-red-500"}`} />
                    <span className="text-xs font-bold text-[#18181b]">
                      Stock: <span className="font-sans text-xs font-bold text-[#18181b]">{stock}</span> units
                    </span>
                  </div>
                  {isLowStock && (
                    <p className="text-[10px] text-amber-700 font-bold flex items-center gap-1 mt-0.5">
                      <AlertCircle size={11} /> Low Stock Alert
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 bg-[#f4f4f3] p-1 rounded-full border border-[#e4e4e7]">
                  <button
                    onClick={() => handleAdjustStock(p.id, -1)}
                    className="h-7 w-7 rounded-full bg-white text-[#18181b] hover:bg-neutral-200 transition flex items-center justify-center font-bold shadow-2xs"
                  >
                    <Minus size={13} />
                  </button>
                  <button
                    onClick={() => handleAdjustStock(p.id, 1)}
                    className="h-7 w-7 rounded-full bg-white text-[#18181b] hover:bg-neutral-200 transition flex items-center justify-center font-bold shadow-2xs"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Edit & Delete Actions */}
              <div className="pt-3 border-t border-[#f4f4f3]">
                {isConfirmingDelete ? (
                  <div className="flex items-center justify-between gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-xs font-bold text-red-700">Delete this bottle?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="rounded-full border border-[#e5e5e4] bg-white px-3 py-1 text-xs font-bold text-[#18181b] hover:bg-[#f4f4f3] transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={isDeleting}
                        className="rounded-full bg-red-600 hover:bg-red-700 px-3 py-1 text-xs font-bold text-white transition disabled:opacity-60"
                      >
                        {isDeleting ? "Deleting…" : "Confirm"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/products/${p.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-[#e5e5e4] bg-white px-4 py-2 text-xs font-bold text-[#18181b] hover:border-[#b8860b] hover:text-[#b8860b] transition"
                    >
                      <Pencil size={12} /> Edit
                    </Link>
                    <button
                      onClick={() => setDeleteConfirmId(p.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-[#e5e5e4] bg-white px-4 py-2 text-xs font-bold text-[#18181b] hover:border-red-400 hover:text-red-600 transition"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
