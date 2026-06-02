import React from "react";
import { Award, CheckCircle, Snowflake, Users } from "lucide-react";
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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-20">
      {/* Page Banner */}
      <div className="relative overflow-hidden bg-emerald-950 text-white py-20 px-8 rounded-[32px] shadow-lg border border-white/5">
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
          <h1 className="text-3xl sm:text-4.5xl font-black tracking-tight text-white drop-shadow-sm">
            {t.aboutTitle}
          </h1>
          <div className="w-12 h-1 bg-emerald-500 mx-auto rounded-full"></div>
          <p className="text-emerald-200/80 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {lang === "vi" 
              ? "Hành trình đưa nông sản Vĩnh Long vươn tầm thế giới với chuẩn mực chất lượng quốc tế và truy xuất nguồn gốc minh bạch."
              : lang === "en"
              ? "The journey of bringing Vinh Long's agricultural products to the global stage with international standards and transparent traceability."
              : "以国际标准和透明追溯，推动永隆农产品走向全球市场的旅程。"}
          </p>
        </div>
      </div>

      {/* Grid Story 1: Global Mission & Traceability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-6">
          <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 inline-block">
            {lang === "vi" ? "Truy xuất số hóa" : lang === "en" ? "Digital Traceability" : "数字化追溯"}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight">
            {lang === "vi" 
              ? "Sứ Mệnh Vươn Tầm Quốc Tế & Truy Xuất Minh Bạch" 
              : lang === "en" 
              ? "Global Mission & Digital Traceability" 
              : "全球使命与数字化追溯"}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {lang === "vi"
              ? "Nông Sản Sạch Xuất Khẩu ra đời với khát vọng nâng tầm giá trị nông sản vùng đồng bằng sông Cửu Long và đưa thương hiệu Việt vươn xa trên bản đồ thế giới. Chúng tôi hiểu rằng, để chinh phục những thị trường xuất khẩu khó tính và tiềm năng lớn như Trung Quốc, EU, Mỹ, Nhật Bản và Hàn Quốc, sự minh bạch là điều kiện tiên quyết."
              : lang === "en"
              ? "Clean Agri Export was founded with the aspiration to elevate the value of Mekong Delta agricultural products and project the Vietnamese brand onto the global stage. We understand that to conquer demanding and high-potential export markets such as China, the EU, USA, Japan, and South Korea, absolute transparency is a prerequisite."
              : "清洁农产品出口的诞生，旨在提升湄公河三角洲农产品的价值，并让越南品牌在世界舞台上大放异彩。我们深知，要征服中国、欧盟、美国、日本和韩国等严苛且潜力巨大的出口市场，绝对的透明度是首要前提。"}
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            {lang === "vi"
              ? "Mỗi sản phẩm từ vùng trồng của chúng tôi đều được áp dụng hệ thống truy xuất nguồn gốc số hóa. Từ quá trình cải tạo đất, tưới tiêu, bón phân sinh học cho đến ngày thu hoạch đều được ghi chép thời gian thực qua nhật ký canh tác điện tử, giúp đối tác nhập khẩu dễ dàng kiểm tra toàn bộ lịch trình sinh trưởng qua mã QR."
              : lang === "en"
              ? "Every product from our farming zones is integrated into a digital traceability system. From soil preparation, irrigation, and organic fertilization to the day of harvesting, all parameters are recorded in real-time via electronic farming logs. This allows importing partners to easily verify the complete crop cycle using a simple QR code."
              : "我们种植区的每件产品都融入了数字化追溯系统。从土壤改良、灌溉、有机施肥到采收之日，所有参数都通过电子种植日志进行实时记录，使进口合作伙伴可以通过二维码轻松核实完整的作物生长周期。"}
          </p>
        </div>
        <div className="relative rounded-2xl overflow-hidden aspect-video shadow-md border border-slate-200 group">
          <img
            src="/about-us.jpg"
            alt="About us traceability"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* Grid Story 2: Post-Harvest Tech & Cold Chain */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative rounded-2xl overflow-hidden aspect-video shadow-md border border-slate-200 group md:order-first order-last">
          <img
            src="/about-us2.jpg"
            alt="About us cold chain"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
        </div>
        <div className="space-y-6">
          <span className="text-teal-600 font-bold text-xs uppercase tracking-widest bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 inline-block">
            {lang === "vi" ? "Logistics & Công Nghệ" : lang === "en" ? "Logistics & Tech" : "物流与技术"}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight">
            {lang === "vi" 
              ? "Công Nghệ Sau Thu Hoạch & Chuỗi Cung Ứng Lạnh" 
              : lang === "en" 
              ? "Post-Harvest Technology & Cold Chain" 
              : "收获后技术与冷链物流"}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {lang === "vi"
              ? "Để giữ trọn vẹn hương vị tươi ngon đặc trưng của trái cây nhiệt đới khi xuất khẩu chính ngạch sang Trung Quốc và các đại dương lớn, chúng tôi đã đầu tư mạnh mẽ vào hạ tầng công nghiệp sau thu hoạch. Các sản phẩm chủ lực như Sầu Riêng Ri6 Cấp Đông, Bưởi Năm Roi, Chanh Không Hạt... đều được xử lý và đóng gói tại nhà máy đạt tiêu chuẩn quốc tế HACCP và ISO 22000."
              : lang === "en"
              ? "To preserve the rich, authentic flavor of tropical fruits during official export to China and long ocean shipments worldwide, we have heavily invested in post-harvest industrial infrastructure. Key export items such as IQF frozen Ri6 durian, Nam Roi pomelos, and seedless limes are cleaned, heat-treated, and packed in facilities operating under international HACCP and ISO 22000 certifications."
              : "为了在向中国正式出口及运往全球远洋时仍能保留热带水果浓郁、正宗的风味，我们对收获后的工业基础设施进行了大力投资。我们的出口主打产品（如IQF冷冻Ri6榴莲、五鞭蜜柚和无籽青柠）均在获得国际HACCP和ISO 22000认证的工厂中进行清洗、热处理和包装。"}
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            {lang === "vi"
              ? "Bằng việc áp dụng công nghệ cấp đông nhanh IQF tiên tiến và duy trì chuỗi cung ứng lạnh (cold chain) liên tục từ khâu thu hoạch tại vườn đến container xuất khẩu, chúng tôi cam kết sản phẩm luôn giữ được độ tươi ngon, giá trị dinh dưỡng nguyên bản và đáp ứng hoàn hảo các tiêu chuẩn kiểm dịch thực vật nghiêm ngặt nhất."
              : lang === "en"
              ? "By utilizing advanced IQF quick-freezing technology and maintaining an uninterrupted cold chain from orchard harvesting directly to export shipping containers, we ensure our products retain their original freshness, high nutritional values, and fully satisfy the most stringent phytosanitary standards."
              : "通过采用先进的IQF快速冷冻技术，并维持从果园采收直接到出口集装箱的无间断冷链，我们确保产品始终保持原有的新鲜度与高营养价值，完全符合最严格的植物检疫标准。"}
          </p>
        </div>
      </div>

      {/* Strategic Pillars */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-center text-slate-800">
          {lang === "vi" ? "Trụ Cột Chất Lượng Xuất Khẩu" : lang === "en" ? "Strategic Export Pillars" : "出口品质四大支柱"}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3 text-center transition-transform hover:-translate-y-1 duration-300">
            <div className="mx-auto rounded-full bg-emerald-50 p-3 w-12 h-12 text-emerald-600 flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              {lang === "vi" ? "Tiêu Chuẩn Toàn Cầu" : lang === "en" ? "Global Standards" : "全球品质标准"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {lang === "vi"
                ? "Đạt chứng nhận VietGAP, GlobalGAP và kiểm nghiệm dư lượng hóa chất nghiêm ngặt."
                : lang === "en"
                ? "Certified under VietGAP and GlobalGAP standards with zero chemical residue tolerance."
                : "荣获 VietGAP 和 GlobalGAP 认证，严格控制农药与化学残留。"}
            </p>
          </div>
          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3 text-center transition-transform hover:-translate-y-1 duration-300">
            <div className="mx-auto rounded-full bg-emerald-50 p-3 w-12 h-12 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              {lang === "vi" ? "Truy Xuất Số Hóa" : lang === "en" ? "Digital Traceability" : "数字化追溯"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {lang === "vi"
                ? "Mã QR truy xuất nguồn gốc minh bạch hành trình từ nông trại đến cảng xuất khẩu."
                : lang === "en"
                ? "Electronic QR tracing from agricultural zones directly to international ports."
                : "电子二维码全程追溯，从种植产地直达国际集装箱港口。"}
            </p>
          </div>
          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3 text-center transition-transform hover:-translate-y-1 duration-300">
            <div className="mx-auto rounded-full bg-emerald-50 p-3 w-12 h-12 text-emerald-600 flex items-center justify-center">
              <Snowflake className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              {lang === "vi" ? "Logistics Lạnh" : lang === "en" ? "Cold Supply Chain" : "冷链物流技术"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {lang === "vi"
                ? "Quy trình cấp đông IQF và chuỗi bảo quản lạnh liên tục giữ trọn dưỡng chất."
                : lang === "en"
                ? "Advanced IQF quick-freezing and a continuous temperature-controlled supply chain."
                : "采用先进 IQF 快速冷冻及无缝温控冷链，锁住新鲜营养。"}
            </p>
          </div>
          {/* Pillar 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3 text-center transition-transform hover:-translate-y-1 duration-300">
            <div className="mx-auto rounded-full bg-emerald-50 p-3 w-12 h-12 text-emerald-600 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              {lang === "vi" ? "Hợp Tác Bền Vững" : lang === "en" ? "Sustainable Alliances" : "可持续农业合作"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {lang === "vi"
                ? "Liên kết chặt chẽ với hợp tác xã nông dân, bảo đảm sinh kế và phát triển sinh thái."
                : lang === "en"
                ? "Strong alliances with local cooperatives, protecting soil vitality and supporting livelihoods."
                : "与当地农户合作社深度联结，保护土壤活力并保障农户生计。"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
