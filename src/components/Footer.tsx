"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  ArrowRight,
  Check,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

function TwitterIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 3000);
  };

  return (
    <footer className="relative z-20 border-t border-white/10 bg-[#090806] text-[#D2C8BC] pt-16 pb-12 select-none">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 space-y-16">
        
        {/* Top Section: Brand Story & Cellar Club Newsletter */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-center border-b border-white/10 pb-12">
          
          <div className="lg:col-span-6 space-y-3">
            <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-white inline-block">
              MAGNUM<span className="text-[#d4af37]">.</span>
            </Link>
            <p className="text-sm font-light text-neutral-400 max-w-md leading-relaxed">
              Thoughtfully curated single malts, estate vintage wines, and artisanal spirits. Delivered in climate-controlled packaging directly to your cellar.
            </p>
          </div>

          {/* Newsletter Input Box */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#d4af37]" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                  Join The Cellar Club
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Receive private allocations, master sommelier tasting notes, and rare vintage releases.
              </p>

              <form onSubmit={handleSubscribe} className="flex gap-2 pt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="h-11 flex-1 rounded-full border border-white/15 bg-black/40 px-4 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
                  required
                />
                <button
                  type="submit"
                  className={`h-11 rounded-full px-6 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 shrink-0 ${
                    subscribed
                      ? "bg-emerald-600 text-white"
                      : "bg-[#d4af37] text-[#0c0a08] hover:bg-[#e5c875]"
                  }`}
                >
                  {subscribed ? (
                    <>
                      <Check size={14} /> Subscribed
                    </>
                  ) : (
                    <>
                      Join <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* 4-Column Quick Links Grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-10 text-xs">
          
          {/* Column 1: Collections */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Collections
            </h4>
            <ul className="space-y-2.5 font-light text-neutral-400">
              <li>
                <Link href="/#shop" className="hover:text-[#d4af37] transition">
                  Rare Single Malts
                </Link>
              </li>
              <li>
                <Link href="/#shop" className="hover:text-[#d4af37] transition">
                  Estate Vintage Wines
                </Link>
              </li>
              <li>
                <Link href="/#shop" className="hover:text-[#d4af37] transition">
                  Small Batch Bourbon
                </Link>
              </li>
              <li>
                <Link href="/#shop" className="hover:text-[#d4af37] transition">
                  Artisanal Gins & Spirits
                </Link>
              </li>
              <li>
                <Link href="/#shop" className="hover:text-[#d4af37] transition">
                  Non-Alcoholic Aperitifs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Our Story */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Our Story
            </h4>
            <ul className="space-y-2.5 font-light text-neutral-400">
              <li>
                <Link href="/#about" className="hover:text-[#d4af37] transition">
                  Heritage Since 1987
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-[#d4af37] transition">
                  Master Sommelier Curation
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-[#d4af37] transition">
                  Barrel Aging Program
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-[#d4af37] transition">
                  Press & Accolades
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-[#d4af37] transition">
                  Careers & Fellowships
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Customer Care
            </h4>
            <ul className="space-y-2.5 font-light text-neutral-400">
              <li>
                <Link href="/#shop" className="hover:text-[#d4af37] transition">
                  Track Climate Express
                </Link>
              </li>
              <li>
                <Link href="/#shop" className="hover:text-[#d4af37] transition">
                  Certificate of Authenticity
                </Link>
              </li>
              <li>
                <Link href="/#shop" className="hover:text-[#d4af37] transition">
                  Private Cellar Gifting
                </Link>
              </li>
              <li>
                <Link href="/#shop" className="hover:text-[#d4af37] transition">
                  Shipping & Return Terms
                </Link>
              </li>
              <li>
                <Link href="/#shop" className="hover:text-[#d4af37] transition">
                  Contact Sommelier
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Location & Hours */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Flagship Cellar
            </h4>
            <div className="space-y-3 font-light text-neutral-400 leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-[#d4af37] shrink-0 mt-0.5" />
                <span>Sturrock Road, Acacia Mall, Kampala</span>
              </div>
              <div className="border-t border-white/10 pt-2 space-y-1">
                <p className="text-white font-medium">Operating Hours:</p>
                <p>Mon – Sat: 10:00 AM – 10:00 PM</p>
                <p>Sun: 12:00 PM – 8:00 PM</p>
              </div>
            </div>
          </div>

        </div>

        {/* Social Links & Legal Age Compliance Bar */}
        <div className="flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-neutral-400 hover:border-[#d4af37] hover:text-white transition"
            >
              <InstagramIcon size={16} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-neutral-400 hover:border-[#d4af37] hover:text-white transition"
            >
              <TwitterIcon size={16} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-neutral-400 hover:border-[#d4af37] hover:text-white transition"
            >
              <FacebookIcon size={16} />
            </a>
          </div>

          {/* Legal Age Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-1.5 text-[11px] font-medium text-[#e5c875]">
            <ShieldCheck size={14} className="text-[#d4af37]" />
            <span>Drink Thoughtfully · 18+ / 21+ only</span>
          </div>

        </div>

        {/* Bottom Copyright & Terms */}
        <div className="flex flex-col gap-4 border-t border-white/10 pt-8 text-[11px] text-neutral-500 sm:flex-row sm:items-center sm:justify-between font-light">
          <p>© 2026 Magnum Liquors Inc. All rights reserved.</p>

          <div className="flex flex-wrap gap-6">
            <Link href="/#shop" className="hover:text-neutral-300 transition">
              Privacy Policy
            </Link>
            <Link href="/#shop" className="hover:text-neutral-300 transition">
              Terms of Service
            </Link>
            <Link href="/#shop" className="hover:text-neutral-300 transition">
              Accessibility Statement
            </Link>
            <Link href="/#shop" className="hover:text-neutral-300 transition">
              Cookie Preferences
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
