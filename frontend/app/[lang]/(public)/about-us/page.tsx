import React from "react";
import { Leaf, Award, Heart, Shield } from "lucide-react";
import { getTranslation, LanguageCode } from "@/lib/i18n";

export const dynamic = "force-dynamic";

async function getSettings() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
  try {
    const res = await fetch(`${apiUrl}/api/settings`, { next: { revalidate: 10 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching settings in about us page:", error);
  }
  return {};
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const [settings, resolvedParams] = await Promise.all([
    getSettings(),
    params
  ]);
  const lang = (resolvedParams.lang || "vi") as LanguageCode;
  const t = getTranslation(lang);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* Page Banner */}
      <div className="relative overflow-hidden bg-emerald-950 text-white py-16 px-8 rounded-[32px] shadow-lg border border-white/5">
        {/* Background Image */}
        <img 
          src="/banner_about.png" 
          alt="About Us Banner" 
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-20 z-0"
        />
        {/* Soft background glow overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.12),transparent)] z-10 pointer-events-none"></div>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

        <div className="relative z-20 text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
            {t.aboutTitle}
          </h1>
          <div className="w-12 h-1 bg-emerald-500 mx-auto rounded-full"></div>
          <p className="text-emerald-200/80 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            {lang === "vi" 
              ? "Khám phá hành trình xây dựng vùng nông sản sạch, bền vững và đầy nhiệt huyết tại Vĩnh Long."
              : lang === "en"
              ? "Discover our journey of building a clean, sustainable, and passionate agricultural region in Vinh Long."
              : "探索我们在永隆省建立绿色、可持续且充满激情的农产品基地的旅程。"}
          </p>
        </div>
      </div>

      {/* Grid Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white p-8 rounded-3xl border border-border">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {lang === "vi" ? "Từ Vườn Nhà Đến Bàn Ăn Của Bạn" : lang === "en" ? "From Our Garden to Your Table" : "从自家果园直达您的餐桌"}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {lang === "vi"
              ? "Nông Sản Sạch được sáng lập bởi một nhóm những kỹ sư trẻ đầy nhiệt huyết và các hộ nông dân bản địa tại Vĩnh Long. Với tình yêu mãnh liệt dành cho thổ nhưỡng phù sa sông nước miền Tây, chúng tôi cam kết mang đến những sản phẩm tự nhiên tinh khiết nhất."
              : lang === "en"
              ? "Nong San Sach was founded by a group of passionate young engineers and native farmers in Vinh Long. With a deep love for the rich alluvial soil of the Mekong Delta, we commit to bringing the purest natural products."
              : "Nong San Sach是由永隆省一群充满热情的年轻工程师和当地果农共同创立的。怀着对西部水乡冲积平原的挚爱，我们承诺带来最纯净的天然农产品。"}
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            {lang === "vi"
              ? "Chúng tôi hiểu rằng sức khỏe của bạn và gia đình bắt nguồn từ nguồn thức ăn nạp vào mỗi ngày. Do đó, quy trình trồng trọt từ làm đất, tưới tiêu đến bảo vệ thực vật đều tuân thủ 100% nguyên tắc an toàn, không sử dụng chất kích thích hay thuốc bảo vệ thực vật độc hại nằm ngoài danh mục cho phép."
              : lang === "en"
              ? "We understand that the health of you and your family begins with the food consumed daily. Therefore, our cultivation process—from soil preparation and irrigation to plant protection—complies 100% with safety principles, strictly avoiding growth stimulants or unauthorized toxic pesticides."
              : "我们深知，您与家人的健康始于每日摄入的食物。因此，从整地、灌溉到植物保护的整个种植过程均100%遵守安全准则，绝不使用任何生长激素或禁用化学农药。"}
          </p>
        </div>
        <div className="relative rounded-2xl overflow-hidden aspect-video flex items-center justify-center border border-border bg-emerald-50 text-emerald-800/40 font-bold">
          {settings.farm_image_url ? (
            <img
              src={settings.farm_image_url}
              alt="Nông trại Vĩnh Long"
              className="h-full w-full object-cover"
            />
          ) : (
            <span>
              {lang === "vi" 
                ? "[Ảnh Nông Trại Vĩnh Long Nhìn Từ Trên Cao]" 
                : lang === "en" 
                ? "[Aerial Photo of Vinh Long Farm]" 
                : "[永隆省果园航拍图]"}
            </span>
          )}
        </div>
      </div>

      {/* Values grid */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-center text-slate-800">
          {lang === "vi" ? "Giá Trị Cốt Lõi" : lang === "en" ? "Core Values" : "核心价值"}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <div className="bg-white rounded-2xl p-6 border border-border space-y-3 text-center">
            <div className="mx-auto rounded-full bg-emerald-50 p-3 w-12 h-12 text-primary flex items-center justify-center">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              {lang === "vi" ? "Trồng Tự Nhiên" : lang === "en" ? "Natural Growing" : "自然种植"}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === "vi"
                ? "Canh tác hữu cơ, gìn giữ độ màu mỡ tự nhiên của đất trồng bazan."
                : lang === "en"
                ? "Organic cultivation, preserving the natural fertility of the basalt soil."
                : "采用有机耕作，保留红土本源的自然肥力。"}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-border space-y-3 text-center">
            <div className="mx-auto rounded-full bg-emerald-50 p-3 w-12 h-12 text-primary flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">{t.vietgapTitle}</h3>
            <p className="text-xs text-slate-500">
              {lang === "vi"
                ? "Kiểm tra nghiêm ngặt dư lượng thuốc trừ sâu và vi sinh vật gây hại."
                : lang === "en"
                ? "Strict inspection of pesticide residues and harmful microorganisms."
                : "严格检测农药残留和有害微生物。"}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-border space-y-3 text-center">
            <div className="mx-auto rounded-full bg-emerald-50 p-3 w-12 h-12 text-primary flex items-center justify-center">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              {lang === "vi" ? "Chân Thành" : lang === "en" ? "Sincerity" : "真诚服务"}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === "vi"
                ? "Kết nối trực tiếp khách hàng với nhà vườn, bán giá trị thực của sản phẩm."
                : lang === "en"
                ? "Connecting customers directly to orchards, selling the true value of products."
                : "连接客户与产地，传递产品的真实价值。"}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-border space-y-3 text-center">
            <div className="mx-auto rounded-full bg-emerald-50 p-3 w-12 h-12 text-primary flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              {lang === "vi" ? "Cam Kết" : lang === "en" ? "Commitment" : "品质承诺"}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === "vi"
                ? "Sẵn sàng đền bù, đổi hàng nếu sản phẩm giao đến tay không đạt chất lượng."
                : lang === "en"
                ? "Ready to compensate or exchange if the delivered product does not meet quality."
                : "若送达的产品不符合品质标准，支持退换或退款。"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
