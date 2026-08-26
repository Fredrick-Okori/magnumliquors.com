"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { formatPrice } from "@/utils/currency";

export type CurrencyMode = "UGX" | "USD";

interface CurrencyContextType {
  currency: CurrencyMode;
  setCurrency: (mode: CurrencyMode) => void;
  formatAmount: (numericUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyMode>("UGX");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedCurrency = localStorage.getItem("magnum_currency") as CurrencyMode | null;
    if (savedCurrency && ["UGX", "USD"].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    } else {
      setCurrencyState("UGX");
    }
    setMounted(true);
  }, []);

  const setCurrency = (mode: CurrencyMode) => {
    setCurrencyState(mode);
    localStorage.setItem("magnum_currency", mode);
  };

  const activeCurrency = mounted ? currency : "UGX";

  const formatAmount = (numericUSD: number): string => {
    return formatPrice(numericUSD, activeCurrency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency: activeCurrency,
        setCurrency,
        formatAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used inside a CurrencyProvider");
  }
  return context;
}

