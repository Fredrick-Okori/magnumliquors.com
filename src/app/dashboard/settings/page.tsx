"use client";

import { useState } from "react";
import { Settings, Save, ShieldCheck, DollarSign } from "lucide-react";

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("Magnum Liquors");
  const [address, setAddress] = useState("Sturrock Road, Acacia Mall, Kampala, Uganda");
  const [exchangeRate, setExchangeRate] = useState("3700");
  const [commissionRate, setCommissionRate] = useState("15%");

  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#18181b] tracking-tight">Store Settings & Configurations</h1>
        <p className="text-xs text-[#71717a] mt-1">Configure branch location, exchange rates, and financial commission policies.</p>
      </div>

      <div className="rounded-3xl border border-[#e5e5e4] bg-white p-8 shadow-2xs space-y-6">
        
        <div className="space-y-4 text-xs">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#8e8e8e] border-b border-[#f4f4f3] pb-2">
            1. Branch & Location Settings
          </h2>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="font-bold text-[#18181b] block">Storefront Title</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full h-10 rounded-xl border border-neutral-300 bg-white px-3 text-xs outline-none focus:border-[#b8860b]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#18181b] block">Store Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-10 rounded-xl border border-neutral-300 bg-white px-3 text-xs outline-none focus:border-[#b8860b]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs pt-2">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#8e8e8e] border-b border-[#f4f4f3] pb-2">
            2. Currency Exchange & Commission System
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#18181b] block">USD to UGX Exchange Rate (1 USD = UGX)</label>
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="w-full h-10 rounded-xl border border-neutral-300 bg-white px-3 text-xs font-mono font-bold outline-none focus:border-[#b8860b]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#18181b] block">System Order Commission Rate</label>
              <input
                type="text"
                disabled
                value={commissionRate}
                className="w-full h-10 rounded-xl border border-neutral-200 bg-neutral-100 px-3 text-xs font-mono font-bold text-neutral-600 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#e5e5e4] flex justify-end">
          <button className="rounded-full bg-[#b8860b] hover:bg-[#996515] px-6 py-2.5 text-xs font-bold text-white transition flex items-center gap-2">
            <Save size={15} /> Save Changes
          </button>
        </div>

      </div>

    </div>
  );
}
