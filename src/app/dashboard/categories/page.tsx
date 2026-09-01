"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Wine,
  Plus,
  ArrowRight,
  Search,
  ExternalLink,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Product } from "@/data/products";

interface CategoryMeta {
  name: string;
  slug: string;
  description: string;
  subcategories: string[];
}

const CATEGORY_DEFINITIONS: CategoryMeta[] = [
  {
    name: "Whiskey",
    slug: "whiskey",
    description: "Single Malt Scotch, Bourbon, Irish, Japanese, Rye and Blended Whiskies.",
    subcategories: ["Single Malt Scotch", "Bourbon & Tennessee", "Irish Whiskey", "Japanese Whisky", "Rye Whiskey", "Blended Scotch"],
  },
  {
    name: "Rum",
    slug: "rum",
    description: "Aged Caribbean, Dark, Spiced, White, and Overproof reserve rums.",
    subcategories: ["Aged Dark Rum", "Spiced Rum", "White Rum", "Overproof & Navy", "Rhum Agricole"],
  },
  {
    name: "Vodka",
    slug: "vodka",
    description: "Ultra-premium distilled wheat, rye, potato, and artisanal botanical vodkas.",
    subcategories: ["Wheat & Grain Vodka", "Potato Vodka", "Botanical & Infused", "Ultra-Premium Reserve"],
  },
  {
    name: "Liqueur",
    slug: "liqueur",
    description: "Herbaceous bitters, cream liqueurs, aperitifs, and digestive fruit cordials.",
    subcategories: ["Cream Liqueurs", "Coffee & Herbal Liqueurs", "Fruit & Citrus Cordials", "Amaro & Aperitifs"],
  },
  {
    name: "Gin",
    slug: "gin",
    description: "London Dry, Japanese craft botanicals, Old Tom, and Mediterranean pink gins.",
    subcategories: ["London Dry Gin", "Botanical Craft Gin", "Pink & Flavored Gin", "Old Tom Gin"],
  },
  {
    name: "Tequila",
    slug: "tequila",
    description: "100% Blue Agave Blanco, Reposado, Añejo, Extra Añejo, and artisanal Mezcal.",
    subcategories: ["Blanco / Silver", "Reposado", "Añejo", "Extra Añejo", "Cristalino", "Artisanal Mezcal"],
  },
  {
    name: "Brandy",
    slug: "brandy",
    description: "Cognac VSOP/XO, Armagnac, Calvados, and vintage oak-matured brandies.",
    subcategories: ["Cognac VSOP & XO", "Armagnac", "Calvados (Apple Brandy)", "Spanish Brandy de Jerez"],
  },
  {
    name: "Champagne",
    slug: "champagne",
    description: "Grand Cru vintage brut, Blanc de Blancs, Rosé Prestige, and fine sparkling.",
    subcategories: ["Brut Vintage", "Blanc de Blancs", "Rosé Champagne", "Prestige Cuvée", "Prosecco & Cava"],
  },
  {
    name: "Wine",
    slug: "wine",
    description: "Full-bodied Reds, Crisp Whites, Rosé, and dessert vintages from top estates.",
    subcategories: ["Bordeaux & Cabernet", "Pinot Noir & Burgundy", "Sauvignon Blanc & Chardonnay", "Provence Rosé", "Dessert & Port Wine"],
  },
];

export default function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/store-products");
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.warn("Failed to load products count:", err);
      }
      setIsLoading(false);
    }
    loadProducts();
  }, []);

  const filteredCategories = CATEGORY_DEFINITIONS.filter(
    (cat) =>
      searchQuery === "" ||
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.subcategories.some((sub) => sub.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#18181b] tracking-tight">Stock Categories</h1>
          <p className="text-xs text-[#71717a] mt-1">
            Browse and manage the 9 core cellar spirit categories and hierarchical sub-genres.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            href="/dashboard/products/create"
            className="rounded-full bg-[#b8860b] hover:bg-[#996515] px-5 py-2.5 text-xs font-bold text-white transition shadow-sm flex items-center gap-1.5"
          >
            <Plus size={16} /> Add Bottle
          </Link>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search category or subcategory..."
          className="w-full h-10 rounded-full border border-[#e5e5e4] bg-white pl-9 pr-4 text-xs outline-none focus:border-[#b8860b]"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => {
          const bottleCount = products.filter(
            (p) => (p.category || "").toLowerCase() === category.name.toLowerCase()
          ).length;

          return (
            <div
              key={category.name}
              className="rounded-3xl border border-[#e5e5e4] bg-white p-6 shadow-2xs hover:border-[#b8860b]/50 transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fffcf0] border border-[#f3e5b8] text-[#b8860b] shadow-2xs">
                      <Wine size={18} />
                      <h3 className="font-serif text-xl font-bold text-[#18181b]">{category.name}</h3>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#b8860b]">
                        {bottleCount} {bottleCount === 1 ? "bottle listed" : "bottles listed"}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#fffcf0] border border-[#f3e5b8] px-2.5 py-0.5 text-[10px] font-bold text-[#b8860b]">
                    Active
                  </span>
                </div>

                <p className="text-xs text-[#71717a] leading-relaxed">
                  {category.description}
                </p>

                {/* Subcategories tags */}
                <div className="pt-2 border-t border-[#f4f4f3] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] block">
                    Subcategories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {category.subcategories.map((sub) => (
                      <span
                        key={sub}
                        className="rounded-lg bg-[#f7f7f6] border border-[#e5e5e4] px-2 py-0.5 text-[10px] font-medium text-[#52525b]"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#f4f4f3] flex items-center justify-between gap-2">
                <Link
                  href={`/discover?category=${encodeURIComponent(category.name)}`}
                  target="_blank"
                  className="text-xs font-bold text-[#71717a] hover:text-[#18181b] transition flex items-center gap-1"
                >
                  View Storefront <ExternalLink size={12} />
                </Link>

                <Link
                  href="/dashboard/products"
                  className="rounded-full bg-[#f4f4f3] hover:bg-[#e4e4e7] px-4 py-1.5 text-xs font-bold text-[#18181b] transition flex items-center gap-1"
                >
                  Manage Stock <ArrowRight size={12} />
                </Link>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
