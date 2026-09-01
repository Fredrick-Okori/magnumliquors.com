"use client";

import { ArrowRight } from "lucide-react";
import type { CategoryProduct } from "./catalog";
import { useCurrency } from "@/context/CurrencyContext";

export function CategoryShelf({ title, products }: { title: string; products: CategoryProduct[] }) {
  const { formatAmount } = useCurrency();

  return (
    <section className="border-t border-black/10 py-12">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-serif text-3xl tracking-[-0.04em]">{title}</h2>
        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest underline decoration-[#c6d843] decoration-2 underline-offset-4">
          View all <ArrowRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product) => (
          <article key={product.name} className="border border-black/10 bg-[#faf8f3] p-3">
            <div className="mb-3 aspect-square overflow-hidden bg-[#e8e0d2]">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[#777c6f]">{product.producer}</p>
            <h3 className="mt-1 font-serif text-lg">{product.name}</h3>
            <p className="mt-2 text-sm font-sans font-bold text-neutral-900">
              {product.numericPrice ? formatAmount(product.numericPrice) : product.price}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
