"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Wine, AlertCircle, RefreshCw } from "lucide-react";

export function AgeGate() {
  const [mounted, setMounted] = useState(false);
  const [verified, setVerified] = useState(false);
  const [underage, setUnderage] = useState(false);

  useEffect(() => {
    const isVerified = localStorage.getItem("magnum_age_verified");
    if (isVerified === "true") {
      setVerified(true);
    }
    setMounted(true);
  }, []);

  if (!mounted || verified) {
    return null;
  }

  const handleConfirmAge = () => {
    localStorage.setItem("magnum_age_verified", "true");
    setVerified(true);
  };

  const handleDenyAge = () => {
    setUnderage(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#12100d] p-8 sm:p-10 text-center text-[#FAF7F2] shadow-2xl space-y-6">
        
        {/* Brand Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e5c875]">
            <ShieldCheck size={13} className="text-[#d4af37]" />
            <span>Age Verification Required</span>
          </div>

          <h2 className="font-serif text-3xl font-bold tracking-tight text-white uppercase sm:text-4xl">
            MAGNUM<span className="text-[#d4af37]">.</span>
          </h2>
        </div>

        {underage ? (
          /* Underage Access Restriction View */
          <div className="space-y-5 py-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertCircle size={28} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">Access Restricted</h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-light">
                Sorry, you must be 18 years of age or older to enter Magnum Liquors and view our products.
              </p>
            </div>

            <button
              onClick={() => setUnderage(false)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#d4af37] hover:text-[#e5c875] transition pt-2"
            >
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        ) : (
          /* Verification Prompt View */
          <>
            <div className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[#d4af37]">
                <Wine size={22} />
              </div>

              <h3 className="text-xl font-semibold text-white">Are you 18 or older?</h3>

              <p className="text-xs text-neutral-300 leading-relaxed font-light max-w-xs mx-auto">
                Please confirm that you are at least 18 years of age to proceed to view our collection of fine wines & spirits.
              </p>
            </div>

            {/* Decision Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleConfirmAge}
                className="w-full rounded-full bg-[#d4af37] py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-[#0c0a08] transition hover:bg-[#e5c875] shadow-md"
              >
                Yes, I am 18 or older
              </button>

              <button
                onClick={handleDenyAge}
                className="w-full rounded-full border border-white/20 bg-transparent py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400 transition hover:border-white/40 hover:text-white"
              >
                No, I am under 18
              </button>
            </div>

            <p className="text-[10px] text-neutral-500 font-light">
              Drink thoughtfully · 21+ in the US / 18+ internationally
            </p>
          </>
        )}

      </div>
    </div>
  );
}

