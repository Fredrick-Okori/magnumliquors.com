"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="flex h-10 items-center gap-2 rounded-full border border-neutral-200/80 bg-neutral-100 px-3.5 text-xs font-semibold text-neutral-900 transition-all hover:bg-neutral-200 select-none shadow-xs"
    >
      {theme === "dark" ? (
        <>
          <Sun size={14} className="text-[#b8860b]" />
          <span className="hidden sm:inline uppercase tracking-wider text-[11px]">Light</span>
        </>
      ) : (
        <>
          <Moon size={14} className="text-neutral-700" />
          <span className="hidden sm:inline uppercase tracking-wider text-[11px]">Dark</span>
        </>
      )}
    </button>
  );
}
