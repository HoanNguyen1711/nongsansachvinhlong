import React from "react";
import { MapPin, Phone, Mail, MessageSquare } from "lucide-react";
import { getTranslation, LanguageCode } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const formatPhone = (phoneStr: string) => {
  if (phoneStr.length === 10) {
    return `${phoneStr.slice(0, 4)} ${phoneStr.slice(4, 7)} ${phoneStr.slice(7)}`;
  }
  return phoneStr;
};

async function getSettings() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
  try {
    const res = await fetch(`${apiUrl}/api/settings`, { next: { revalidate: 10 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching settings in contact page:", error);
  }
  return null;
}

const getLocalizedAddress = (address: string | undefined | null, lang: LanguageCode): string => {
  const addr = address || "";
  if (lang === "vi") return addr;
  
  // Check if it's the Buon Ma Thuot default
  if (addr.includes("Phan Chu Trinh") && addr.includes("Buôn Ma Thuột")) {
    if (lang === "en") return "123 Phan Chu Trinh Street, Buon Ma Thuot City, Dak Lak Province";
    if (lang === "zh") return "达乐省邦美蜀市潘周桢路123号";
  }
  
  // Check if it's the Pham Hung, Vinh Long default
  if (addr.includes("Phạm Hùng") && addr.includes("Phường 9")) {
    if (lang === "en") return "123 Pham Hung Street, Ward 9, Vinh Long City, Vinh Long Province";
    if (lang === "zh") return "永隆省永隆市九坊范雄路123号";
  }

  // Check if it's the Long Thuan, Long Ho, Vinh Long address
  if (addr.includes("Long Thuận") && addr.includes("Long Hồ")) {
    if (lang === "en") return "2B/1 Long Thuan Hamlet, Long Ho Commune, Vinh Long Province, Vietnam";
    if (lang === "zh") return "越南永隆省龙湖社龙顺邑2B/1";
  }
  
  return addr;
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = (resolvedParams.lang || "vi") as LanguageCode;

  const settings = await getSettings();
  
  const phoneNumber = settings?.phone_number || "0901234567";
  const address = settings?.address || "123 Đường Phan Chu Trinh, TP. Buôn Ma Thuột, Đắk Lắk";
  const email = settings?.email || "contact@nongsansach.vn";
  const zaloQrUrl = settings?.zalo_qr_url || "";

  const t = getTranslation(lang);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Page Banner */}
      <div className="relative overflow-hidden bg-emerald-600 text-white py-20 px-8 rounded-[32px] shadow-lg border border-white/5">
        {/* Background Image */}
        <img 
          src="/banner_contact.png" 
          alt="Contact Banner" 
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-20 z-0"
        />
        {/* Soft background glow overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.12),transparent)] z-10 pointer-events-none"></div>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

        <div className="relative z-20 text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
            {t.contactTitle}
          </h1>
          <div className="w-12 h-1 bg-emerald-500 mx-auto rounded-full"></div>
          <p className="text-emerald-200/80 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            {t.contactSubtitle}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-border space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">{t.contactInfo}</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          {lang === "vi" 
            ? "Bạn có thể ghé thăm trực tiếp văn phòng đại diện hoặc liên hệ qua các kênh trực tuyến để được tư vấn giá sỉ/lẻ tốt nhất."
            : lang === "en"
            ? "You can visit our representative office directly or contact us online for the best wholesale/retail consultation."
            : "您可以直接访问我们的代表处或在线联系我们以获取最佳的批发/零售咨询。"}
        </p>

        <ul className="space-y-6">
          <li className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 shrink-0">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{t.addressLabel}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {getLocalizedAddress(address, lang)}
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 shrink-0">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{t.hotlineLabel}</h3>
              <a href={`tel:${phoneNumber}`} className="text-xs text-emerald-600 hover:text-emerald-500 hover:underline font-semibold block mt-0.5">
                {formatPhone(phoneNumber)} (Zalo)
              </a>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 shrink-0">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{t.emailLabel}</h3>
              <a href={`mailto:${email}`} className="text-xs text-slate-500 hover:underline mt-0.5 block">
                {email}
              </a>
            </div>
          </li>
        </ul>

        {/* Quick Zalo Box */}
        <div className="rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100 flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-lg border overflow-hidden flex items-center justify-center font-bold text-[8px] text-center p-1 shrink-0">
            {zaloQrUrl ? (
              <img
                src={zaloQrUrl}
                alt="Zalo QR"
                className="h-full w-full object-contain"
              />
            ) : (
              <span>[QR Zalo]</span>
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs">
              {lang === "vi" ? "Chat Zalo nhanh 30s" : lang === "en" ? "Quick Zalo Chat 30s" : "30秒快速Zalo聊天"}
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
              {lang === "vi"
                ? "Quét mã QR hoặc nhấn vào nút bên để kết nối chat trực tiếp với nhân viên tư vấn."
                : lang === "en"
                ? "Scan the QR code or click the button next to it to connect directly with a consultant."
                : "扫描二维码或点击旁边的按钮以直接与客服人员取得联系。"}
            </p>
            <a
              href={`https://zalo.me/${phoneNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-500 hover:underline mt-1.5"
            >
              <MessageSquare className="h-3 w-3" />
              <span>{lang === "vi" ? "Bắt đầu nhắn tin" : lang === "en" ? "Start messaging" : "开始发送消息"}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
