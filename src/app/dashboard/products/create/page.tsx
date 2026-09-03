"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
  Trash2,
  UploadCloud,
  Video,
  Film,
  Play,
  RotateCw,
} from "lucide-react";

export default function CreateProductPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Media Type Selection: 'image' | 'video'
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

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
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [nose, setNose] = useState("");
  const [palate, setPalate] = useState("");
  const [finish, setFinish] = useState("");
  const [pairing, setPairing] = useState("");

  // Drag and Drop Media Upload State
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);

  const isVideo = (url: string) => {
    return (
      url.startsWith("data:video") ||
      url.endsWith(".mp4") ||
      url.endsWith(".webm") ||
      url.endsWith(".mov") ||
      url.endsWith(".m4v") ||
      mediaType === "video"
    );
  };

  const handleMediaFileRead = (file: File) => {
    if (file.type.startsWith("video/")) {
      setMediaType("video");
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const res = e.target.result as string;
          setImage(res);
          setVideoUrl(res);
        }
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("image/")) {
      setMediaType("image");
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMedia(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMedia(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMedia(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleMediaFileRead(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleMediaFileRead(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const finalMediaUrl = mediaType === "video" && videoUrl ? videoUrl : image;

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
          image: finalMediaUrl,
          video: mediaType === "video" ? finalMediaUrl : undefined,
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

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to create product.");
      }

      setSuccessMsg(`Bottle "${name}" successfully registered in stock and synced!`);
      setTimeout(() => {
        router.push("/dashboard/products");
      }, 1200);

    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#71717a] hover:text-[#18181b] transition"
        >
          <ArrowLeft size={16} /> Back to Products Inventory
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#b8860b] bg-[#fffcf0] border border-[#f3e5b8] px-3 py-1 rounded-full">
          Magnum Inventory CMS
        </span>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-[#18181b] tracking-tight">Add New Bottle to Stock</h1>
        <p className="text-xs text-[#71717a] mt-1">
          Create product listings with either <strong className="text-[#18181b]">high-resolution images</strong> or <strong className="text-[#b8860b]">360° bottle showcase videos</strong>.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-green-300 bg-green-50 p-4 text-xs font-bold text-green-800">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
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

        {/* MEDIA UPLOADER (IMAGE OR VIDEO) */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f4f4f3] pb-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#8e8e8e]">
              2. Bottle Showcase Media (Image or Video)
            </h2>

            {/* Media Type Toggle */}
            <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setMediaType("image")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 font-bold transition ${
                  mediaType === "image"
                    ? "bg-white text-[#18181b] shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <ImageIcon size={13} /> High-Res Image
              </button>
              <button
                type="button"
                onClick={() => setMediaType("video")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 font-bold transition ${
                  mediaType === "video"
                    ? "bg-[#b8860b] text-white shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <Video size={13} /> Bottle Video (MP4 / WebM)
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                isDraggingMedia
                  ? "border-[#b8860b] bg-[#fffcf0]"
                  : "border-neutral-300 bg-[#fafafa] hover:border-[#b8860b]/50 hover:bg-[#fffcf0]/50"
              }`}
            >
              <input
                type="file"
                accept={mediaType === "video" ? "video/*" : "image/*,video/*"}
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {mediaType === "video" && (videoUrl || isVideo(image)) ? (
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-xl text-left">
                  <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-black flex items-center justify-center shadow-xs">
                    <video
                      src={videoUrl || image}
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-contain"
                    />
                    <span className="absolute top-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[9px] font-bold text-amber-400">
                      VIDEO PREVIEW
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#18181b] truncate flex items-center gap-1.5">
                      <Film size={15} className="text-[#b8860b]" /> Video Showcase Loaded
                    </p>
                    <p className="text-xs text-[#71717a] mt-1">
                      Bottle showcase clip ready. Plays smoothly on product page.
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#b8860b] mt-2">
                      <RotateCw size={13} /> Drag new video or click to replace
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage("");
                      setVideoUrl("");
                    }}
                    className="p-2.5 text-neutral-400 hover:text-red-600 transition"
                    title="Remove video"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : image && mediaType === "image" ? (
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
                    {mediaType === "video" ? <Video size={24} /> : <UploadCloud size={24} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#18181b]">
                      Drag & drop your bottle {mediaType === "video" ? "video" : "image"} file here, or{" "}
                      <span className="text-[#b8860b] underline">browse files</span>
                    </p>
                    <p className="text-xs text-[#71717a] mt-1">
                      {mediaType === "video"
                        ? "Supports MP4, WebM, QuickTime MOV bottle rotation clips"
                        : "Supports high-res PNG, JPG, WEBP, or AVIF formats"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Direct URL Input */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-[#71717a] whitespace-nowrap">
                Or paste direct {mediaType === "video" ? "video" : "image"} URL:
              </span>
              <input
                type="text"
                value={mediaType === "video" ? (videoUrl.startsWith("data:") ? "" : videoUrl) : (image.startsWith("data:") ? "" : image)}
                onChange={(e) => {
                  if (mediaType === "video") {
                    setVideoUrl(e.target.value);
                    setImage(e.target.value);
                  } else {
                    setImage(e.target.value);
                  }
                }}
                placeholder={mediaType === "video" ? "https://.../bottle-clip.mp4" : "https://... or /products/..."}
                className="flex-1 h-9 rounded-xl border border-neutral-300 bg-white px-3 text-xs text-[#18181b] outline-none focus:border-[#b8860b]"
              />
            </div>
          </div>
        </div>

        {/* Pricing, ABV, Volume & Stock */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#8e8e8e] border-b border-[#f4f4f3] pb-2">
            3. Pricing & Technical Specs
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Price in UGX *</label>
              <input
                type="number"
                required
                value={priceUGX}
                onChange={(e) => setPriceUGX(e.target.value)}
                placeholder="e.g. 350000"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
              <span className="text-[11px] text-[#71717a]">
                ≈ USD ${(Number(priceUGX || 0) / 3700).toFixed(2)}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Bottle Volume *</label>
              <input
                type="text"
                required
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="e.g. 750 ml"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Alcohol Strength (ABV) *</label>
              <input
                type="text"
                required
                value={abv}
                onChange={(e) => setAbv(e.target.value)}
                placeholder="e.g. 40.0% ABV"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Quantity in Stock *</label>
              <input
                type="number"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="50"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-[#18181b] block">Curator Badge</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Master Distiller Edition / Limited 2026"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Sommelier Tasting Notes */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#8e8e8e] border-b border-[#f4f4f3] pb-2">
            4. Sommelier Tasting Notes
          </h2>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-[#18181b] block">Detailed Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the provenance, heritage, and cellar craftsmanship..."
              className="w-full rounded-2xl border border-[#e5e5e4] bg-white p-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Aromatic Nose</label>
              <input
                type="text"
                value={nose}
                onChange={(e) => setNose(e.target.value)}
                placeholder="e.g. Crisp green apple, charred oak, vanilla"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Palate</label>
              <input
                type="text"
                value={palate}
                onChange={(e) => setPalate(e.target.value)}
                placeholder="e.g. Silky caramel, dark honey, toasted hazelnuts"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Finish</label>
              <input
                type="text"
                value={finish}
                onChange={(e) => setFinish(e.target.value)}
                placeholder="e.g. Long, warming spice with lingering smoke"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#18181b] block">Pairing Recommendation</label>
              <input
                type="text"
                value={pairing}
                onChange={(e) => setPairing(e.target.value)}
                placeholder="e.g. Aged cheddar, prime cuts, or neat in Glencairn"
                className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs text-[#18181b] font-semibold outline-none focus:border-[#b8860b] transition shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f4f4f3]">
          <Link
            href="/dashboard/products"
            className="rounded-full border border-[#e5e5e4] bg-white px-6 py-3 text-xs font-semibold text-[#18181b] hover:bg-[#f7f7f6] transition shadow-2xs"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[#b8860b] hover:bg-[#996515] px-8 py-3 text-xs font-bold text-white transition flex items-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <span>Saving to Stock & Syncing...</span>
            ) : (
              <>
                <Plus size={16} /> Register Bottle in Stock
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
