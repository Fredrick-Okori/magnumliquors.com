"use client";

import { useEffect, useState } from "react";
import { Check, Cookie, Settings, X } from "lucide-react";

const STORAGE_KEY = "magnum_cookie_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type ConsentChoice = "accepted" | "declined";

function getConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local === "accepted" || local === "declined") return local;
  } catch (e) {}

  try {
    const value = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${STORAGE_KEY}=`))
      ?.split("=")[1];
    return value === "accepted" || value === "declined" ? value : null;
  } catch (e) {
    return null;
  }
}

function saveConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch (e) {}

  try {
    document.cookie = `${STORAGE_KEY}=${choice}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
  } catch (e) {}
}

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const isDark = false;

  useEffect(() => {
    setMounted(true);
    const existingConsent = getConsent();
    if (!existingConsent) {
      setVisible(true);
    }

    const openPreferences = () => {
      setShowPreferences(true);
      setVisible(true);
    };

    window.addEventListener("magnum:open-cookie-preferences", openPreferences);
    return () => window.removeEventListener("magnum:open-cookie-preferences", openPreferences);
  }, []);

  const choose = (choice: ConsentChoice) => {
    saveConsent(choice);
    setVisible(false);
    setShowPreferences(false);
  };

  if (!mounted || !visible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed inset-x-4 bottom-4 z-[99999] pointer-events-auto rounded-3xl border border-neutral-200/90 bg-white p-5 text-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 sm:inset-x-auto sm:right-6 sm:max-w-md"
    >
      <div className="flex items-start gap-3.5">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#f3e5b8] bg-[#fffcf0] text-[#b8860b]"
        >
          <Cookie size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-bold tracking-tight">Your privacy matters</h3>
            <button
              type="button"
              onClick={() => choose("declined")}
              aria-label="Close cookie notice"
              className="p-1 text-neutral-400 transition hover:text-neutral-900 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500 font-light">
            We use essential cookies to ensure secure cellar operations and optional analytics to enhance your tasting experience.
          </p>
        </div>
      </div>

      {showPreferences && (
        <div
          className={`mt-4 space-y-2.5 rounded-2xl border p-3.5 text-xs ${
            isDark
              ? "border-white/10 bg-[#1a1713] text-neutral-300"
              : "border-neutral-200 bg-neutral-50 text-neutral-600"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <strong className={isDark ? "text-white" : "text-neutral-900"}>Essential Cookies</strong>
              <p className="text-[11px] text-neutral-400">Required for cart, auth & vault security.</p>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Always Active
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-inherit pt-2">
            <div>
              <strong className={isDark ? "text-white" : "text-neutral-900"}>Analytics & Performance</strong>
              <p className="text-[11px] text-neutral-400">Anonymous visitor telemetry & speed metrics.</p>
            </div>
            <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Optional
            </span>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => setShowPreferences((current) => !current)}
          className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
            isDark
              ? "border-white/15 bg-white/5 text-neutral-200 hover:bg-white/10 hover:text-white"
              : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          <Settings size={13} /> Preferences
        </button>

        {showPreferences && (
          <button
            type="button"
            onClick={() => choose("declined")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
              isDark
                ? "border-white/15 bg-white/5 text-neutral-200 hover:bg-white/10"
                : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Decline Optional
          </button>
        )}

        <button
          type="button"
          onClick={() => choose("accepted")}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#b8860b] hover:bg-[#996515] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition shadow-md cursor-pointer"
        >
          <Check size={14} /> Accept All
        </button>
      </div>
    </aside>
  );
}
