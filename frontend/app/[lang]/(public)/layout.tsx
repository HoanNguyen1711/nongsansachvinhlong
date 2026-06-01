import React from "react";
import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import { FloatingButtons } from "@/components/common/floating-buttons";
import { cookies } from "next/headers";
import { getLanguage, LanguageCode } from "@/lib/i18n";

export const dynamic = "force-dynamic";

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
