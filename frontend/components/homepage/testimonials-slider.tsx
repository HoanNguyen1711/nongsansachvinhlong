"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Star, Quote } from "lucide-react";
import { getLocalizedValue, LanguageCode } from "@/lib/i18n";

interface Testimonial {
  id: number;
  name: string;
  content: string;
  content_en?: string;
  content_zh?: string;
  rating: number;
  region: string | null;
  region_en?: string;
  region_zh?: string;
  avatar_url: string | null;
}

interface TestimonialsSliderProps {
  testimonials: Testimonial[];
  lang: LanguageCode;
  layout: "default" | "grid" | "editorial";
}

export default function TestimonialsSlider({ testimonials, lang, layout }: TestimonialsSliderProps) {
  const [startIndex, setStartIndex] = useState(0);

  if (!testimonials || testimonials.length === 0) return null;

  const showNavigation = testimonials.length > 3;

  const visibleTestimonials: Testimonial[] = [];
  if (testimonials.length <= 3) {
    visibleTestimonials.push(...testimonials);
  } else {
    for (let i = 0; i < 3; i++) {
      const idx = (startIndex + i) % testimonials.length;
      visibleTestimonials.push(testimonials[idx]);
    }
  }

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % testimonials.length);
  };

  const renderCard = (tItem: Testimonial) => {
    const localizedContent = getLocalizedValue(tItem, "content", lang);
    const localizedRegion = getLocalizedValue(tItem, "region", lang);

    if (layout === "grid") {
      return (
        <div
          key={tItem.id}
          className="relative rounded-3xl border border-border bg-white p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300"
        >
          <Quote className="absolute top-6 right-6 h-8 w-8 text-slate-100 pointer-events-none" />
          <div className="space-y-4">
            <div className="flex gap-0.5 text-amber-500">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`h-4 w-4 ${idx < tItem.rating ? "fill-current" : "text-slate-200"}`}
                />
              ))}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed italic">
              "{localizedContent}"
            </p>
          </div>
          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100">
            <div className="h-10 w-10 rounded-full bg-emerald-50 border border-border overflow-hidden flex items-center justify-center shrink-0">
              {tItem.avatar_url ? (
                <img src={tItem.avatar_url} alt={tItem.name} className="h-full w-full object-cover" />
              ) : (
                <MessageSquare className="h-4 w-4 text-primary" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-sm">{tItem.name}</h4>
              {localizedRegion && <p className="text-[10px] text-slate-400 font-semibold">{localizedRegion}</p>}
            </div>
          </div>
        </div>
      );
    }

    if (layout === "editorial") {
      return (
        <div
          key={tItem.id}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 w-full"
        >
          <div className="md:col-span-3 flex flex-col items-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-emerald-50 border border-border overflow-hidden flex items-center justify-center shrink-0">
              {tItem.avatar_url ? (
                <img src={tItem.avatar_url} alt={tItem.name} className="h-full w-full object-cover" />
              ) : (
                <MessageSquare className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{tItem.name}</h4>
              {localizedRegion && <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{localizedRegion}</p>}
            </div>
          </div>

          <div className="md:col-span-9 space-y-4 md:border-l md:border-slate-100 md:pl-8">
            <div className="flex gap-0.5 text-amber-500">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`h-4 w-4 ${idx < tItem.rating ? "fill-current" : "text-slate-200"}`}
                />
              ))}
            </div>
            <p className="text-slate-600 text-sm italic leading-relaxed font-serif">
              "{localizedContent}"
            </p>
          </div>
        </div>
      );
    }

    // Default Layout Card
    return (
      <div
        key={tItem.id}
        className="rounded-3xl border border-border bg-white p-6 space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-50 border border-border overflow-hidden flex items-center justify-center shrink-0">
              {tItem.avatar_url ? (
                <img src={tItem.avatar_url} alt={tItem.name} className="h-full w-full object-cover" />
              ) : (
                <MessageSquare className="h-4 w-4 text-primary" />
              )}
            </div>
            <div>
              <div className="font-semibold text-slate-800 text-sm">{tItem.name}</div>
              {localizedRegion && <div className="text-[10px] text-slate-400 font-semibold">{localizedRegion}</div>}
            </div>
          </div>

          <div className="flex gap-0.5 text-amber-500">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star
                key={idx}
                className={`h-4 w-4 ${idx < tItem.rating ? "fill-current" : "text-slate-200"}`}
              />
            ))}
          </div>

          <p className="text-slate-600 text-sm italic">
            "{localizedContent}"
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative group w-full px-1">
      {/* Testimonials Display Grid */}
      <div
        className={
          layout === "editorial"
            ? "space-y-6"
            : layout === "grid"
            ? "grid grid-cols-1 gap-8 md:grid-cols-3"
            : "grid grid-cols-1 gap-6 sm:grid-cols-3"
        }
      >
        {visibleTestimonials.map((tItem) => renderCard(tItem))}
      </div>

      {/* Navigation Buttons */}
      {showNavigation && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white text-slate-700 hover:text-primary rounded-full p-3 shadow-md border border-slate-100 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-10 duration-200"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white text-slate-700 hover:text-primary rounded-full p-3 shadow-md border border-slate-100 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-10 duration-200"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}
