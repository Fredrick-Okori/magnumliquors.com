"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  Lock,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  User,
  X,
} from "lucide-react";
import { useCart } from "./CartContext";
import { useCurrency } from "@/context/CurrencyContext";

export function Cart({
  count,
  open,
  onClose,
}: {
  count: number;
  open: boolean;
  onClose: () => void;
}) {
  const {
    items,
    subtotal,
    estimatedTax,
    grandTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const { formatAmount } = useCurrency();

  // Multi-step Checkout State
  const [step, setStep] = useState<"bag" | "checkout" | "success">("bag");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [orderNumber, setOrderNumber] = useState("");

  if (!open) return null;

  const handleProceedToCheckout = () => {
    setStep("checkout");
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !address) return;

    setIsSubmitting(true);

    const generatedOrderNum = `MAG-${Math.floor(10000 + Math.random() * 90000)}`;
    setOrderNumber(generatedOrderNum);

    const orderPayload = {
      orderNumber: generatedOrderNum,
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      deliveryAddress: address,
      orderStatus: "Pending",
      paymentMethod,
      paymentStatus: "Pending",
      totalAmountUSD: grandTotal,
      totalAmountUGX: Math.round(grandTotal * 3700),
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
      console.warn("Order post to Payload error:", err);
    }

    setIsSubmitting(false);
    clearCart();
    setStep("success");
  };

  const handleResetCartModal = () => {
    setStep("bag");
    setFullName("");
    setEmail("");
    setPhone("");
    setAddress("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md transition-all duration-300 animate-fadeIn">
      <aside
        className="relative flex h-full w-full max-w-md flex-col justify-between border-l border-[#d4af37]/20 bg-[#0e0c0a] p-6 text-[#FAF7F2] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto scrollbar-none"
        aria-label="Shopping bag invoice"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#e5c875]">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-light text-white tracking-wide">
                {step === "checkout" ? "Delivery Checkout" : step === "success" ? "Order Confirmed" : "Your Cellar Bag"}
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-[#d4af37] font-medium">
                Magnum Fine Wine & Spirits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step === "bag" && count > 0 && (
              <span className="rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-3 py-0.5 text-[10px] font-bold text-[#e5c875]">
                {count} {count === 1 ? "bottle" : "bottles"}
              </span>
            )}
            <button
              aria-label="Close cart"
              onClick={handleResetCartModal}
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* STEP 1: BAG ITEMS LIST */}
        {step === "bag" && (
          <>
            <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-3.5 scrollbar-none">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center py-20 space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.03] border border-white/10 text-neutral-500">
                    <ShoppingBag size={30} className="text-[#d4af37]/60" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-serif text-2xl text-neutral-200">Your cellar bag is empty.</p>
                    <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed font-light">
                      Explore our rare single malts, vintage champagne, and artisanal tequilas to add bottles.
                    </p>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 transition-all duration-300 hover:border-[#d4af37]/40 hover:bg-white/[0.05]"
                  >
                    {/* Bottle Image Container */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#181512] border border-white/10 p-2 flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Bottle Details */}
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                        {item.producer}
                      </p>
                      <h3 className="text-xs font-semibold text-white truncate mt-0.5">
                        {item.name}
                      </h3>
                      <p className="text-[11px] font-mono font-medium text-neutral-300 mt-1">
                        {formatAmount(item.numericPrice)} <span className="text-[10px] text-neutral-500 font-sans">each</span>
                      </p>
                    </div>

                    {/* Quantity & Subtotal */}
                    <div className="flex flex-col items-end gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#e5c875]">
                        {formatAmount(item.numericPrice * item.quantity)}
                      </span>

                      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="text-neutral-400 hover:text-white transition"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-4 text-center font-mono text-[11px] font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="text-neutral-400 hover:text-white transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="absolute right-2.5 top-2.5 text-neutral-500 hover:text-red-400 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                
                {/* Deluxe Invoice Breakdown Card */}
                <div className="rounded-2xl border border-white/10 bg-[#181512] p-4 space-y-2.5 text-xs text-neutral-300">
                  <div className="flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1.5 text-neutral-400">
                      <FileText size={13} className="text-[#d4af37]" /> Subtotal
                    </span>
                    <span className="font-mono text-white">{formatAmount(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1.5 text-neutral-400">
                      <Truck size={13} className="text-[#d4af37]" /> Climate Express Delivery
                    </span>
                    <span className="rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-2 py-0.5 text-[10px] font-bold text-[#e5c875]">
                      FREE
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-medium">
                    <span className="text-neutral-400">Estimated Tax (8%)</span>
                    <span className="font-mono text-white">{formatAmount(estimatedTax)}</span>
                  </div>

                  <div className="border-t border-white/10 pt-2.5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Grand Total</span>
                    <span className="font-serif text-xl font-normal text-[#e5c875]">
                      {formatAmount(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full rounded-full bg-gradient-to-r from-[#d4af37] to-[#aa7c11] py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#0c0a08] transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2"
                >
                  Proceed to Checkout — {formatAmount(grandTotal)}
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 2: CHECKOUT CUSTOMER DETAILS FORM */}
        {step === "checkout" && (
          <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col justify-between py-4 space-y-5">
            <div className="space-y-4 overflow-y-auto pr-1">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <User size={13} className="text-[#d4af37]" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full h-11 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <FileText size={13} className="text-[#d4af37]" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full h-11 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Phone size={13} className="text-[#d4af37]" /> Contact Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+256 700 000 000"
                  className="w-full h-11 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
                />
              </div>

              {/* Delivery Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#d4af37]" /> Delivery Address (Kampala / Uganda)
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Sturrock Road, Acacia Mall, Kampala"
                  className="w-full rounded-xl border border-white/15 bg-white/[0.04] p-3 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <CreditCard size={13} className="text-[#d4af37]" /> Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold">
                  {[
                    "Cash on Delivery",
                    "Mobile Money",
                    "Card",
                  ].map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`rounded-xl border p-3 text-center transition-all ${
                        paymentMethod === m
                          ? "border-[#d4af37] bg-gradient-to-r from-[#d4af37]/20 to-[#aa7c11]/20 text-[#e5c875] font-bold shadow-sm"
                          : "border-white/10 bg-white/[0.03] text-neutral-400 hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 border-t border-white/10 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-gradient-to-r from-[#d4af37] to-[#aa7c11] py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#0c0a08] transition-all hover:brightness-110 shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Submitting Order..." : `Confirm Order — ${formatAmount(grandTotal)}`}
              </button>

              <button
                type="button"
                onClick={() => setStep("bag")}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-neutral-400 hover:text-white py-2 transition"
              >
                <ArrowLeft size={14} /> Return to Cellar Bag
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: ORDER SUCCESS CONFIRMATION */}
        {step === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10 space-y-6">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-[#d4af37]/20 blur-lg animate-pulse" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <CheckCircle2 size={46} />
              </div>
            </div>

            <div className="space-y-2">
              <span className="rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 px-4 py-1 text-xs font-mono font-bold text-[#e5c875]">
                Order #{orderNumber}
              </span>
              <h3 className="font-serif text-3xl font-normal text-white">
                Order Recorded!
              </h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed font-light">
                Thank you <strong className="text-white">{fullName}</strong>. Your order has been registered live and dispatched to the Cellar Dashboard. It will be delivered to <strong className="text-white">{address}</strong> in climate-controlled packaging.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#181512] p-4 text-left w-full space-y-2 text-xs text-neutral-300">
              <p className="flex justify-between"><span className="text-neutral-500 font-medium">Customer Phone:</span> <strong className="text-white font-mono">{phone}</strong></p>
              <p className="flex justify-between"><span className="text-neutral-500 font-medium">Payment Mode:</span> <strong className="text-[#e5c875]">{paymentMethod}</strong></p>
              <p className="flex justify-between"><span className="text-neutral-500 font-medium">Dashboard Sync:</span> <span className="text-emerald-400 font-semibold">Live in Payload Admin ✓</span></p>
            </div>

            <button
              onClick={handleResetCartModal}
              className="w-full rounded-full bg-white/10 border border-white/20 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/20 transition"
            >
              Continue Shopping
            </button>
          </div>
        )}

      </aside>
    </div>
  );
}
