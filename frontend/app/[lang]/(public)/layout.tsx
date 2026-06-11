import React from "react";
import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import { FloatingButtons } from "@/components/common/floating-buttons";
import { cookies } from "next/headers";
import { getLanguage, LanguageCode } from "@/lib/i18n";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || "vi";

  if (lang === "en") {
    return {
      title: "Clean Agriculture | Clean • Quality • Sustainable • Global",
      description: "Specializing in providing clean agricultural products, exported fruits, nutritious nuts, and high-quality organic agricultural products meeting global standards.",
    };
  } else if (lang === "zh") {
    return {
      title: "清洁农产品 | 清洁 • 品质 • 可持续 • 全球",
      description: "专业提供清洁农产品、出口水果、营养坚果以及符合全球标准的高品质有机农产品。",
    };
  }

  // Default to Vietnamese (vi)
  return {
    title: "Nông Sản Sạch | Sạch • Chất Lượng • Bền Vững • Toàn Cầu",
    description: "Chuyên cung cấp các sản phẩm nông sản sạch, trái cây xuất khẩu, hạt dinh dưỡng và nông sản hữu cơ chất lượng cao đạt tiêu chuẩn toàn cầu.",
  };
}

async function getSettings() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
  try {
    const res = await fetch(`${apiUrl}/api/settings`, { next: { revalidate: 10 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching settings in layout:", error);
  }
  return { phone_number: "0901234567" };
}

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const settings = await getSettings();
  const phone = settings.phone_number || "0901234567";
  const address = settings.address || "123 Đường Phan Chu Trinh, TP. Buôn Ma Thuột, Đắk Lắk";
  const email = settings.email || "contact@nongsansach.vn";

  const resolvedParams = await params;
  const lang = (resolvedParams.lang || "vi") as LanguageCode;
  console.log("SERVER-SIDE RESOLVED LANG FROM URL:", lang);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar phone={phone} lang={lang} />
      <main className="flex-1">{children}</main>
      <Footer phone={phone} address={address} email={email} lang={lang} />
      <FloatingButtons phone={phone} />
    </div>
  );
}
