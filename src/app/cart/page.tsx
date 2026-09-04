"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Gift,
  Lock,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  Receipt,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  User,
  Wine,
  Zap,
} from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useTheme } from "@/context/ThemeContext";
import { FastVideo, isVideoMedia } from "@/components/FastVideo";

const FREE_DELIVERY_THRESHOLD_USD = 150;

const KAMPALA_NEIGHBORHOODS = [
  "Kololo",
  "Nakasero",
  "Naguru",
  "Bugolobi",
  "Muyenga",
  "Ntinda",
  "Acacia / Kamwokya",
  "Entebbe Road",
  "Munyoonyo",
];

export default function CartPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    items,
    count,
    subtotal,
    estimatedTax,
    grandTotal: initialGrandTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const { formatAmount } = useCurrency();

  // Multi-step Checkout State: 'bag' | 'checkout' | 'success'
  const [step, setStep] = useState<"bag" | "checkout" | "success">("bag");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Promo Code State
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);

  // Gift Wrap Option
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [giftNote, setGiftNote] = useState("");

  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash on Delivery" | "MTN Mobile Money" | "Airtel Money" | "Visa / Mastercard">("Cash on Delivery");
  const [orderNumber, setOrderNumber] = useState("");

  // Free delivery calculation
  const deliveryProgress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD_USD) * 100));
  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD_USD - subtotal);

  // Discount Calculation
  const discountAmount = Math.round(subtotal * appliedDiscount);
  const calculatedGrandTotal = Math.max(0, initialGrandTotal - discountAmount);

  const handleApplyPromo = () => {
    setPromoError(null);
    setPromoSuccess(null);
    const clean = promoCode.trim().toUpperCase();

    if (!clean) return;

    if (clean === "MAGNUM10" || clean === "VIP2026") {
      setAppliedDiscount(0.10);
      setPromoSuccess("10% Sommelier VIP Discount Applied!");
    } else if (clean === "FIRSTORDER" || clean === "WELCOME") {
      setAppliedDiscount(0.05);
      setPromoSuccess("5% Welcome Discount Applied!");
    } else {
      setPromoError("Invalid code. Try 'MAGNUM10' or 'VIP2026'");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !address) return;

    setIsSubmitting(true);

    const generatedOrderNum = `MAG-${Math.floor(10000 + Math.random() * 90000)}`;
    setOrderNumber(generatedOrderNum);

    const totalUGX = Math.round(calculatedGrandTotal * 3700);
    const systemCommUSD = Number((calculatedGrandTotal * 0.10).toFixed(2));
    const systemCommUGX = Math.round(totalUGX * 0.10);
    const netPayoutUSD = Number((calculatedGrandTotal * 0.90).toFixed(2));
    const netPayoutUGX = Math.round(totalUGX * 0.90);

    const formattedAddress = deliveryInstructions
      ? `${address} (Note: ${deliveryInstructions})`
      : address;

    const orderPayload = {
      orderNumber: generatedOrderNum,
      customerName: fullName.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim(),
      deliveryAddress: formattedAddress,
      orderStatus: "Pending",
      paymentMethod,
      paymentStatus: "Pending",
      totalAmountUSD: calculatedGrandTotal,
      totalAmountUGX: totalUGX,
      commissionRate: 0.10,
      systemCommissionUSD: systemCommUSD,
      systemCommissionUGX: systemCommUGX,
      netPayoutUSD,
      netPayoutUGX,
      items: items.map((item) => ({
        productName: item.name,
        quantity: item.quantity,
        unitPriceUSD: item.numericPrice,
        subtotalUSD: item.numericPrice * item.quantity,
      })),
    };

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
    } catch (err) {
      console.warn("Order submission error:", err);
    }

    // Save order locally for instantaneous dashboard synchronization
    const newPlacedOrder = {
      id: String(Date.now()),
      orderNumber: generatedOrderNum,
      customerName: fullName.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim(),
      deliveryAddress: formattedAddress,
      orderStatus: "Pending",
      paymentMethod,
      paymentStatus: "Pending",
      totalAmountUSD: calculatedGrandTotal,
      totalAmountUGX: totalUGX,
      commissionRate: 0.10,
      systemCommissionUSD: systemCommUSD,
      systemCommissionUGX: systemCommUGX,
      netPayoutUSD,
      netPayoutUGX,
      priority: "High",
      items: items.map((item) => ({
        productName: item.name,
        quantity: item.quantity,
        unitPriceUSD: item.numericPrice,
        subtotalUSD: item.numericPrice * item.quantity,
      })),
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    try {
      const existingRaw = localStorage.getItem("magnum_placed_orders");
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem("magnum_placed_orders", JSON.stringify([newPlacedOrder, ...existing]));
    } catch (e) {
      console.warn("Failed to save placed order locally:", e);
    }

    setIsSubmitting(false);
    clearCart();
    setStep("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0c0a08] text-[#FAF7F2]" : "bg-[#faf8f5] text-neutral-900"}`}>
      
      {/* Top Breadcrumbs & Stepper Header */}
      <section className={`border-b ${isDark ? "border-white/10 bg-[#12100d]" : "border-neutral-200/80 bg-white"} px-5 py-8 lg:px-10`}>
        <div className="mx-auto max-w-7xl">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                <Link href="/" className="hover:text-[#b8860b] transition">Home</Link>
                <span>/</span>
                <Link href="/discover" className="hover:text-[#b8860b] transition">Shop</Link>
                <span>/</span>
                <span className="text-[#b8860b]">Cellar Cart</span>
              </nav>
              <h1 className={`font-serif text-3xl sm:text-4xl font-light tracking-tight ${isDark ? "text-white" : "text-neutral-900"}`}>
                {step === "checkout" ? "Delivery & Express Checkout" : step === "success" ? "Order Confirmed" : "Your Cellar Bag"}
              </h1>
            </div>

            {/* Stepper Progress Badges */}
            {step !== "success" && (
              <div className="flex items-center gap-2 text-xs font-bold">
                <button
                  onClick={() => setStep("bag")}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 transition ${
                    step === "bag"
                      ? isDark
                        ? "bg-[#1c1813] text-[#e5c875] border border-[#b8860b]/40 shadow-xs"
                        : "bg-[#fffcf0] text-[#b8860b] border border-[#f3e5b8] shadow-xs"
                      : "text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  <ShoppingBag size={14} />
                  <span>1. Cellar Bag ({count})</span>
                </button>

                <span>→</span>

                <button
                  onClick={() => {
                    if (items.length > 0) setStep("checkout");
                  }}
                  disabled={items.length === 0}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 transition ${
                    step === "checkout"
                      ? isDark
                        ? "bg-[#1c1813] text-[#e5c875] border border-[#b8860b]/40 shadow-xs"
                        : "bg-[#fffcf0] text-[#b8860b] border border-[#f3e5b8] shadow-xs"
                      : "text-neutral-400"
                  }`}
                >
                  <Truck size={14} />
                  <span>2. Delivery & Pay</span>
                </button>
              </div>
            )}
          </div>

          {/* FREE VIP EXPRESS DELIVERY PROGRESS BAR */}
          {step !== "success" && items.length > 0 && (
            <div className={`mt-6 rounded-2xl border p-4 max-w-2xl ${isDark ? "border-white/10 bg-[#161310]" : "border-neutral-200 bg-[#fffcf0]"}`}>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-2 text-[#b8860b]">
                  <Truck size={15} />
                  {amountNeededForFreeDelivery <= 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">You&apos;ve unlocked Free VIP Express Delivery!</span>
                  ) : (
                    <span>Add {formatAmount(amountNeededForFreeDelivery)} more for Free VIP Express Delivery</span>
                  )}
                </span>
                <span className="font-mono text-neutral-400">{deliveryProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#b8860b] to-[#e5c875] transition-all duration-500 rounded-full"
                  style={{ width: `${deliveryProgress}%` }}
                />
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Main Cart Body */}
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-10 lg:py-14">

        {/* SUCCESS STATE */}
        {step === "success" && (
          <div className="mx-auto max-w-2xl text-center py-12 space-y-8 animate-in fade-in">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute -inset-3 rounded-full bg-[#b8860b]/20 blur-xl animate-pulse" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 shadow-xl">
                <CheckCircle2 size={54} />
              </div>
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fffcf0] dark:bg-[#1e1913] border border-[#f3e5b8] dark:border-[#b8860b]/40 px-4 py-1.5 text-xs font-mono font-bold text-[#b8860b]">
                <Receipt size={14} /> Order #{orderNumber}
              </span>
              <h2 className={`font-serif text-4xl sm:text-5xl font-light tracking-tight ${isDark ? "text-white" : "text-neutral-900"}`}>
                Your Order is Confirmed!
              </h2>
              <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
                Thank you <strong className={isDark ? "text-white" : "text-neutral-900"}>{fullName}</strong>. Your cellar allocation has been dispatched to our fulfillment dispatchers in climate-controlled packaging.
              </p>
            </div>

            <div className={`rounded-3xl border p-6 text-left space-y-3 text-xs ${isDark ? "border-white/10 bg-[#14120f]" : "border-neutral-200/80 bg-white shadow-sm"}`}>
              <div className="flex justify-between py-1 border-b border-inherit">
                <span className="text-neutral-400">Delivery Address:</span>
                <span className={`font-semibold max-w-xs text-right ${isDark ? "text-white" : "text-neutral-900"}`}>{address}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-inherit">
                <span className="text-neutral-400">Payment Mode:</span>
                <span className="font-bold text-[#b8860b]">{paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-inherit">
                <span className="text-neutral-400">Contact Number:</span>
                <span className="font-mono font-semibold">{phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-inherit">
                <span className="text-neutral-400">Estimated Delivery:</span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <Clock size={13} /> 45–60 mins (Kampala Express)
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-sm font-bold">Total Settled:</span>
                <span className="font-sans text-xl font-extrabold text-[#b8860b]">
                  {formatAmount(calculatedGrandTotal)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/discover"
                className="w-full sm:w-auto rounded-full bg-[#b8860b] hover:bg-[#996515] px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition shadow-md"
              >
                Continue Exploring Cellar
              </Link>
              <Link
                href="/"
                className={`w-full sm:w-auto rounded-full border px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition ${
                  isDark ? "border-white/15 bg-white/5 text-white hover:bg-white/10" : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100"
                }`}
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* STEP 1: CELLAR BAG ITEMS LIST */}
        {step === "bag" && (
          <div>
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-5">
                <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border shadow-sm ${
                  isDark ? "border-white/10 bg-[#14120f] text-[#e5c875]" : "border-neutral-200 bg-white text-[#b8860b]"
                }`}>
                  <ShoppingBag size={42} />
                </div>
                <div className="space-y-2 max-w-sm mx-auto">
                  <h2 className={`font-serif text-3xl font-light ${isDark ? "text-white" : "text-neutral-900"}`}>
                    Your cellar bag is currently empty
                  </h2>
                  <p className="text-xs text-neutral-400 leading-relaxed font-light">
                    Explore our curated single malts, prestige champagnes, and artisanal spirits to add bottles to your order.
                  </p>
                </div>
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-2 rounded-full bg-[#b8860b] hover:bg-[#996515] px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition shadow-md"
                >
                  <Wine size={15} /> Explore Master Collection
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                
                {/* Left 8 Cols: Bottle Items List */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 border-inherit">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Bottles in Cellar Bag ({count})
                    </h3>
                    <button
                      onClick={clearCart}
                      className="text-xs font-semibold text-neutral-400 hover:text-red-500 transition"
                    >
                      Clear All Bottles
                    </button>
                  </div>

                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`group relative flex flex-col sm:flex-row sm:items-center gap-5 rounded-3xl border p-5 transition-all duration-200 ${
                          isDark
                            ? "border-white/10 bg-[#14120f] hover:border-[#b8860b]/40 shadow-sm"
                            : "border-neutral-200/80 bg-white hover:border-neutral-300 shadow-xs"
                        }`}
                      >
                        {/* Bottle Thumbnail (Image or Video) */}
                        <div
                          className={`relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border p-2 flex items-center justify-center ${
                            isDark ? "border-white/10 bg-[#0c0a08]" : "border-neutral-100 bg-neutral-50"
                          }`}
                        >
                          {isVideoMedia(item.image) ? (
                            <FastVideo
                              src={item.image}
                              autoPlay
                              loop
                              muted
                              objectFit="contain"
                              className="h-full w-full rounded-xl"
                            />
                          ) : (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                          )}
                        </div>

                        {/* Bottle Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#b8860b]">
                            {item.producer}{item.volume ? ` · ${item.volume}` : ""}
                          </span>
                          <h4 className={`font-serif text-lg font-bold truncate ${isDark ? "text-white" : "text-neutral-900"}`}>
                            {item.name}
                          </h4>
                          <p className="font-sans text-xs font-semibold text-neutral-400">
                            Unit Price: <span className="text-[#b8860b]">{formatAmount(item.numericPrice)}</span>
                          </p>
                        </div>

                        {/* Quantity Stepper & Subtotal */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-inherit">
                          <span className={`font-sans text-base font-extrabold tracking-tight ${isDark ? "text-white" : "text-neutral-900"}`}>
                            {formatAmount(item.numericPrice * item.quantity)}
                          </span>

                          <div
                            className={`flex items-center gap-3 rounded-full border px-3 py-1 text-xs shadow-2xs ${
                              isDark ? "border-white/15 bg-[#1e1a15]" : "border-neutral-200 bg-neutral-100"
                            }`}
                          >
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="p-1 text-neutral-400 hover:text-white transition"
                            >
                              <Minus size={12} />
                            </button>
                            <span className={`w-4 text-center font-sans text-xs font-extrabold ${isDark ? "text-white" : "text-neutral-900"}`}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="p-1 text-neutral-400 hover:text-white transition"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Remove Bottle Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="absolute right-4 top-4 text-neutral-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Sommelier Guarantee Strip */}
                  <div className={`mt-8 rounded-3xl border p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs ${
                    isDark ? "border-white/10 bg-[#12100d]" : "border-neutral-200/80 bg-white"
                  }`}>
                    <div className="flex items-center gap-3">
                      <Truck size={20} className="text-[#b8860b] shrink-0" />
                      <div>
                        <p className="font-bold">Climate Express Delivery</p>
                        <p className="text-neutral-400 text-[11px]">45–60 mins dispatch across Kampala</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <ShieldCheck size={20} className="text-[#b8860b] shrink-0" />
                      <div>
                        <p className="font-bold">100% Authentic Vault</p>
                        <p className="text-neutral-400 text-[11px]">Direct distillery imports & certification</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Wine size={20} className="text-[#b8860b] shrink-0" />
                      <div>
                        <p className="font-bold">Sommelier Storage</p>
                        <p className="text-neutral-400 text-[11px]">Cellar temperature stabilized</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 4 Cols: Sticky Order Invoice & Checkout Summary */}
                <div className="lg:col-span-4 space-y-6 sticky top-24">
                  <div className={`rounded-3xl border p-6 space-y-5 ${
                    isDark ? "border-white/10 bg-[#14120f] shadow-xl" : "border-neutral-200/80 bg-white shadow-sm"
                  }`}>
                    <h3 className="text-base font-bold uppercase tracking-wider text-neutral-400 border-b pb-3 border-inherit">
                      Order Summary
                    </h3>

                    {/* Promo Code Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-400 block">
                        Sommelier VIP / Promo Code
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="e.g. MAGNUM10 or VIP2026"
                          className={`h-10 flex-1 rounded-2xl border px-3 text-xs uppercase font-mono outline-none ${
                            isDark
                              ? "border-white/15 bg-[#181512] text-white focus:border-[#b8860b]"
                              : "border-neutral-200 bg-neutral-50 text-neutral-900 focus:border-[#b8860b]"
                          }`}
                        />
                        <button
                          onClick={handleApplyPromo}
                          className="h-10 rounded-2xl bg-[#b8860b] hover:bg-[#996515] px-4 text-xs font-bold text-white transition"
                        >
                          Apply
                        </button>
                      </div>
                      {promoSuccess && <p className="text-[11px] font-bold text-emerald-500">{promoSuccess}</p>}
                      {promoError && <p className="text-[11px] font-semibold text-red-500">{promoError}</p>}
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-2.5 text-xs pt-2 border-t border-inherit">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Bottles Subtotal ({count}):</span>
                        <span className="font-sans font-bold">{formatAmount(subtotal)}</span>
                      </div>

                      {appliedDiscount > 0 && (
                        <div className="flex justify-between text-emerald-500 font-semibold">
                          <span>VIP Promo ({(appliedDiscount * 100)}%):</span>
                          <span>-{formatAmount(discountAmount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-neutral-400">Climate Delivery:</span>
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                          FREE EXPRESS
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-neutral-400">Estimated Tax & Vault Fees:</span>
                        <span className="font-sans font-bold">{formatAmount(estimatedTax)}</span>
                      </div>

                      <div className="border-t pt-3 flex justify-between items-center border-inherit">
                        <span className="text-sm font-extrabold">Grand Total:</span>
                        <span className="font-sans text-2xl font-extrabold text-[#b8860b]">
                          {formatAmount(calculatedGrandTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Proceed Button */}
                    <button
                      onClick={() => setStep("checkout")}
                      className="w-full rounded-full bg-[#b8860b] hover:bg-[#996515] py-4 text-xs font-bold uppercase tracking-widest text-white transition shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Proceed to Delivery & Pay</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* STEP 2: CHECKOUT & DELIVERY DETAILS */}
        {step === "checkout" && (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left 8 Cols: Delivery & Contact Form */}
            <div className={`lg:col-span-8 rounded-3xl border p-8 space-y-6 ${
              isDark ? "border-white/10 bg-[#14120f]" : "border-neutral-200/80 bg-white shadow-xs"
            }`}>
              
              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#e5c875]" : "text-[#b8860b]"} border-b pb-2 border-inherit`}>
                  1. Recipient & Contact Details
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-400 block mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <User size={15} className="absolute left-4 text-neutral-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Brenda Namuli"
                        className={`w-full h-11 rounded-2xl border pl-11 pr-4 text-xs outline-none transition ${
                          isDark
                            ? "border-white/15 bg-[#181512] text-white focus:border-[#b8860b]"
                            : "border-neutral-200 bg-neutral-50 text-neutral-900 focus:border-[#b8860b]"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-neutral-400 block mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <Mail size={15} className="absolute left-4 text-neutral-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="client@domain.com"
                          className={`w-full h-11 rounded-2xl border pl-11 pr-4 text-xs outline-none transition ${
                            isDark
                              ? "border-white/15 bg-[#181512] text-white focus:border-[#b8860b]"
                              : "border-neutral-200 bg-neutral-50 text-neutral-900 focus:border-[#b8860b]"
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-400 block mb-1">
                        Phone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <Phone size={15} className="absolute left-4 text-neutral-400" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+256 700 123456"
                          className={`w-full h-11 rounded-2xl border pl-11 pr-4 text-xs outline-none transition ${
                            isDark
                              ? "border-white/15 bg-[#181512] text-white focus:border-[#b8860b]"
                              : "border-neutral-200 bg-neutral-50 text-neutral-900 focus:border-[#b8860b]"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-4 pt-2">
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#e5c875]" : "text-[#b8860b]"} border-b pb-2 border-inherit`}>
                  2. Destination & Delivery Address
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-400 block mb-1.5">
                      Quick Kampala Area Shortcuts
                    </label>
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {KAMPALA_NEIGHBORHOODS.map((hood) => (
                        <button
                          type="button"
                          key={hood}
                          onClick={() => setAddress((prev) => (prev ? `${prev}, ${hood}` : `${hood}, Kampala`))}
                          className={`rounded-full px-3 py-1 text-xs font-semibold border transition ${
                            address.includes(hood)
                              ? "bg-[#b8860b] text-white border-[#b8860b]"
                              : isDark
                              ? "border-white/10 bg-[#181512] text-neutral-300 hover:border-[#b8860b]"
                              : "border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                          }`}
                        >
                          + {hood}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-400 block mb-1">
                      Exact Address & Building / Floor <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-4 top-3.5 text-neutral-400" />
                      <textarea
                        required
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Plot 14, Acacia Avenue, Kololo, Kampala"
                        className={`w-full rounded-2xl border pl-11 pr-4 py-3 text-xs outline-none transition ${
                          isDark
                            ? "border-white/15 bg-[#181512] text-white focus:border-[#b8860b]"
                            : "border-neutral-200 bg-neutral-50 text-neutral-900 focus:border-[#b8860b]"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-400 block mb-1">
                      Special Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="e.g. Leave at reception / call upon gate arrival"
                      className={`w-full h-11 rounded-2xl border px-4 text-xs outline-none transition ${
                        isDark
                          ? "border-white/15 bg-[#181512] text-white focus:border-[#b8860b]"
                          : "border-neutral-200 bg-neutral-50 text-neutral-900 focus:border-[#b8860b]"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-4 pt-2">
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#e5c875]" : "text-[#b8860b]"} border-b pb-2 border-inherit`}>
                  3. Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "Cash on Delivery", label: "Cash on Delivery", desc: "Pay cash upon bottle arrival", icon: Zap },
                    { id: "MTN Mobile Money", label: "MTN Mobile Money", desc: "Push prompt sent to your phone", icon: Phone },
                    { id: "Airtel Money", label: "Airtel Money", desc: "Push prompt sent to your phone", icon: Phone },
                    { id: "Visa / Mastercard", label: "Card on Delivery", desc: "Handheld POS mobile terminal", icon: CreditCard },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? "border-[#b8860b] bg-[#fffcf0] dark:bg-[#1e1913] text-[#b8860b] ring-1 ring-[#b8860b]"
                            : isDark
                            ? "border-white/10 bg-[#181512] text-neutral-400 hover:border-white/20"
                            : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <Icon size={15} />
                          <span>{m.label}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1">{m.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Complimentary Gift Packaging */}
              <div className={`rounded-2xl border p-4 space-y-2.5 text-xs ${isDark ? "border-white/10 bg-[#181512]" : "border-neutral-200 bg-neutral-50"}`}>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isGiftWrapped}
                    onChange={(e) => setIsGiftWrapped(e.target.checked)}
                    className="rounded border-neutral-300 accent-[#b8860b] h-4 w-4"
                  />
                  <span className="font-bold flex items-center gap-1.5 text-[#b8860b]">
                    <Gift size={15} /> Complimentary Luxury Gift Packaging
                  </span>
                </label>
                {isGiftWrapped && (
                  <input
                    type="text"
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    placeholder="Enter custom sommelier note to recipient..."
                    className={`w-full h-10 rounded-xl border px-3 text-xs outline-none ${
                      isDark ? "border-white/15 bg-[#0c0a08] text-white" : "border-neutral-200 bg-white text-neutral-900"
                    }`}
                  />
                )}
              </div>

            </div>

            {/* Right 4 Cols: Order Summary & Place Order Button */}
            <div className="lg:col-span-4 space-y-6 sticky top-24">
              <div className={`rounded-3xl border p-6 space-y-5 ${
                isDark ? "border-white/10 bg-[#14120f] shadow-xl" : "border-neutral-200/80 bg-white shadow-sm"
              }`}>
                <h3 className="text-base font-bold uppercase tracking-wider text-neutral-400 border-b pb-3 border-inherit">
                  Review & Confirm
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Total Bottles:</span>
                    <span className="font-bold">{count}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-neutral-400">Subtotal:</span>
                    <span className="font-sans font-bold">{formatAmount(subtotal)}</span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-500 font-semibold">
                      <span>Discount ({(appliedDiscount * 100)}%):</span>
                      <span>-{formatAmount(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-neutral-400">Delivery:</span>
                    <span className="text-emerald-500 font-bold">FREE EXPRESS</span>
                  </div>

                  <div className="border-t pt-3 flex justify-between items-center border-inherit">
                    <span className="text-sm font-extrabold">Total Due:</span>
                    <span className="font-sans text-2xl font-extrabold text-[#b8860b]">
                      {formatAmount(calculatedGrandTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-[#b8860b] hover:bg-[#996515] py-4 text-xs font-bold uppercase tracking-widest text-white transition shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Clock size={16} className="animate-spin" />
                      <span>Confirming & Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>Confirm Order — {formatAmount(calculatedGrandTotal)}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("bag")}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-neutral-400 hover:text-[#b8860b] py-1 transition"
                >
                  <ArrowLeft size={13} /> Edit Bottles in Bag
                </button>
              </div>
            </div>

          </form>
        )}

      </main>
    </div>
  );
}

