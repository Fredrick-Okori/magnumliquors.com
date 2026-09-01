"use client";

import Link from "next/link";
import { HelpCircle, ExternalLink, ShieldCheck, FileText, Database } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#18181b] tracking-tight">Help & Documentation Center</h1>
        <p className="text-xs text-[#71717a] mt-1">Documentation, Payload CMS integration guides, and Supabase management links.</p>
      </div>

      <div className="rounded-3xl border border-[#e5e5e4] bg-white p-8 shadow-2xs space-y-6">
        
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#faf8f5] p-5 border border-[#f3e5b8] space-y-2">
            <h2 className="text-sm font-bold text-[#18181b] flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#b8860b]" /> Payload CMS Admin Panel
            </h2>
            <p className="text-xs text-[#71717a] leading-relaxed">
              Manage content collections, media assets, and product catalog schemas via Payload CMS.
            </p>
            <Link
              href="/admin"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b8860b] underline pt-1"
            >
              Open Payload CMS Admin Panel <ExternalLink size={13} />
            </Link>
          </div>

          <div className="rounded-2xl bg-[#faf8f5] p-5 border border-[#f3e5b8] space-y-2">
            <h2 className="text-sm font-bold text-[#18181b] flex items-center gap-2">
              <Database size={16} className="text-[#b8860b]" /> Supabase PostgreSQL Database
            </h2>
            <p className="text-xs text-[#71717a] leading-relaxed">
              Database schema DDL with 15% system order commission triggers and stock deduction stored procedures are defined in <code className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-neutral-200">supabase_schema.sql</code>.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
