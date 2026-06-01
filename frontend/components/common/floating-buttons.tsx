"use client";

import React, { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import { getLanguage, LanguageCode } from "@/lib/i18n";

interface FloatingButtonsProps {
  phone?: string;
  zaloUrl?: string;
}

export const FloatingButtons: React.FC<FloatingButtonsProps> = ({
  phone = "0901234567",
  zaloUrl,
}) => {
  const [lang, setLang] = useState<LanguageCode>("vi");

  useEffect(() => {
    setLang(getLanguage());
  }, []);

  const dynamicZaloUrl = zaloUrl || `https://zalo.me/${phone}`;

  const zaloTitle = lang === "vi" ? "Chat qua Zalo" : lang === "en" ? "Chat via Zalo" : "通过Zalo聊天";
  const phoneTitle = lang === "vi" ? "Gọi điện hotline" : lang === "en" ? "Call Hotline" : "拨打热线电话";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
      {/* Zalo Button */}
      <a
        href={dynamicZaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
        title={zaloTitle}
        id="btn-floating-zalo"
      >
        {/* Pulsing ring using Tailwind standard animate-ping */}
        <span className="absolute inset-0 rounded-full bg-[#0068FF] animate-ping opacity-30"></span>
        {/* Zalo Logo Text */}
        <span className="relative font-sans text-lg font-black tracking-tighter">Zalo</span>
      </a>

      {/* Hotline Button */}
      <a
        href={`tel:${phone}`}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
        title={phoneTitle}
        id="btn-floating-hotline"
      >
        <span className="absolute inset-0 rounded-full bg-amber-600 animate-ping opacity-30"></span>
        <Phone className="relative h-6 w-6 group-hover:animate-bounce" />
      </a>
    </div>
  );
};
