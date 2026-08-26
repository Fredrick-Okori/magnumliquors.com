"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useCallback, useRef } from "react";

interface Slide {
  id: number;
  tag: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  bgImage: string;
}

const slides: Slide[] = [
  {
    id: 1,
    tag: "LIMITED EDITION SET",
    titleLine1: "REMARKABLE",
    titleLine2: "MOMENTS",
    description: "Showcasing some of the 20th century's finest single malts.",
    ctaText: "VIEW COLLECTION",
    ctaLink: "#shop",
    bgImage: "/Screenshot 2026-08-22 at 22.19.03.png",
  },
  {
    id: 2,
    tag: "CRAFT EXPRESSION • KENTUCKY",
    titleLine1: "HIGH RYE",
    titleLine2: "BARREL PROOF",
    description: "Distilled from an extraordinary 75% high-rye mash bill aged in charred White Oak.",
    ctaText: "VIEW COLLECTION",
    ctaLink: "#shop",
    bgImage: "/Screenshot 2026-08-22 at 22.19.13.png",
  },
  {
    id: 3,
    tag: "ESTATE VINTAGE • NAPA VALLEY",
    titleLine1: "GOLD LABEL",
    titleLine2: "GRAND RESERVE",
    description: "Hand-harvested from high-elevation hillside vineyards, aged 28 months in French oak.",
    ctaText: "VIEW COLLECTION",
    ctaLink: "#shop",
    bgImage: "/Screenshot 2026-08-22 at 22.19.27.png",
  },
  {
    id: 4,
    tag: "BOTANICAL ARTISAN • ISLAY",
    titleLine1: "BOTANICAL",
    titleLine2: "WILD HARVEST",
    description: "Hand-foraged from coastal heaths and slow-distilled in an heirloom copper pot still.",
    ctaText: "VIEW COLLECTION",
    ctaLink: "#shop",
    bgImage: "/Screenshot 2026-08-22 at 22.19.41.png",
  },
];

export function Hero() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  const goToSlide = (index: number) => {
    if (isAnimating || index === current) return;
    setIsAnimating(true);
    setCurrent(index);
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Keyboard navigation & Autoplay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // Scroll Zoom effect calculation
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(1, Math.max(0, scrollY / 600));
      const computedScale = 1 + progress * 0.3; // Zooms in scale 1.0 -> 1.30
      const computedOpacity = 1 - progress * 0.75;

      setScale(computedScale);
      setOpacity(computedOpacity);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeSlide = slides[current];

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden bg-[#e5a93c] select-none">
      
      {/* Background Images Container */}
      {slides.map((slide, index) => {
        const isActive = index === current;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
            onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const diff = touchStartX.current - e.changedTouches[0].clientX;
              if (diff > 50) nextSlide();
              if (diff < -50) prevSlide();
              touchStartX.current = null;
            }}
          >
            <Image
              src={slide.bgImage}
              alt={`${slide.titleLine1} ${slide.titleLine2}`}
              fill
              priority={index === 0}
              sizes="100vw"
              className="h-full w-full object-cover object-center"
            />

            {/* Soft subtle left gradient for text contrast */}
            <div className="absolute inset-y-0 left-0 w-full md:w-1/2 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none" />
          </div>
        );
      })}

      {/* Main Content Overlay with Scroll Zoom */}
      <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-6 sm:px-10 lg:px-14">
        <div
          className="max-w-xl text-white py-12 will-change-transform transition-transform duration-75 ease-out origin-left"
          style={{
            transform: `scale(${scale})`,
            opacity,
          }}
        >
          {/* Subtitle Tag */}
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white/95 mb-3">
            {activeSlide.tag}
          </p>

          {/* Bold Stacked Headline */}
          <h1 className="font-sans text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-[0.92] drop-shadow-sm">
            {activeSlide.titleLine1} <br />
            {activeSlide.titleLine2}
          </h1>

          {/* Description */}
          <p className="mt-5 text-sm sm:text-base font-normal leading-relaxed text-white/90 max-w-md drop-shadow-xs">
            {activeSlide.description}
          </p>

          {/* Rectangular White CTA Button */}
          <div className="mt-8">
            <Link
              href={activeSlide.ctaLink}
              className="inline-block bg-white text-neutral-900 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.18em] transition-all hover:bg-neutral-900 hover:text-white shadow-sm"
            >
              {activeSlide.ctaText}
            </Link>
          </div>

        </div>
      </div>

      {/* Right Vertical Pagination Dots */}
      <div className="absolute right-6 sm:right-10 top-1/2 z-20 -translate-y-1/2 flex flex-col items-center gap-3">
        {slides.map((slide, index) => {
          const isActive = index === current;
          return (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className="group flex h-6 w-6 items-center justify-center p-1 transition"
            >
              {isActive ? (
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-white/50 group-hover:bg-white transition" />
              )}
            </button>
          );
        })}
      </div>

    </section>
  );
}