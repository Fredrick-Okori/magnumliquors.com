"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Image as ImageIcon, Plus, Trash2, UploadCloud } from "lucide-react";

export default function CreateProductPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [producer, setProducer] = useState("");
  const [origin, setOrigin] = useState("Speyside, Scotland");
  const [category, setCategory] = useState("Whiskey");
  const [priceUGX, setPriceUGX] = useState("314500");
  const [volume, setVolume] = useState("750 ml");
  const [abv, setAbv] = useState("40.0% ABV");
  const [stockQuantity, setStockQuantity] = useState("50");
  const [badge, setBadge] = useState("Reserve Selection");
  const [image, setImage] = useState("/products/premium-liquor-don-julio-70-uganda.jpg");
  const [description, setDescription] = useState("");
  const [nose, setNose] = useState("");
  const [palate, setPalate] = useState("");
  const [finish, setFinish] = useState("");
  const [pairing, setPairing] = useState("");

  // Drag and Drop Image Upload State
  const [isDraggingImage, setIsDraggingImage] = useState(false);

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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFileRead(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/store-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          producer,
          origin,
          category,
          priceUGX: Number(priceUGX || 0),
          numericPrice: Number((Number(priceUGX || 0) / 3700).toFixed(2)),
          stockQuantity: Number(stockQuantity || 50),
          abv: abv || "40.0% ABV",
          volume: volume || "750 ml",
          badge,
          image,
          description,
          tastingNotes: {
            nose,
            palate,
            finish,
            pairing,
          },
        }),
      });

      const data = await res.json();
      if (data?.success && data?.product) {
        try {
          const existing = JSON.parse(localStorage.getItem("magnum_added_products") || "[]");
          const updated = [data.product, ...existing.filter((p: any) => p.id !== data.product.id)];
          localStorage.setItem("magnum_added_products", JSON.stringify(updated));
        } catch (e) {}

        setSuccessMsg("Bottle successfully saved to Supabase!");
        setTimeout(() => {
          router.push("/dashboard/products");
        }, 1200);
      } else {
        setErrorMsg(data?.error || "Failed to save bottle");
      }
    } catch (err) {
      console.error("Create bottle exception:", err);
      setErrorMsg("Network error saving bottle to database");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/products"
          className="flex items-center gap-1.5 rounded-full border border-[#e5e5e4] bg-white px-4 py-2 text-xs font-bold text-[#18181b] hover:bg-[#f4f4f3] transition shadow-2xs"
        >
          <ArrowLeft size={14} /> Back to Products
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[#18181b] tracking-tight">Add New Bottle</h1>
          <p className="text-xs text-[#71717a] mt-0.5">Post bottle directly to Supabase and publish to storefront</p>
        </div>
      </div>

      {/* Status Messages */}
      {successMsg && (
        <div className="rounded-2xl border border-[#f3e5b8] bg-[#fffcf0] p-4 text-xs font-bold text-[#b8860b] flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-xs font-bold text-red-800">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-[#e5e5e4] rounded-3xl p-8 shadow-2xs">
        
        {/* Core Product Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#8e8e8e] border-b border-[#f4f4f3] pb-2">
            1. Bottle Essentials
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-[#18181b] block">Bottle / Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Don Julio 1942 Extra Añejo"
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
                <option value="Whiskey">Whiskey</option>
                <option value="Rum">Rum</option>
                <option value="Vodka">Vodka</option>
                <option value="Liqueur">Liqueur</option>
                <option value="Gin">Gin</option>
                <option value="Tequila">Tequila</option>
                <option value="Brandy">Brandy</option>
                <option value="Champagne">Champagne</option>
                <option value="Wine">Wine</option>
              </select>
            </div>
          </div>
        </div>

        {/* DRAG AND DROP IMAGE UPLOADER ZONE */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#8e8e8e] border-b border-[#f4f4f3] pb-2">
            2. Bottle Image Upload (Drag & Drop)
          </h2>

          <div className="space-y-2">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                isDraggingImage
                  ? "border-[#b8860b] bg-[#fffcf0]"
                  : "border-neutral-300 bg-[#fafafa] hover:border-[#b8860b]/50 hover:bg-[#fffcf0]/50"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {image ? (
                <div className="flex items-center gap-6 w-full max-w-lg">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 flex items-center justify-center shadow-xs">
                    <img src={image} alt="Bottle preview" className="h-full w-full object-contain" />
                  </div>

                  <div className="text-left flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#18181b] truncate">Image Loaded & Ready</p>
                    <p className="text-xs text-[#71717a] truncate mt-0.5">{image.slice(0, 50)}...</p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#b8860b] mt-2">
                      <ImageIcon size={14} /> Drag new image or click to replace
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage("");
                    }}
                    className="p-2.5 text-neutral-400 hover:text-red-600 transition"
                    title="Remove image"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pointer-events-none">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#b8860b]/10 text-[#b8860b]">
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#18181b]">
                      Drag & drop your bottle image file here, or <span className="text-[#b8860b] underline">browse files</span>
                    </p>
                    <p className="text-xs text-[#71717a] mt-1">Supports high-res PNG, JPG, WEBP, or AVIF formats</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
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
        </div>

        {/* Pricing & Specifications */}
        <div className="space-y-4 pt-2">
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
              <label className="font-bold text-[#18181b] block">Initial Stock Quantity *</label>
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

        {/* Description & Tasting Notes */}
        <div className="space-y-4 pt-2">
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
                placeholder="Crafted in homage to master tequila making..."
                className="w-full rounded-2xl border border-[#e5e5e4] bg-white p-4 text-xs text-[#18181b] outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="font-semibold text-[#8e8e8e] block">Nose & Aromatics</label>
                <input
                  type="text"
                  value={nose}
                  onChange={(e) => setNose(e.target.value)}
                  placeholder="Crisp agave, wild honey, Madagascar vanilla..."
                  className="w-full h-10 rounded-xl border border-neutral-300 bg-white px-3 text-xs outline-none focus:border-[#b8860b]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#8e8e8e] block">Palate & Texture</label>
                <input
                  type="text"
                  value={palate}
                  onChange={(e) => setPalate(e.target.value)}
                  placeholder="Smooth caramel, toasted oak, sweet agave..."
                  className="w-full h-10 rounded-xl border border-neutral-300 bg-white px-3 text-xs outline-none focus:border-[#b8860b]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-4 border-t border-[#e5e5e4]">
          <Link
            href="/dashboard/products"
            className="rounded-full border border-neutral-300 bg-[#f4f4f3] px-6 py-3 text-xs font-bold text-[#18181b] hover:bg-[#e4e4e7] transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[#b8860b] hover:bg-[#996515] px-8 py-3 text-xs font-bold uppercase tracking-wider text-white transition shadow-sm flex items-center gap-2"
          >
            {isSubmitting ? "Saving to Supabase..." : "Post Bottle to Store"}
          </button>
        </div>

      </form>

    </div>
  );
}
