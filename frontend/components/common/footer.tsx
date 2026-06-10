import React from "react";
import Link from "next/link";
import { Leaf, Mail, MapPin, Phone } from "lucide-react";
import { getTranslation, getLocalizedHref, LanguageCode } from "@/lib/i18n";

interface FooterProps {
  phone?: string;
  address?: string;
  email?: string;
  lang?: LanguageCode;
}

const formatPhone = (phoneStr: string) => {
  if (phoneStr.length === 10) {
    return `${phoneStr.slice(0, 4)} ${phoneStr.slice(4, 7)} ${phoneStr.slice(7)}`;
  }
  return phoneStr;
};

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

export const Footer: React.FC<FooterProps> = ({ 
  phone = "0901234567",
  address = "123 Đường Phạm Hùng, Phường 9, TP. Vĩnh Long, Tỉnh Vĩnh Long",
  email = "contact@nongsansach.vn",
  lang = "vi"
}) => {
  const currentYear = new Date().getFullYear();
  const t = getTranslation(lang);

  return (
    <footer className="border-t border-border bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-white shadow-md">
                <img src="/logo.jpg" alt="Vinh Long Viet Nam Logo" className="h-full w-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-base font-extrabold leading-tight text-white uppercase tracking-wider">
                  {t.companyName}
                </span>
                <span className="text-[10px] font-bold leading-none text-emerald-400 tracking-wider mt-0.5">
                  {t.slogan}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pt-2">
              <strong className="block text-slate-300 mb-1.5 font-semibold">{t.companyFullName}</strong>
              {lang === "vi" 
                ? "Chuyên cung cấp các sản phẩm nông sản sạch, trái cây xuất khẩu, hạt dinh dưỡng và nông sản hữu cơ chất lượng cao đạt tiêu chuẩn toàn cầu."
                : lang === "en"
                ? "Specializing in providing clean agricultural products, exported fruits, nutritious seeds, and high-quality organic crops meeting global standards."
                : "专业提供符合全球标准的清洁农产品、出口水果、营养坚果和优质有机作物。"}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {lang === "vi" ? "Liên Kết Nhanh" : lang === "en" ? "Quick Links" : "快速链接"}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={getLocalizedHref("/", lang)} className="hover:text-white transition-colors">{t.home}</Link>
              </li>
              <li>
                <Link href={getLocalizedHref("/products", lang)} className="hover:text-white transition-colors">{t.products}</Link>
              </li>
              <li>
                <Link href={getLocalizedHref("/stories", lang)} className="hover:text-white transition-colors">{t.story}</Link>
              </li>
              <li>
                <Link href={getLocalizedHref("/about-us", lang)} className="hover:text-white transition-colors">{t.about}</Link>
              </li>
              <li>
                <Link href={getLocalizedHref("/contact", lang)} className="hover:text-white transition-colors">{t.contact}</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {lang === "vi" ? "Thông Tin Liên Hệ" : lang === "en" ? "Contact Information" : "联系信息"}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>
                  {getLocalizedAddress(address, lang)}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-emerald-400 shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-white">{formatPhone(phone)}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-emerald-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white">{email}</a>
              </li>
            </ul>
          </div>

          {/* Commitments & Certifications */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {lang === "vi" ? "Cam Kết Chất Lượng" : lang === "en" ? "Quality Commitment" : "品质承诺"}
            </h3>
            <div className="rounded-lg bg-slate-800 p-4 space-y-2 border border-slate-700">
              <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
                {lang === "vi" ? "Đạt chuẩn VietGAP" : lang === "en" ? "VietGAP Standards" : "符合VietGAP标准"}
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
                {lang === "vi" ? "100% Không chất bảo quản" : lang === "en" ? "100% Preservative Free" : "100%无防腐剂"}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                GPKD số: 1501169954 do Sở KH&ĐT Tỉnh Vĩnh Long cấp ngày 04/05/2026.
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>&copy; {currentYear} {t.companyName}. {lang === "vi" ? "Tất cả các quyền được bảo lưu." : lang === "en" ? "All rights reserved." : "保留所有权利。"}</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
