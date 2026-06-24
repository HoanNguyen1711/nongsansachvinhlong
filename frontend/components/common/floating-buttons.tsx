"use client";

import React, { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import { getLanguage, LanguageCode } from "@/lib/i18n";

interface FloatingButtonsProps {
  phone?: string;
  zaloUrl?: string;
  whatsappNumber?: string;
}

const formatPhone = (phoneStr: string) => {
  if (phoneStr.length === 10) {
    return `${phoneStr.slice(0, 4)} ${phoneStr.slice(4, 7)} ${phoneStr.slice(7)}`;
  }
  return phoneStr;
};

export const FloatingButtons: React.FC<FloatingButtonsProps> = ({
  phone = "0901234567",
  zaloUrl,
  whatsappNumber,
}) => {
  const [lang, setLang] = useState<LanguageCode>("vi");

  useEffect(() => {
    setLang(getLanguage());
  }, []);

  const dynamicZaloUrl = zaloUrl || `https://zalo.me/${phone}`;

  const zaloTitle = lang === "vi" ? "Chat qua Zalo" : lang === "en" ? "Chat via Zalo" : "通过Zalo聊天";
  const whatsappTitle = lang === "vi" ? "Chat qua WhatsApp" : lang === "en" ? "Chat via WhatsApp" : "通过WhatsApp聊天";
  const phoneTitle = lang === "vi" ? "Gọi điện hotline" : lang === "en" ? "Call Hotline" : "拨打热线电话";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end">
      {/* WhatsApp Button */}
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
          title={whatsappTitle}
          id="btn-floating-whatsapp"
        >
          {/* Pulsing ring using Tailwind standard animate-ping */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30"></span>
          <svg className="relative h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      )}

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
      <div className="relative group">
        <span className="absolute right-0 top-0 h-14 w-14 rounded-full bg-amber-600 animate-ping opacity-30 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none"></span>
        <a
          href={`tel:${phone}`}
          className="relative flex h-14 w-14 hover:w-48 items-center justify-start rounded-full bg-amber-600 text-white shadow-lg transition-all duration-300 ease-out overflow-hidden"
          title={phoneTitle}
          id="btn-floating-hotline"
        >
          <div className="flex h-full w-full items-center justify-start pl-4 gap-3">
            <Phone className="relative h-6 w-6 shrink-0 group-hover:animate-bounce" />
            <span className="whitespace-nowrap font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {formatPhone(phone)}
            </span>
          </div>
        </a>
      </div>
    </div>
  );
};
