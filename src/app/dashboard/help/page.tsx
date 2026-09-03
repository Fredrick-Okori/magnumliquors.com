"use client";

import Link from "next/link";
import { HelpCircle, ExternalLink, ShieldCheck, FileText, Database, PackageCheck, Receipt, BarChart3 } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#18181b] tracking-tight">Help & Documentation Center</h1>
        <p className="text-xs text-[#71717a] mt-1">Management guides, inventory operations, and Supabase database integration.</p>
      </div>

      <div className="rounded-3xl border border-[#e5e5e4] bg-white p-8 shadow-2xs space-y-6">
        
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#faf8f5] p-5 border border-[#f3e5b8] space-y-2">
            <h2 className="text-sm font-bold text-[#18181b] flex items-center gap-2">
              <PackageCheck size={16} className="text-[#b8860b]" /> Custom Inventory & Products CMS
            </h2>
            <p className="text-xs text-[#71717a] leading-relaxed">
              Add new premium spirits, edit bottle details, adjust live stock, and manage active catalog availability directly in the Products section.
            </p>
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b8860b] underline pt-1"
            >
              Open Inventory Management <ExternalLink size={13} />
            </Link>
          </div>

          <div className="rounded-2xl bg-[#faf8f5] p-5 border border-[#f3e5b8] space-y-2">
            <h2 className="text-sm font-bold text-[#18181b] flex items-center gap-2">
              <Receipt size={16} className="text-[#b8860b]" /> Orders & Developer 10% Commission
            </h2>
            <p className="text-xs text-[#71717a] leading-relaxed">
              Every customer order is tracked in real-time with automated 10% developer agreement commission calculation and 90% net store owner settlement.
            </p>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b8860b] underline pt-1"
            >
              View Orders & Invoices <ExternalLink size={13} />
            </Link>
          </div>

          <div className="rounded-2xl bg-[#faf8f5] p-5 border border-[#f3e5b8] space-y-2">
            <h2 className="text-sm font-bold text-[#18181b] flex items-center gap-2">
              <Database size={16} className="text-[#b8860b]" /> Supabase PostgreSQL Database
            </h2>
            <p className="text-xs text-[#71717a] leading-relaxed">
              Database schema DDL, RLS security policies, and financial ledger tables are defined in <code className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-neutral-200">supabase_schema.sql</code>.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
