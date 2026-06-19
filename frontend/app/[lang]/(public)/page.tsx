import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, CheckCircle2, ShieldCheck, Truck, MessageSquare, Star, Sparkles, Eye, Phone, Quote, Leaf, Globe, Award } from "lucide-react";
import { getTranslation, getLocalizedValue, getLocalizedCategoryName, getLocalizedHref, LanguageCode } from "@/lib/i18n";
import HeroSlider from "@/components/homepage/hero-slider";
import TestimonialsSlider from "@/components/homepage/testimonials-slider";

export const dynamic = "force-dynamic";

interface Product {
  id: number;
  name: string;
  name_en?: string;
  name_zh?: string;
  slug: string;
  price: number | null;
  original_price: number | null;
  category: string;
  category_en?: string;
  category_zh?: string;
  image_url: string | null;
  is_available: boolean;
}

// Server Component fetching products
async function getFeaturedProducts(): Promise<Product[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
  try {
    const res = await fetch(`${apiUrl}/api/products?limit=5`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching featured products, using mockup data instead:", error);
  }
  return []; // Fallback to empty list, mockup cards will display
}

async function getSettings() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
  try {
    const res = await fetch(`${apiUrl}/api/settings`, { next: { revalidate: 10 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching settings on homepage:", error);
  }
  return { phone_number: "0901234567" };
}

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

async function getTestimonials(): Promise<Testimonial[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
  try {
    const res = await fetch(`${apiUrl}/api/testimonials`, { next: { revalidate: 60 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching testimonials on homepage:", error);
  }
  return [];
}

const mockTestimonials: Testimonial[] = [
  {
    id: -1,
    name: "Chị Mai Anh",
    region: "Quận 1, TP.HCM",
    region_en: "District 1, Ho Chi Minh City",
    region_zh: "胡志明市第一区",
    rating: 5,
    content: "Bơ sáp mua ở đây rất dẻo và béo, chín đều không bị thối đầu như mua ngoài chợ. Các bạn tư vấn qua Zalo cực kỳ nhiệt tình, giao hàng cũng nhanh.",
    content_en: "The avocados bought here are very rich and buttery, ripening evenly without rotting at the stem. Zalo customer service is extremely enthusiastic and delivery is fast.",
    content_zh: "在这里买的牛油果非常软糯浓郁，熟得很均匀，没有烂蒂。Zalo客服非常热情，送货速度也很快。",
    avatar_url: null
  },
  {
    id: -2,
    name: "Anh Tuấn",
    region: "Cầu Giấy, Hà Nội",
    region_en: "Cau Giay District, Hanoi",
    region_zh: "河内市求纸区",
    rating: 5,
    content: "Macca giòn, thơm và nứt vỏ rất dễ bóc. Mình hay mua làm quà tặng đối tác, đóng hộp gỗ trông rất lịch sự và sang trọng.",
    content_en: "The macadamia nuts are crunchy, fragrant, and easy to crack open. I often buy them as gifts for partners, the wooden packaging looks very polite and premium.",
    content_zh: "夏威夷果很香脆，外壳很容易剥开。我经常买来送给合作伙伴，木盒包装显得非常大方得体且高端。",
    avatar_url: null
  },
  {
    id: -3,
    name: "Cô Lan",
    region: "Hải Châu, Đà Nẵng",
    region_en: "Hai Chau District, Da Nang",
    region_zh: "岘港市海洲区",
    rating: 5,
    content: "Xoài ngọt lịm, hái chín tự nhiên nên có mùi thơm đặc trưng lắm. Đã mua lần thứ 3 và rất yên tâm về chất lượng an toàn vệ sinh.",
    content_en: "The mangoes are incredibly sweet, naturally tree-ripened so they have a very distinct aroma. I have bought for the third time and feel very assured about the quality and hygiene.",
    content_zh: "芒果超级甜，是自然熟的，所以有一种很特别 of 果香。已经买第三次了，对这儿的卫生和质量非常放心。",
    avatar_url: null
  }
];

// Fallback mockup products if DB is empty
const MOCKUP_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Thanh Long Ruột Đỏ Vĩnh Long",
    name_en: "Vinh Long Red Dragon Fruit",
    name_zh: "永隆省红心火龙果",
    slug: "thanh-long-ruot-do-vinh-long",
    price: 35000,
    original_price: 45000,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    image_url: null,
    is_available: true,
  },
  {
    id: 2,
    name: "Xoài Cát Hòa Lộc Chín Cây",
    name_en: "Tree-Ripened Hoa Loc Mangoes",
    name_zh: "树上熟和禄沙芒果",
    slug: "xoai-cat-hoa-loc-chin-cay",
    price: 85000,
    original_price: null,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    image_url: null,
    is_available: true,
  },
  {
    id: 3,
    name: "Sầu Riêng Ri6 Vĩnh Long",
    name_en: "Vinh Long Ri6 Durian",
    name_zh: "永隆省Ri6榴莲",
    slug: "sau-rieng-ri6-vinh-long",
    price: 150000,
    original_price: 180000,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    image_url: null,
    is_available: true,
  },
  {
    id: 4,
    name: "Măng Cụt Lái Thiêu Loại 1",
    name_en: "Lai Thieu Mangosteen (Grade 1)",
    name_zh: "莱眺特级山竹 (1级)",
    slug: "mang-cut-lai-thieu-loai-1",
    price: 95000,
    original_price: 120000,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    image_url: null,
    is_available: true,
  },
  {
    id: 5,
    name: "Dừa Xiêm Xanh Bến Tre",
    name_en: "Ben Tre Green Coconut",
    name_zh: "槟知绿椰子",
    slug: "dua-xiem-xanh-ben-tre",
    price: 18000,
    original_price: 22000,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    image_url: null,
    is_available: true,
  }
];

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const resolvedParams = await params;
  const lang = (resolvedParams.lang || "vi") as LanguageCode;

  const [apiProducts, settings, apiTestimonials] = await Promise.all([
    getFeaturedProducts(),
    getSettings(),
    getTestimonials()
  ]);
  const phone = settings.phone_number || "0901234567";
  const displayProducts = apiProducts.length > 0 ? apiProducts : MOCKUP_PRODUCTS;
  const displayTestimonials = apiTestimonials.length > 0 ? apiTestimonials : mockTestimonials;

  const t = getTranslation(lang);
  const layout = settings.homepage_layout || "default";

  if (layout === "grid") {
    return renderGridLayout(lang, settings, phone, displayProducts, displayTestimonials, t);
  } else if (layout === "editorial") {
    return renderEditorialLayout(lang, settings, phone, displayProducts, displayTestimonials, t);
  }

  return renderDefaultLayout(lang, settings, phone, displayProducts, displayTestimonials, t);
}

function renderDefaultLayout(lang: LanguageCode, settings: any, phone: string, displayProducts: any[], displayTestimonials: any[], t: any) {
  const activeProducts = displayProducts.slice(0, 4);
  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section (Boxed Card Layout) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <section className="relative overflow-hidden bg-emerald-950 text-white min-h-[500px] lg:min-h-[550px] rounded-[32px] flex items-center shadow-xl border border-white/5">
          {/* Full-width interactive Hero Slider background */}
          <HeroSlider
            lang={lang}
            bannerImage1={settings.banner_image_url_1}
            bannerImage2={settings.banner_image_url_2}
            bannerImage3={settings.banner_image_url_3}
          />

          {/* Soft background glow overlay on top of slider */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.08),transparent)] z-10 pointer-events-none"></div>
          
          <div className="relative z-20 w-full px-8 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
            {/* Text content layout overlaid on top of background */}
            <div className="max-w-2xl lg:max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400 border border-emerald-500/20 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                <span>{t.freshDaily}</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white drop-shadow-md">
                {t.heroTitleLine1} <br />
                <span className="text-emerald-400">{t.heroTitleLine2}</span>
              </h1>
              <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-lg drop-shadow-sm font-medium">
                {t.heroDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href={getLocalizedHref("/products", lang)}
                  className="flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <span>{t.viewProducts}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href={`https://zalo.me/${phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10 active:scale-95"
                >
                  <MessageSquare className="h-5 w-5 text-sky-400" />
                  <span>{t.zaloConsultation}</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 2. Trust Badges */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 rounded-3xl bg-white p-8 border border-border shadow-sm sm:grid-cols-3">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-50 p-3 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">{t.vietgapTitle}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {t.vietgapDesc}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-50 p-3 text-primary">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">{t.fastDeliveryTitle}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {t.fastDeliveryDesc}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-50 p-3 text-primary">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">{t.returnPolicyTitle}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {t.returnPolicyDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Slogan & Commitments Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-900 to-emerald-950 p-8 sm:p-12 text-white border border-emerald-800/30 shadow-2xl">
          {/* Decorative background logo watermarks */}
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.03] pointer-events-none">
            <img src="/logo.jpg" alt="Watermark" className="w-[450px] h-[450px] rounded-full object-contain" />
          </div>
          <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-10">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-400 bg-white shadow-lg">
                  <img src="/logo.jpg" alt="Vinh Long Viet Nam Logo" className="h-full w-full object-contain" />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-emerald-300">
                    {t.companyName}
                  </h2>
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-emerald-100/70">
                    {t.companyFullName}
                  </p>
                </div>
              </div>
              <div className="w-20 h-[2px] bg-emerald-500/50 mx-auto mt-2"></div>
              <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-white italic mt-2">
                " {t.slogan} "
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Cleanliness */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4 hover:bg-white/10 transition-all group duration-300">
                <div className="rounded-xl bg-emerald-500/20 text-emerald-300 p-3 w-12 h-12 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-emerald-300">{t.pillarCleanTitle}</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    {t.pillarCleanDesc}
                  </p>
                </div>
              </div>

              {/* Quality */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4 hover:bg-white/10 transition-all group duration-300">
                <div className="rounded-xl bg-emerald-500/20 text-emerald-300 p-3 w-12 h-12 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Award className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-emerald-300">{t.pillarQualityTitle}</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    {t.pillarQualityDesc}
                  </p>
                </div>
              </div>

              {/* Sustainability */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4 hover:bg-white/10 transition-all group duration-300">
                <div className="rounded-xl bg-emerald-500/20 text-emerald-300 p-3 w-12 h-12 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Leaf className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-emerald-300">{t.pillarSustainableTitle}</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    {t.pillarSustainableDesc}
                  </p>
                </div>
              </div>

              {/* Global */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4 hover:bg-white/10 transition-all group duration-300">
                <div className="rounded-xl bg-emerald-500/20 text-emerald-300 p-3 w-12 h-12 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Globe className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-emerald-300">{t.pillarGlobalTitle}</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    {t.pillarGlobalDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800">{t.featuredTitle}</h2>
            <p className="text-slate-500 text-sm">{t.featuredSubtitle}</p>
          </div>
          <Link href={getLocalizedHref("/products", lang)} className="group flex items-center gap-1 text-sm font-semibold text-primary">
            <span>{t.allProducts}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activeProducts.map((product) => {
            const localizedName = getLocalizedValue(product, "name", lang);
            const localizedCategory = getLocalizedCategoryName(product.category, lang);
            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  {/* Product Image Placeholder */}
                  <Link href={getLocalizedHref(`/products/${product.slug}`, lang)}>
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700/40">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={localizedName}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                        />
                      ) : (
                        <span className="font-bold text-sm">{t.nongSanImagePlaceholder}</span>
                      )}
                      <span className="absolute top-3 left-3 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                        {localizedCategory}
                      </span>
                    </div>
                  </Link>
                  {/* Details */}
                  <div className="mt-4 space-y-1">
                    <h3 className="font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors">
                      <Link href={getLocalizedHref(`/products/${product.slug}`, lang)}>
                        {localizedName}
                      </Link>
                    </h3>
                    <div className="flex items-baseline gap-2 pt-1">
                      {product.price ? (
                        <>
                          <span className="text-lg font-extrabold text-amber-600">
                            {product.price.toLocaleString("vi-VN")}{t.priceSuffix}
                          </span>
                          {product.original_price && (
                            <span className="text-xs text-slate-400 line-through">
                              {product.original_price.toLocaleString("vi-VN")}{t.originalPriceSuffix}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm font-bold text-slate-500">{t.contactWholesalePrice}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-5">
                  <Link
                    href={getLocalizedHref(`/products/${product.slug}`, lang)}
                    className="flex w-full items-center justify-center gap-1 rounded-2xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-transform"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{lang === "vi" ? "Xem chi tiết" : lang === "en" ? "View details" : "查看详情"}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Brand Story Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="bg-emerald-50/50 py-16 rounded-[32px] border border-border overflow-hidden">
          <div className="px-6 sm:px-10 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-3xl overflow-hidden aspect-video flex items-center justify-center border border-border bg-emerald-50">
              {settings.farm_image_url ? (
                <img
                  src={settings.farm_image_url}
                  alt="Nông trại Đắk Lắk"
                  className="h-full w-full object-cover animate-in fade-in duration-300"
                />
              ) : (
                <span className="font-bold text-emerald-800/40 text-sm">{t.brandStoryImagePlaceholder}</span>
              )}
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-slate-800">{t.brandStoryTitle}</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                {t.brandStoryDesc1}
              </p>
              <p className="text-slate-600 leading-relaxed text-sm">
                {t.brandStoryDesc2}
              </p>
              <div>
                <Link
                  href={getLocalizedHref("/about-us", lang)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  <span>{t.learnMore}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 5. Customer Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">{t.testimonialTitle}</h2>
          <p className="text-slate-500 text-sm">{t.testimonialSubtitle}</p>
        </div>

        <TestimonialsSlider testimonials={displayTestimonials} lang={lang} layout="default" />
      </section>

      {/* 6. Closing Zalo QR CTA Card */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-emerald-950 p-8 sm:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 border border-emerald-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_90%,rgba(16,185,129,0.15),transparent)]"></div>
          
          <div className="space-y-4 relative max-w-lg text-center md:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t.discount10Title}</h2>
            <p className="text-emerald-100/80 text-sm leading-relaxed">
              {t.discount10Desc}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-semibold text-emerald-300">
              <span className="flex items-center gap-1">{t.consultationFree}</span>
              <span className="flex items-center gap-1">{t.deliveryCod}</span>
            </div>
          </div>
          
          <div className="relative shrink-0 flex flex-col items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="w-32 h-32 bg-white rounded-xl overflow-hidden flex items-center justify-center text-emerald-950 font-bold text-xs p-2 text-center">
              {settings.zalo_qr_url ? (
                <img
                  src={settings.zalo_qr_url}
                  alt="Zalo QR"
                  className="h-full w-full object-contain animate-in fade-in duration-300"
                />
              ) : (
                <span>{t.scanQrZalo}</span>
              )}
            </div>
            <a
              href={`https://zalo.me/${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-emerald-500 px-6 py-2.5 text-xs font-bold hover:scale-105 active:scale-95 transition-transform"
            >
              {t.openZaloNow}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function renderGridLayout(lang: LanguageCode, settings: any, phone: string, displayProducts: any[], displayTestimonials: any[], t: any) {
  const activeProducts = displayProducts.slice(0, 4);
  return (
    <div className="space-y-24 pb-20">
      {/* Split Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="flex flex-col justify-center bg-slate-900 text-white p-8 sm:p-12 lg:p-16 rounded-[32px] space-y-6 shadow-xl border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.12),transparent)] pointer-events-none"></div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t.freshDaily}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              {t.heroTitleLine1} <br />
              <span className="text-emerald-400">{t.heroTitleLine2}</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md font-medium">
              {t.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href={getLocalizedHref("/products", lang)}
                className="flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-xs font-bold text-primary-foreground shadow-lg hover:opacity-90 active:scale-95 transition-all"
              >
                <span>{t.viewProducts}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`tel:${phone}`}
                className="flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-8 py-3.5 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition-all"
              >
                <Phone className="h-4 w-4 text-emerald-400" />
                <span>{t.callNow}: {phone}</span>
              </a>
            </div>
          </div>
          <div className="relative rounded-[32px] overflow-hidden min-h-[300px] shadow-xl border border-border bg-emerald-50">
            <img 
              src={settings.banner_image_url_1 || "https://chanhthu.com/wp-content/uploads/2024/03/chanh-thu-sau-rieng-1.png"} 
              alt="Farm hero" 
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-xs">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Tiêu chuẩn VietGAP</p>
              <h3 className="font-bold text-sm mt-1">100% Nông Sản Sạch An Toàn Tự Nhiên</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges row */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-5 border border-border hover:shadow-md transition-shadow">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">{t.vietgapTitle}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.vietgapDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-5 border border-border hover:shadow-md transition-shadow">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-primary">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">{t.fastDeliveryTitle}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.fastDeliveryDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-5 border border-border hover:shadow-md transition-shadow">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">{t.returnPolicyTitle}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.returnPolicyDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Slogan & Commitments Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-900 to-emerald-950 p-8 sm:p-12 text-white border border-emerald-800/30 shadow-2xl">
          {/* Decorative background logo watermarks */}
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.03] pointer-events-none">
            <img src="/logo.jpg" alt="Watermark" className="w-[450px] h-[450px] rounded-full object-contain" />
          </div>
          <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-10">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-400 bg-white shadow-lg">
                  <img src="/logo.jpg" alt="Vinh Long Viet Nam Logo" className="h-full w-full object-contain" />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-emerald-300">
                    {t.companyName}
                  </h2>
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-emerald-100/70">
                    {t.companyFullName}
                  </p>
                </div>
              </div>
              <div className="w-20 h-[2px] bg-emerald-500/50 mx-auto mt-2"></div>
              <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-white italic mt-2">
                " {t.slogan} "
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Cleanliness */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4 hover:bg-white/10 transition-all group duration-300">
                <div className="rounded-xl bg-emerald-500/20 text-emerald-300 p-3 w-12 h-12 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-emerald-300">{t.pillarCleanTitle}</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    {t.pillarCleanDesc}
                  </p>
                </div>
              </div>

              {/* Quality */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4 hover:bg-white/10 transition-all group duration-300">
                <div className="rounded-xl bg-emerald-500/20 text-emerald-300 p-3 w-12 h-12 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Award className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-emerald-300">{t.pillarQualityTitle}</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    {t.pillarQualityDesc}
                  </p>
                </div>
              </div>

              {/* Sustainability */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4 hover:bg-white/10 transition-all group duration-300">
                <div className="rounded-xl bg-emerald-500/20 text-emerald-300 p-3 w-12 h-12 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Leaf className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-emerald-300">{t.pillarSustainableTitle}</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    {t.pillarSustainableDesc}
                  </p>
                </div>
              </div>

              {/* Global */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4 hover:bg-white/10 transition-all group duration-300">
                <div className="rounded-xl bg-emerald-500/20 text-emerald-300 p-3 w-12 h-12 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Globe className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-emerald-300">{t.pillarGlobalTitle}</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    {t.pillarGlobalDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Products Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">{t.featuredTitle}</h2>
          <p className="text-slate-500 text-sm">{t.featuredSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activeProducts.map((product) => {
            const localizedName = getLocalizedValue(product, "name", lang);
            const localizedCategory = getLocalizedCategoryName(product.category, lang);
            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <Link href={getLocalizedHref(`/products/${product.slug}`, lang)}>
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700/30">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={localizedName}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                        />
                      ) : (
                        <span className="font-bold text-xs">{t.nongSanImagePlaceholder}</span>
                      )}
                      <span className="absolute top-3 left-3 rounded-full bg-emerald-50 border border-emerald-100/50 px-3 py-1 text-[10px] font-semibold text-emerald-800">
                        {localizedCategory}
                      </span>
                    </div>
                  </Link>
                  <div className="mt-4 space-y-1">
                    <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-primary transition-colors">
                      <Link href={getLocalizedHref(`/products/${product.slug}`, lang)}>
                        {localizedName}
                      </Link>
                    </h3>
                    <div className="flex items-baseline gap-2 pt-1">
                      {product.price ? (
                        <>
                          <span className="text-base font-black text-amber-600">
                            {product.price.toLocaleString("vi-VN")}{t.priceSuffix}
                          </span>
                          {product.original_price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              {product.original_price.toLocaleString("vi-VN")}{t.originalPriceSuffix}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs font-bold text-slate-500">{t.contactWholesalePrice}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <Link
                    href={getLocalizedHref(`/products/${product.slug}`, lang)}
                    className="flex w-full items-center justify-center gap-1 rounded-2xl bg-slate-50 border border-slate-200 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100 active:scale-95 transition-all"
                  >
                    <Eye className="h-4 w-4 text-slate-500" />
                    <span>{lang === "vi" ? "Xem chi tiết" : lang === "en" ? "View details" : "查看详情"}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center pt-4">
          <Link 
            href={getLocalizedHref("/products", lang)} 
            className="flex items-center gap-2 rounded-full border border-border bg-white px-8 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <span>{t.allProducts}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Brand Story Layout Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="bg-slate-50 py-20 rounded-[32px] border border-border overflow-hidden">
          <div className="px-6 sm:px-10 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">{t.brandStoryTitle}</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                {t.brandStoryDesc1}
              </p>
              <p className="text-slate-600 leading-relaxed text-sm">
                {t.brandStoryDesc2}
              </p>
              <div className="pt-2">
                <Link
                  href={getLocalizedHref("/about-us", lang)}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-700 text-white px-6 py-3 text-xs font-bold hover:bg-emerald-800 transition-all"
                >
                  <span>{t.learnMore}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 relative rounded-3xl overflow-hidden aspect-[4/3] flex items-center justify-center border border-border bg-white shadow-md p-4">
              {settings.farm_image_url ? (
                <img
                  src={settings.farm_image_url}
                  alt="Farm story"
                  className="h-full w-full object-cover rounded-2xl"
                />
              ) : (
                <span className="font-bold text-emerald-800/40 text-sm">{t.brandStoryImagePlaceholder}</span>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Modern Testimonials Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">{t.testimonialTitle}</h2>
          <p className="text-slate-500 text-sm">{t.testimonialSubtitle}</p>
        </div>

        <TestimonialsSlider testimonials={displayTestimonials} lang={lang} layout="grid" />
      </section>

      {/* Call to action card */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 p-8 sm:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 border border-slate-800 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_90%,rgba(16,185,129,0.15),transparent)]"></div>
          
          <div className="space-y-4 relative max-w-lg text-center md:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t.discount10Title}</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {t.discount10Desc}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-semibold text-emerald-400">
              <span className="flex items-center gap-1">{t.consultationFree}</span>
              <span className="flex items-center gap-1">{t.deliveryCod}</span>
            </div>
          </div>
          
          <div className="relative shrink-0 flex flex-col items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="w-32 h-32 bg-white rounded-xl overflow-hidden flex items-center justify-center text-slate-950 font-bold text-xs p-2 text-center">
              {settings.zalo_qr_url ? (
                <img
                  src={settings.zalo_qr_url}
                  alt="Zalo QR"
                  className="h-full w-full object-contain animate-in fade-in duration-300"
                />
              ) : (
                <span>{t.scanQrZalo}</span>
              )}
            </div>
            <a
              href={`https://zalo.me/${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-emerald-500 px-6 py-2.5 text-xs font-bold hover:scale-105 active:scale-95 transition-transform"
            >
              {t.openZaloNow}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function renderEditorialLayout(lang: LanguageCode, settings: any, phone: string, displayProducts: any[], displayTestimonials: any[], t: any) {
  const dealProduct = displayProducts[0] || MOCKUP_PRODUCTS[0];
  const dealName = getLocalizedValue(dealProduct, "name", lang);
  const dealCategory = getLocalizedCategoryName(dealProduct.category, lang);
  const dealDescription = getLocalizedValue(dealProduct, "description", lang);
  const remainingProducts = displayProducts.slice(1, 5);

  return (
    <div className="space-y-28 pb-20">
      {/* Editorial Header Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <section className="relative overflow-hidden bg-emerald-950 text-white min-h-[500px] lg:min-h-[550px] rounded-[32px] flex items-center justify-center shadow-xl border border-white/5">
          {/* Background image for editorial hero */}
          <img 
            src={settings.banner_image_url_1 || "https://chanhthu.com/wp-content/uploads/2024/03/chanh-thu-sau-rieng-1.png"}
            alt="Editorial Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* High contrast overlay for text readability */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.25),transparent)]"></div>

          <div className="mx-auto max-w-4xl px-8 py-16 sm:px-12 sm:py-20 text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20 uppercase tracking-widest backdrop-blur-md">
              {t.freshDaily}
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none uppercase font-serif">
              {t.heroTitleLine1} <br />
              <span className="text-emerald-400">{t.heroTitleLine2}</span>
            </h1>
            <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-medium">
              {t.heroDescription}
            </p>
            <div className="flex justify-center pt-6">
              <Link
                href={getLocalizedHref("/products", lang)}
                className="rounded-full bg-emerald-500 px-10 py-4 text-xs font-bold text-white shadow-xl hover:bg-emerald-400 active:scale-95 transition-all uppercase tracking-widest"
              >
                {t.viewProducts}
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Deal of the Day Highlight */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[32px] border border-border overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 relative aspect-square lg:aspect-auto min-h-[350px] bg-emerald-50">
            {dealProduct.image_url ? (
              <img
                src={dealProduct.image_url}
                alt={dealName}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-bold text-emerald-800/40">{t.nongSanImagePlaceholder}</div>
            )}
            <span className="absolute top-6 left-6 rounded-full bg-emerald-100 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {lang === "vi" ? "Sản phẩm nổi bật" : lang === "en" ? "Featured Product" : "推荐产品"}
            </span>
          </div>
          
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between space-y-8 border-t lg:border-t-0 lg:border-l border-border">
            <div className="space-y-4">
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">{dealCategory}</span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight font-serif leading-snug">{dealName}</h3>
              <div className="flex items-baseline gap-2 pt-2">
                {dealProduct.price ? (
                  <>
                    <span className="text-2xl font-black text-amber-600">
                      {dealProduct.price.toLocaleString("vi-VN")}{t.priceSuffix}
                    </span>
                    {dealProduct.original_price && (
                      <span className="text-xs text-slate-400 line-through">
                        {dealProduct.original_price.toLocaleString("vi-VN")}{t.originalPriceSuffix}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm font-bold text-slate-500">{t.contactWholesalePrice}</span>
                )}
              </div>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed pt-2">
                {dealDescription}
              </p>
            </div>
            
            <div className="pt-6 border-t border-slate-100">
              <Link
                href={getLocalizedHref(`/products/${dealProduct.slug}`, lang)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white shadow hover:bg-slate-800 transition-all"
              >
                <Eye className="h-4 w-4" />
                <span>{lang === "vi" ? "Xem chi tiết sản phẩm" : lang === "en" ? "View Product Details" : "查看产品详情"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Slogan & Commitments Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-900 to-emerald-950 p-8 sm:p-12 text-white border border-emerald-800/30 shadow-2xl">
          {/* Decorative background logo watermarks */}
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.03] pointer-events-none">
            <img src="/logo.jpg" alt="Watermark" className="w-[450px] h-[450px] rounded-full object-contain" />
          </div>
          <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-10">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-400 bg-white shadow-lg">
                  <img src="/logo.jpg" alt="Vinh Long Viet Nam Logo" className="h-full w-full object-contain" />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-emerald-300">
                    {t.companyName}
                  </h2>
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-emerald-100/70">
                    {t.companyFullName}
                  </p>
                </div>
              </div>
              <div className="w-20 h-[2px] bg-emerald-500/50 mx-auto mt-2"></div>
              <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-white italic mt-2">
                " {t.slogan} "
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Cleanliness */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4 hover:bg-white/10 transition-all group duration-300">
                <div className="rounded-xl bg-emerald-500/20 text-emerald-300 p-3 w-12 h-12 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-emerald-300">{t.pillarCleanTitle}</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    {t.pillarCleanDesc}
                  </p>
                </div>
              </div>

              {/* Quality */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4 hover:bg-white/10 transition-all group duration-300">
                <div className="rounded-xl bg-emerald-500/20 text-emerald-300 p-3 w-12 h-12 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Award className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-emerald-300">{t.pillarQualityTitle}</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    {t.pillarQualityDesc}
                  </p>
                </div>
              </div>

              {/* Sustainability */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4 hover:bg-white/10 transition-all group duration-300">
                <div className="rounded-xl bg-emerald-500/20 text-emerald-300 p-3 w-12 h-12 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Leaf className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-emerald-300">{t.pillarSustainableTitle}</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    {t.pillarSustainableDesc}
                  </p>
                </div>
              </div>

              {/* Global */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4 hover:bg-white/10 transition-all group duration-300">
                <div className="rounded-xl bg-emerald-500/20 text-emerald-300 p-3 w-12 h-12 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Globe className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-emerald-300">{t.pillarGlobalTitle}</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    {t.pillarGlobalDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Showcase of Other Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row justify-between items-baseline gap-4">
          <h2 className="text-2xl font-black tracking-tight text-slate-800 font-serif uppercase tracking-wider">{lang === "vi" ? "Danh mục đề cử" : lang === "en" ? "Recommended Fruits" : "推荐水果"}</h2>
          <Link href={getLocalizedHref("/products", lang)} className="group flex items-center gap-1 text-xs font-bold text-primary uppercase tracking-widest">
            <span>{t.allProducts}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {remainingProducts.map((product) => {
            const localizedName = getLocalizedValue(product, "name", lang);
            const localizedCategory = getLocalizedCategoryName(product.category, lang);
            return (
              <div key={product.id} className="group flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <Link href={getLocalizedHref(`/products/${product.slug}`, lang)}>
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 border border-border">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={localizedName}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-300">{t.nongSanImagePlaceholder}</div>
                      )}
                      <span className="absolute bottom-3 left-3 rounded-full bg-white border border-border px-3 py-1 text-[9px] font-bold text-slate-600 uppercase">
                        {localizedCategory}
                      </span>
                    </div>
                  </Link>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-primary transition-colors font-serif">
                      <Link href={getLocalizedHref(`/products/${product.slug}`, lang)}>
                        {localizedName}
                      </Link>
                    </h3>
                    <div className="flex items-baseline gap-2">
                      {product.price ? (
                        <span className="text-sm font-black text-amber-600">
                          {product.price.toLocaleString("vi-VN")}{t.priceSuffix}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500">{t.contactWholesalePrice}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  href={getLocalizedHref(`/products/${product.slug}`, lang)}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 hover:text-primary transition-colors group/btn"
                >
                  <span>{lang === "vi" ? "Chi tiết" : lang === "en" ? "Details" : "详情"}</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Editorial Parallax Brand Story */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="bg-emerald-950 text-white py-24 rounded-[32px] border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,rgba(16,185,129,0.15),transparent)]"></div>
          <div className="mx-auto max-w-4xl px-6 sm:px-10 lg:px-12 text-center space-y-8 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif uppercase">{t.brandStoryTitle}</h2>
            <div className="max-w-2xl mx-auto space-y-6 text-emerald-100/80 text-sm sm:text-base leading-relaxed font-medium">
              <p>"{t.brandStoryDesc1}"</p>
              <p>"{t.brandStoryDesc2}"</p>
            </div>
            <div className="pt-4">
              <Link
                href={getLocalizedHref("/about-us", lang)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3 text-xs font-bold text-white hover:bg-white/10 transition-all uppercase tracking-widest"
              >
                <span>{t.learnMore}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Editorial Quotation Testimonials */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 font-serif uppercase tracking-wider">{t.testimonialTitle}</h2>
          <p className="text-slate-500 text-sm">{t.testimonialSubtitle}</p>
        </div>

        <TestimonialsSlider testimonials={displayTestimonials} lang={lang} layout="editorial" />
      </section>

      {/* Editorial footer CTA card */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-emerald-950 p-8 sm:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 border border-emerald-800 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_90%,rgba(16,185,129,0.15),transparent)]"></div>
          
          <div className="space-y-4 relative max-w-lg text-center md:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl font-serif uppercase leading-tight">{t.discount10Title}</h2>
            <p className="text-emerald-100/70 text-sm leading-relaxed">
              {t.discount10Desc}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-semibold text-emerald-400">
              <span className="flex items-center gap-1">{t.consultationFree}</span>
              <span className="flex items-center gap-1">{t.deliveryCod}</span>
            </div>
          </div>
          
          <div className="relative shrink-0 flex flex-col items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="w-32 h-32 bg-white rounded-xl overflow-hidden flex items-center justify-center text-slate-950 font-bold text-xs p-2 text-center">
              {settings.zalo_qr_url ? (
                <img
                  src={settings.zalo_qr_url}
                  alt="Zalo QR"
                  className="h-full w-full object-contain animate-in fade-in duration-300"
                />
              ) : (
                <span>{t.scanQrZalo}</span>
              )}
            </div>
            <a
              href={`https://zalo.me/${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-emerald-500 px-6 py-2.5 text-xs font-bold hover:scale-105 active:scale-95 transition-transform uppercase tracking-wider"
            >
              {t.openZaloNow}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
