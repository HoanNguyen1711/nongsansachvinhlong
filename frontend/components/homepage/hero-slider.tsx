"use client";

import React, { useState, useEffect } from "react";
import { LanguageCode } from "@/lib/i18n";

interface HeroSliderProps {
  lang: LanguageCode;
  bannerImage1?: string;
  bannerImage2?: string;
  bannerImage3?: string;
}

export default function HeroSlider({
  lang,
  bannerImage1,
  bannerImage2,
  bannerImage3,
}: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const images = [
    bannerImage1 || "https://chanhthu.com/wp-content/uploads/2024/03/chanh-thu-sau-rieng-1.png",
    bannerImage2 || "https://chanhthu.com/wp-content/uploads/2024/03/chanh-thu-buoi.png",
    bannerImage3 || "https://chanhthu.com/wp-content/uploads/2024/03/chanh-thu-chom-chom.png",
  ].filter(Boolean);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
    return <div className="absolute inset-0 bg-emerald-950" />;
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden group">
      {/* Slides display */}
      {images.map((image, idx) => {
        const isActive = idx === activeIndex;
        return (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Background Image */}
            <img
              src={image}
              alt={`Banner ${idx + 1}`}
              className={`w-full h-full object-cover transition-transform duration-7000 ease-out ${
                isActive ? "scale-105" : "scale-100"
              }`}
            />
            {/* Gradient Overlay - Darker on the left (where text is overlaid) for maximum readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/70 to-emerald-950/40 lg:from-emerald-950/90 lg:via-emerald-950/40 lg:to-transparent z-11"></div>
          </div>
        );
      })}
    </div>
  );
}
