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
    return <div className="absolute inset-0 bg-emerald-600" />;
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
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay - Neutral dark gradient for readability and letting image colors shine without green tint */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent lg:from-black/50 lg:via-black/10 lg:to-transparent z-11"></div>
          </div>
        );
      })}
    </div>
  );
}
