"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";

interface SubMenuColumn {
  items: { label: string; href: string; hasDropdown?: boolean }[];
}

interface MegaMenuData {
  cardTitle: string;
  cardDescription: string;
  cardCtaText: string;
  cardCtaLink: string;
  columns: SubMenuColumn[];
}

interface NavItem {
  label: string;
  href: string;
  megaMenu?: MegaMenuData;
}

const navItems: NavItem[] = [
  {
    label: "DISCOVER",
    href: "/discover",
    megaMenu: {
      cardTitle: "Our collection",
      cardDescription:
        "We have a diverse portfolio of brands, providing a broad range of choices for consumers across occasions.",
      cardCtaText: "Learn more",
      cardCtaLink: "/#about",
      columns: [
        {
          items: [
            { label: "Scotch whisky", href: "/#shop", hasDropdown: true },
            { label: "Whiskey", href: "/#shop", hasDropdown: true },
            { label: "Tequila", href: "/#shop", hasDropdown: true },
            { label: "Gin", href: "/#shop", hasDropdown: true },
            { label: "Beer", href: "/#shop", hasDropdown: true },
          ],
        },
        {
          items: [
            { label: "Vodka", href: "/#shop", hasDropdown: true },
            { label: "Rum", href: "/#shop", hasDropdown: true },
            { label: "Liqueurs", href: "/#shop", hasDropdown: true },
            { label: "Non-alcohol brands", href: "/#shop" },
          ],
        },
      ],
    },
  },
  {
    label: "LIQUOR",
    href: "/#shop",
    megaMenu: {
      cardTitle: "Our spirits & liquors",
      cardDescription:
        "We have a diverse portfolio of spirits and fine malts, providing a broad range of choices for consumers across occasions.",
      cardCtaText: "Explore liquors",
      cardCtaLink: "/#shop",
      columns: [
        {
          items: [
            { label: "Scotch whisky", href: "/#shop", hasDropdown: true },
            { label: "Whiskey", href: "/#shop", hasDropdown: true },
            { label: "Tequila", href: "/#shop", hasDropdown: true },
            { label: "Gin", href: "/#shop", hasDropdown: true },
            { label: "Beer", href: "/#shop", hasDropdown: true },
          ],
        },
        {
          items: [
            { label: "Vodka", href: "/#shop", hasDropdown: true },
            { label: "Rum", href: "/#shop", hasDropdown: true },
            { label: "Liqueurs", href: "/#shop", hasDropdown: true },
            { label: "Non-alcohol brands", href: "/#shop" },
          ],
        },
      ],
    },
  },
  {
    label: "WINE",
    href: "/#shop",
    megaMenu: {
      cardTitle: "Our estate wines",
      cardDescription:
        "Curated vintage wines and champagnes from renowned global vineyards, crafted for memorable moments.",
      cardCtaText: "Discover wines",
      cardCtaLink: "/#shop",
      columns: [
        {
          items: [
            { label: "Estate Red Wines", href: "/#shop", hasDropdown: true },
            { label: "Crisp White Wines", href: "/#shop", hasDropdown: true },
            { label: "Prestige Vintage Champagne", href: "/#shop", hasDropdown: true },
            { label: "French Sparkling Rosé", href: "/#shop", hasDropdown: true },
          ],
        },
        {
          items: [
            { label: "Italian Prosecco Superiore", href: "/#shop", hasDropdown: true },
            { label: "Dessert & Fortified Port", href: "/#shop", hasDropdown: true },
            { label: "Aperitifs & Vermouth", href: "/#shop" },
          ],
        },
      ],
    },
  },
  {
    label: "MIXERS",
    href: "/#shop",
    megaMenu: {
      cardTitle: "Artisanal mixers",
      cardDescription:
        "Premium tonics, craft bitters, and syrups designed to elevate fine spirits and cocktail pours.",
      cardCtaText: "View mixers",
      cardCtaLink: "/#shop",
      columns: [
        {
          items: [
            { label: "Artisanal Indian Tonic Water", href: "/#shop", hasDropdown: true },
            { label: "Spiced Premium Ginger Beer", href: "/#shop", hasDropdown: true },
            { label: "Craft Orange Bitters", href: "/#shop", hasDropdown: true },
          ],
        },
        {
          items: [
            { label: "Fresh Citrus Syrups", href: "/#shop", hasDropdown: true },
            { label: "Sparkling Mineral Waters", href: "/#shop" },
          ],
        },
      ],
    },
  },
  {
    label: "OUR BARREL PICKS",
    href: "/#shop",
    megaMenu: {
      cardTitle: "Single barrel picks",
      cardDescription:
        "Exclusive single cask allocations hand-selected by our master sommelier directly from distilleries.",
      cardCtaText: "Inquire allocations",
      cardCtaLink: "/#shop",
      columns: [
        {
          items: [
            { label: "Warehouse H Single Barrel", href: "/#shop", hasDropdown: true },
            { label: "Cask Strength Speyside Malt", href: "/#shop", hasDropdown: true },
            { label: "Single Estate Tequila Reposado", href: "/#shop", hasDropdown: true },
          ],
        },
        {
          items: [
            { label: "Master Blender Private Reserve", href: "/#shop", hasDropdown: true },
            { label: "Exclusive Vintage Casks", href: "/#shop" },
          ],
        },
      ],
    },
  },
  {
    label: "TOP SHELF (HIGH END)",
    href: "/#shop",
    megaMenu: {
      cardTitle: "Top shelf reserves",
      cardDescription:
        "Prestige vintage bottles, extra añejo tequilas, and rare allocations for extraordinary occasions.",
      cardCtaText: "View top shelf",
      cardCtaLink: "/#shop",
      columns: [
        {
          items: [
            { label: "Don Julio 1942 Extra Añejo", href: "/product/2", hasDropdown: true },
            { label: "Tequila Ocho El Bajío 2018", href: "/product/6", hasDropdown: true },
            { label: "Glenfiddich 18 Year Reserve", href: "/product/4", hasDropdown: true },
          ],
        },
        {
          items: [
            { label: "Ruinart Blanc de Blancs", href: "/product/5", hasDropdown: true },
            { label: "Hennessy Very Special (V.S)", href: "/product/3", hasDropdown: true },
          ],
        },
      ],
    },
  },
  {
    label: "CIGARS",
    href: "/#shop",
    megaMenu: {
      cardTitle: "Hand-rolled cigars",
      cardDescription:
        "Premium Nicaraguan and Dominican cigars crafted to pair seamlessly with fine whisky and cognac.",
      cardCtaText: "Explore cigars",
      cardCtaLink: "/#shop",
      columns: [
        {
          items: [
            { label: "Nicaraguan Aged Maduro", href: "/#shop", hasDropdown: true },
            { label: "Dominican Sun Grown Reserve", href: "/#shop", hasDropdown: true },
          ],
        },
        {
          items: [
            { label: "Spanish Cedar Desktop Humidors", href: "/#shop", hasDropdown: true },
            { label: "Precision Double-Blade Cutters", href: "/#shop" },
          ],
        },
      ],
    },
  },
  { label: "FAQ", href: "/#about" },
  { label: "CONTACT US", href: "/#about" },
  { label: "LOYALTY PROGRAM", href: "/#about" },
];

export function HeroNavStrip() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const currentItem = navItems.find((i) => i.label === activeMenu);
  const megaData = currentItem?.megaMenu;

  return (
    <div
      className="sticky top-[73px] z-30 border-b border-neutral-200/80 bg-white/95 text-neutral-800 backdrop-blur-md select-none transition-colors duration-300"
      onMouseLeave={() => setActiveMenu(null)}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 overflow-x-auto px-6 py-3.5 sm:px-10 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.22em] font-serif scrollbar-none">
        {navItems.map((item) => {
          const hasMenu = !!item.megaMenu;
          const isOpen = activeMenu === item.label;

          return (
            <div
              key={item.label}
              className="group py-1"
              onMouseEnter={() => {
                if (hasMenu) setActiveMenu(item.label);
                else setActiveMenu(null);
              }}
            >
              <Link
                href={item.href}
                className={`inline-flex items-center gap-1 whitespace-nowrap transition-colors duration-200 ${
                  isOpen ? "text-[#b8860b] font-semibold" : "hover:text-[#b8860b]"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Full-Width Mega Menu Panel (Matching Reference UI) */}
      {megaData && (
        <div className="absolute left-0 top-full w-full border-b border-neutral-200/80 bg-white py-10 shadow-2xl animate-fadeIn z-50 text-neutral-900">
          <div className="mx-auto flex max-w-7xl items-start justify-between px-6 lg:px-12 relative">
            
            {/* Left Cream Card Block */}
            <div className="w-full max-w-xs rounded-2xl border border-neutral-200/60 bg-[#faf6f0] p-8 space-y-4 shrink-0">
              <h3 className="font-serif text-2xl font-normal text-neutral-900 tracking-tight">
                {megaData.cardTitle}
              </h3>
              <p className="text-xs leading-relaxed text-neutral-600 font-light">
                {megaData.cardDescription}
              </p>
              <Link
                href={megaData.cardCtaLink}
                onClick={() => setActiveMenu(null)}
                className="inline-flex items-center gap-2 rounded-md bg-black px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
              >
                <span>{megaData.cardCtaText}</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Right Multi-Column Chevron List */}
            <div className="flex-1 ml-12 lg:ml-16 grid grid-cols-2 gap-10">
              {megaData.columns.map((col, idx) => (
                <div
                  key={idx}
                  className={`space-y-4 ${
                    idx < megaData.columns.length - 1
                      ? "border-r border-neutral-200/80 pr-10"
                      : ""
                  }`}
                >
                  <ul className="space-y-4 text-xs font-medium text-neutral-800">
                    {col.items.map((sub) => (
                      <li key={sub.label}>
                        <Link
                          href={sub.href}
                          onClick={() => setActiveMenu(null)}
                          className="flex items-center justify-between group text-neutral-700 hover:text-black transition"
                        >
                          <span className="text-sm font-normal tracking-wide">
                            {sub.label}
                          </span>
                          {sub.hasDropdown && (
                            <ChevronDown
                              size={15}
                              className="text-neutral-400 group-hover:text-black transition"
                            />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Top Right Close Button */}
            <button
              onClick={() => setActiveMenu(null)}
              aria-label="Close menu"
              className="absolute right-6 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#faf6f0] text-neutral-600 hover:bg-neutral-200 hover:text-black transition shadow-xs"
            >
              <X size={16} />
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
