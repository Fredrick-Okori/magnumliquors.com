"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Trash2, UploadCloud } from "lucide-react";
import { Product } from "@/data/products";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [producer, setProducer] = useState("");
  const [origin, setOrigin] = useState("");
  const [category, setCategory] = useState("Whiskey");
  const [priceUGX, setPriceUGX] = useState("0");
  const [volume, setVolume] = useState("750 ml");
  const [abv, setAbv] = useState("40.0% ABV");
  const [stockQuantity, setStockQuantity] = useState("50");
  const [badge, setBadge] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [nose, setNose] = useState("");
  const [palate, setPalate] = useState("");
  const [finish, setFinish] = useState("");
  const [pairing, setPairing] = useState("");

  const [isDraggingImage, setIsDraggingImage] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/store-products");
        const products: Product[] = await res.json();
        const found = products.find((p) => String(p.id) === String(id));

        if (found) {
          setName(found.name || "");
          setProducer(found.producer || "");
          setOrigin(found.origin || "");
          setCategory(found.category || "Whiskey");
          setPriceUGX(String(Math.round(found.numericPrice * 3700)));
          setVolume(found.volume || "750 ml");
          setAbv(found.abv || "40.0% ABV");
          setStockQuantity(String(found.stockQuantity ?? 50));
          setBadge(found.badge || "");
          setImage(found.image || "");
          setDescription(found.description || "");
          setNose(found.tastingNotes?.nose || "");
          setPalate(found.tastingNotes?.palate || "");
          setFinish(found.tastingNotes?.finish || "");
          setPairing(found.tastingNotes?.pairing || "");
        } else {
          setErrorMsg("Product not found.");
        }
      } catch (err) {
        setErrorMsg("Failed to load product details.");
      }
      setIsLoading(false);
    }

    loadProduct();
  }, [id]);

  const handleImageFileRead = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileRead(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const ugxNum = Number(priceUGX || 0);
      const res = await fetch(`/api/store-products?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          producer,
          origin,
          category,
          priceUGX: ugxNum,
          numericPrice: Number((ugxNum / 3700).toFixed(2)),
          stockQuantity: Number(stockQuantity || 50),
          abv: abv || "40.0% ABV",
          volume: volume || "750 ml",
          badge,
          image,
          description,
          tastingNotes: { nose, palate, finish, pairing },
        }),
      });

      const data = await res.json();
      if (data?.success) {
        try {
          const existing: Product[] = JSON.parse(localStorage.getItem("magnum_added_products") || "[]");
          const updated = existing.map((p) =>
            String(p.id) === String(id)
              ? {
                  ...p,
                  name,
                  producer,
                  origin,
                  category,
                  numericPrice: Number((ugxNum / 3700).toFixed(2)),
                  price: `UGX ${ugxNum.toLocaleString()}`,
                  stockQuantity: Number(stockQuantity || 50),
                  badge,
                  image,
                  description,
                  tastingNotes: { nose, palate, finish, pairing },
                }
              : p
          );
          localStorage.setItem("magnum_added_products", JSON.stringify(updated));
        } catch (e) {}

        setSuccessMsg("Product updated successfully!");
        setTimeout(() => router.push("/dashboard/products"), 1200);
      } else {
        setErrorMsg(data?.error || "Failed to update product.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-[#b8860b]" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/products"
          className="flex items-center gap-1.5 rounded-full border border-[#e5e5e4] bg-white px-4 py-2 text-xs font-bold text-[#18181b] hover:bg-[#f4f4f3] transition shadow-2xs"
        >
          <ArrowLeft size={14} /> Back to Inventory
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[#18181b] tracking-tight">Edit Bottle</h1>
          <p className="text-xs text-[#71717a] mt-0.5">Update product details in Supabase DB</p>
        </div>
      </div>

      {/* Status Messages */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#f3e5b8] bg-[#fffcf0] p-4 text-sm font-bold text-[#b8860b]">
          <CheckCircle2 size={18} className="shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Info */}
        <div className="rounded-3xl border border-[#e5e5e4] bg-white p-6 space-y-5 shadow-2xs">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#8e8e8e] border-b border-[#f4f4f3] pb-2">
            1. Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Bottle Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Don Julio 1942 Añejo"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Producer / Distillery *</label>
              <input
                type="text"
                required
                value={producer}
                onChange={(e) => setProducer(e.target.value)}
                placeholder="e.g. Don Julio Distillery"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Origin / Region *</label>
              <input
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Jalisco, Mexico"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
              >
                {["Whiskey", "Rum", "Vodka", "Liqueur", "Gin", "Tequila", "Brandy", "Champagne", "Wine"].map(
                  (cat) => <option key={cat} value={cat}>{cat}</option>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Badge / Label</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Reserve Selection"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Product Image */}
        <div className="rounded-3xl border border-[#e5e5e4] bg-white p-6 space-y-5 shadow-2xs">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#8e8e8e] border-b border-[#f4f4f3] pb-2">
            2. Product Image
          </h2>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition cursor-pointer ${
              isDraggingImage
                ? "border-[#b8860b] bg-[#fffcf0]"
                : "border-[#e5e5e4] hover:border-[#b8860b]/50 bg-[#faf8f5]"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFileRead(file);
              }}
            />

            {image && !image.startsWith("/products/") ? (
              <div className="relative mx-auto w-32 h-32">
                <img src={image} alt="Preview" className="h-full w-full object-contain rounded-xl" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImage("/products/premium-liquor-don-julio-70-uganda.jpg"); }}
                  className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#a1a1aa]">
                <UploadCloud size={32} />
                <p className="text-xs font-bold">Drop image here or click to browse</p>
                <p className="text-xs">PNG, JPG, WEBP supported</p>
                {image.startsWith("/products/") && (
                  <div className="mt-2 h-16 w-16">
                    <img src={image} alt="Current" className="h-full w-full object-contain opacity-60" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#71717a]">Or paste image URL:</span>
            <input
              type="text"
              value={image.startsWith("data:") ? "" : image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://... or /products/..."
              className="flex-1 h-9 rounded-xl border border-neutral-300 bg-white px-3 text-xs text-[#18181b] outline-none focus:border-[#b8860b]"
            />
          </div>
        </div>

        {/* Section 3: Pricing & Specs */}
        <div className="rounded-3xl border border-[#e5e5e4] bg-white p-6 space-y-5 shadow-2xs">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#8e8e8e] border-b border-[#f4f4f3] pb-2">
            3. Pricing & Inventory Specs
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Price (UGX Shs) *</label>
              <input
                type="number"
                required
                value={priceUGX}
                onChange={(e) => setPriceUGX(e.target.value)}
                placeholder="314500"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-sm font-sans font-bold text-[#18181b] outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
              <span className="text-xs font-sans font-bold text-[#b8860b]">USD: ~${(Number(priceUGX || 0) / 3700).toFixed(2)}</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Volume *</label>
              <input
                type="text"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="750 ml"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Strength ABV *</label>
              <input
                type="text"
                value={abv}
                onChange={(e) => setAbv(e.target.value)}
                placeholder="40.0% ABV"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Stock Quantity *</label>
              <input
                type="number"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="50"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-sm font-sans font-bold text-[#18181b] outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Description & Tasting Notes */}
        <div className="rounded-3xl border border-[#e5e5e4] bg-white p-6 space-y-5 shadow-2xs">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#8e8e8e] border-b border-[#f4f4f3] pb-2">
            4. Description & Sommelier Notes
          </h2>

          <div className="space-y-3 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Product Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the spirit — its character, story, and what makes it special..."
                className="w-full rounded-2xl border border-[#e5e5e4] bg-white px-4 py-3 text-xs text-[#18181b] outline-none focus:border-[#b8860b] transition shadow-2xs resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Nose", value: nose, setter: setNose, placeholder: "e.g. Rich agave, toasted oak, vanilla" },
                { label: "Palate", value: palate, setter: setPalate, placeholder: "e.g. Sweet caramel, spiced fruit" },
                { label: "Finish", value: finish, setter: setFinish, placeholder: "e.g. Long warming finish with dark chocolate" },
                { label: "Pairing", value: pairing, setter: setPairing, placeholder: "e.g. Sip neat or over a single large ice cube" },
              ].map(({ label, value, setter, placeholder }) => (
                <div key={label} className="space-y-1.5">
                  <label className="font-bold text-[#18181b] block">{label}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <Link
            href="/dashboard/products"
            className="rounded-full border border-[#e5e5e4] bg-white px-6 py-2.5 text-xs font-bold text-[#18181b] hover:bg-[#f4f4f3] transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[#b8860b] hover:bg-[#996515] px-8 py-2.5 text-xs font-bold text-white transition flex items-center gap-2 shadow-sm disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
