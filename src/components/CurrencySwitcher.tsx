"use client";

import { useCurrency, CurrencyMode } from "@/context/CurrencyContext";

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  const currencies: { mode: CurrencyMode; label: string }[] = [
    { mode: "UGX", label: "UGX (Shs)" },
    { mode: "USD", label: "USD ($)" },
  ];

  return (
    <div className="inline-flex items-center rounded-full border border-neutral-200/80 bg-neutral-100 p-1 shadow-xs select-none">
      {currencies.map(({ mode, label }) => {
        const isActive = currency === mode;
        return (
          <button
            key={mode}
            onClick={() => setCurrency(mode)}
            title={`Switch price display to ${label}`}
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider transition-all duration-300 ${
              isActive
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            {mode}
          </button>
        );
      })}
    </div>
  );
}
