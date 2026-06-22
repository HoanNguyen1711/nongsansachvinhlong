import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";
import { getTranslation, getLocalizedValue, getLocalizedHref, LanguageCode } from "@/lib/i18n";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; lang: string }>;
}

async function getBlogBySlug(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
  try {
    const res = await fetch(`${apiUrl}/api/blogs/${slug}`, { next: { revalidate: 30 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching blog detail:", error);
  }
  return null;
}

const MOCKUP_BLOGS = [
  {
    id: 1,
    title: "Cách Chọn Bơ Sáp Đắk Lắk Dẻo Béo, Không Sượng Bột",
    title_en: "How to Choose Rich, Buttery Dak Lak Avocados Without Bitterness",
    title_zh: "如何挑选软糯浓郁且不发苦的得乐省牛油果",
    slug: "cach-chon-bo-sap-dak-lak-deo-beo-khong-suong-bot",
    summary: "Bơ sáp là loại trái cây bổ dưỡng nhưng rất dễ mua nhầm quả sượng, đắng. Khám phá 5 bí quyết vàng từ nhà nông Đắk Lắk giúp bạn luôn lựa chọn được quả bơ ngon nhất.",
    summary_en: "Avocado is a highly nutritious fruit but it is easy to accidentally buy watery or bitter ones. Explore 5 golden tips from Dak Lak farmers to help you always select the best avocado.",
    summary_zh: "牛油果营养丰富，但很容易买到水汪汪或发苦的果实。探索得乐省果农分享的5个黄金秘诀，帮助您挑选出最完美的牛油果。",
    content: `Quả bơ sáp Đắk Lắk từ lâu đã nổi tiếng khắp cả nước vì hương vị béo ngậy đặc trưng, cơm vàng dẻo quánh ít xơ. Tuy nhiên, do tính chất thu hoạch tự nhiên theo mùa và quá trình chín hơi nhạy cảm, rất nhiều người mua thường chọn nhầm bơ non, bơ chín ép bị sượng bột hoặc có vị đắng ngắt.
    
    Hôm nay, Nông Sản Sạch xin chia sẻ 5 mẹo nhỏ được truyền miệng từ những bác nông dân giàu kinh nghiệm trực tiếp làm vườn tại Đắk Lắk giúp bạn luôn chốt được những quả bơ hoàn hảo nhất:
    
    ### 1. Quan sát vỏ quả bơ
    Thông thường, những quả bơ có vỏ màu xanh đốm vàng lấm tấm sẽ có tỷ lệ sáp cao hơn. Khi bơ chín, da sẽ hơi căng bóng nhưng vẫn sần sùi nhẹ. Đừng chọn những quả vỏ xanh bóng bẩy vì đó là bơ non chín ép, ăn sẽ nhạt và dễ đắng.
    
    ### 2. Cuống bơ nói lên điều gì?
    Hãy nhìn vào lõm cuống bơ. Nếu cuống bơ to, hơi tươi xanh thì đó là bơ mới hái chưa chín kỹ. Nếu cuống đã héo, rụng tự nhiên tạo ra một hõm nhỏ màu vàng nhạt thì đó là bơ chín già tự nhiên ăn sẽ vô cùng ngon. Ngược lại, nếu hõm cuống màu sẫm đen thì bơ có thể đã quá chín hoặc bị thối từ trong đầu xuống.
    
    ### 3. Cảm giác khi cầm và nắn quả bơ
    Cảm giác cầm quả bơ chắc tay. Nắn nhẹ xung quanh vỏ, nếu thấy mềm đều, có độ đàn hồi nhẹ thì bơ đã chín vừa ăn. Tránh nắn quá mạnh gây dập hoặc mua quả bị mềm nhũn cục bộ vì đó là bơ dập do va đập trong quá trình vận chuyển.
    
    ### 4. Chọn dáng bơ thon dài hay tròn?
    Mẹo từ nhà vườn: Những quả bơ dáng thon dài thường có hạt nhỏ hơn, cơm dày và dẻo hơn ở phần cổ quả. Bơ quả tròn hạt thường to hơn, tuy nhiên phần thịt bơ xung quanh hạt lại béo đậm đà hơn. Bạn có thể chọn tùy sở thích.
    
    ### 5. Tiếng lắc kêu hạt bơ
    Khi lắc nhẹ quả bơ chín già sát tai, bạn sẽ nghe thấy tiếng lộc cộc nhỏ của hạt bơ bên trong va vào thành cùi. Lúc này hạt bơ đã tách khỏi cùi do quả chín già. Tuy nhiên, nếu tiếng kêu quá to thì cùi bơ có thể mỏng, hạt to. Chỉ chọn quả kêu khẽ nhẹ là chuẩn nhất.`,
    content_en: `Dak Lak avocados have long been famous throughout the country for their distinct rich flavor and seed-free, buttery yellow flesh with minimal fiber. However, due to seasonal harvesting and delicate ripening, many buyers accidentally choose young or forced avocados that are watery or bitter.
    
    Today, Nong San Sach shares 5 tips directly from experienced farmers in Dak Lak to help you choose the perfect avocado every time:
    
    ### 1. Observe the skin
    Usually, avocados with green skin dotted with small yellow spots are richer. As they ripen, the skin becomes slightly glossy but remains bumpy. Avoid smooth green skins, as they are unripe and easily bitter.
    
    ### 2. What does the stem pocket tell you?
    Look at the stem. If it's large and green, it's freshly picked and not ripe. If it's dry and fallen naturally leaving a yellowish indentation, it's naturally ripened. Conversely, a dark brown pocket indicates it's overripe or rotting.
    
    ### 3. Squeeze gently
    The avocado should feel heavy in your hand. Squeeze gently; if it yields slightly and evenly, it is ready to eat. Avoid hard spots or locally mushy spots caused by transport damage.
    
    ### 4. Long shape vs Round shape
    Farmer's tip: Long avocados tend to have smaller seeds and thicker, more buttery flesh at the neck. Round ones have larger seeds, but the flesh around the seed is exceptionally rich. Choose based on your preference.
    
    ### 5. Shake test
    Shake the ripe avocado near your ear. You should hear a faint rattling sound, indicating the seed has separated from the flesh as it ripened. If it rattles loudly, the seed is huge and flesh is thin. A faint rattle is perfect.`,
    content_zh: `得乐省的牛油果因其浓郁奶香、金黄软糯的果肉（少丝）而闻名全国。然而，由于自然收获的季节性和对催熟过程的敏感性，许多顾客容易买到没熟透、催熟的或发苦的水质牛油果。
    
    今天，Nông Sản Sạch为您分享来自得乐省资深果农亲传的5个挑选诀窍：
    
    ### 1. 观察牛油果的表皮
    通常表皮呈绿中带黄、满是斑点的牛油果油脂含量更高。成熟时，果皮会微微发亮但仍带有些许粗糙感。不要挑选过于光滑的绿皮牛油果，那通常是未熟采摘，容易发涩发苦。
    
    ### 2. 观察果蒂状况
    看一看凹陷的果蒂。如果果蒂大而呈青绿色，说明刚摘不久尚未成熟。如果果蒂已自然干枯脱落，呈现淡黄色的小凹槽，则是自然成熟的高品质果实。反之，如果凹槽发黑，则代表熟过头或已开始变质。
    
    ### 3. 手感与捏压感
    拿在手里应当有沉甸甸的扎实感。轻轻捏压表皮，如果感觉整体微软且有弹性，则是最佳食用期。避免购买有局部凹陷或极度软烂的果实，这往往是运输途中的碰伤。
    
    ### 4. 选择细长型还是圆润型？
    果农经验：细长型的牛油果通常果核较小，靠近果蒂部分的果肉也更为厚实软糯。圆润型的果核稍大，但靠近果核的果肉奶香味更浓。可按喜好选择。
    
    ### 5. 摇晃听声
    将成熟的牛油果贴在耳边轻轻摇晃。如果听到里面果核与果肉碰撞的微弱沙沙声，说明果实成熟度很高。如果声音过大，可能果核大而果肉薄。听到轻微响声为最佳。`,
    created_at: "2024-05-20T10:00:00Z",
    image_url: null,
  },
  {
    id: 2,
    title: "Quy Trình Canh Tác Mắc Ca Đạt Chuẩn VietGAP Tại Vườn",
    title_en: "VietGAP Standard Macadamia Cultivation Process in the Orchard",
    title_zh: "果园中符合VietGAP标准的夏威夷果种植流程",
    slug: "quy-trinh-canh-tac-mac-ca-dat-chuan-vietgap-tai-vuon",
    summary: "Đằng sau những hạt mắc ca giòn bùi, giàu dinh dưỡng là cả một quy trình chăm bón nghiêm ngặt từ bón phân hữu cơ đến kỹ thuật thu hoạch và sấy gió tự nhiên bảo đảm an toàn vệ sinh.",
    summary_en: "Behind the crunchy, rich, and nutrient-dense macadamia nuts is a strict cultivation process, from applying organic fertilizers to natural wind-drying and harvesting techniques ensuring food safety.",
    summary_zh: "香脆、营养丰富的夏威夷果背后，是一套严格的种植和加工流程：从施用有机肥，到自然风干以及确保食品安全的采收技术。",
    content: `Để sản xuất ra hạt mắc ca đạt chuẩn xuất khẩu chất lượng cao, nông trại của chúng tôi tuân thủ nghiêm ngặt theo quy chuẩn nông nghiệp VietGAP:
    
    ### 1. Lựa chọn vùng đất và giống gieo trồng
    Vùng đất đỏ bazan Đắk Lắk có độ cao và khí hậu vô cùng ưu đãi cho cây mắc ca. Chúng tôi chọn lọc giống đầu dòng có xuất xứ rõ ràng, chống chịu sâu bệnh tốt.
    
    ### 2. Quá trình bón phân hữu cơ và tưới tiêu sinh học
    Nông trại ưu tiên sử dụng phân chuồng ủ hoai mục bằng chế phẩm sinh học Trichoderma và phân xanh tự nhiên. Nguồn nước tưới được lấy từ mạch nước ngầm tinh khiết, kiểm định định kỳ không nhiễm kim loại nặng.
    
    ### 3. Thu hoạch đúng độ chín tự nhiên
    Quả mắc ca được thu hoạch hoàn toàn bằng tay khi vỏ quả chuyển sang màu xanh đậm ngả nâu và tự rụng nhẹ khi có gió thổi. Chúng tôi không bao giờ dùng sào rung ép cây rụng quả non.
    
    ### 4. Quy trình sấy gió tự nhiên tách vỏ
    Sau khi hái, quả được làm sạch lớp vỏ xanh ngoài lập tức. Sau đó hạt được rải đều trên sàn lưới gỗ cách đất, thổi gió liên tục trong 15-20 ngày để độ ẩm hạt giảm dần tự nhiên. Quy trình này bảo toàn nguyên vẹn hàm lượng dầu omega-3, omega-6 cực tốt cho sức khỏe có trong nhân mắc ca.`,
    content_en: `To produce export-standard high-quality macadamia nuts, our farm strictly follows VietGAP agricultural regulations:
    
    ### 1. Land and cultivar selection
    The basalt soils of Dak Lak have excellent elevation and climate conditions for macadamias. We select certified source trees with clean lineage and high disease resistance.
    
    ### 2. Organic fertilization and biological irrigation
    We prioritize decomposed manure using Trichoderma biological agent and natural green manure. Irrigation water is drawn from pure underground aquifers and tested periodically for heavy metals.
    
    ### 3. Harvesting at natural maturity
    Macadamia fruits are harvested entirely by hand when the green husk turns dark brown and falls off easily with wind. We never shake the trees to force immature harvest.
    
    ### 4. Natural wind-drying process
    After harvesting, the outer green husk is removed immediately. The nuts are then laid flat on wooden wire racks raised off the ground, with continuous ventilation for 15-20 days. This process preserves the healthy Omega-3 and Omega-6 content in the macadamia kernels.`,
    content_zh: `为了生产出符合出口标准的高品质夏威夷果，我们农场严格遵守VietGAP农业规范：
    
    ### 1. 土地与优良品种的选择
    得乐省的红土地拥有极佳的海拔和气候条件，极适合种植夏威夷果。我们筛选来源清晰、抗病性强的母树优良品种。
    
    ### 2. 有机施肥与生态灌溉
    农场优先使用由哈茨木霉生物制剂发酵的熟化农家肥及天然绿肥。灌溉水源来自纯净的地下水脉，定期检测，无重金属残留。
    
    ### 3. 坚持自然成熟采收
    当外壳由绿变深褐并在微风下自然脱落时，我们完全通过人工采摘。我们绝不使用敲击树干等暴力手段强行采摘青果。
    
    ### 4. 独特的自然风干流程
    采摘后立即剥离外部青皮。随后将坚果平铺于离地的木质网架上，进行15-20天不间断风干。这套流程完好保留了坚果中对健康极为有益的Omega-3及Omega-6脂肪酸。`,
    created_at: "2024-05-18T08:30:00Z",
    image_url: null,
  }
];

export default async function BlogDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  let blog = await getBlogBySlug(slug);
  
  // Fallback to mockup if not found in API
  if (!blog) {
    blog = MOCKUP_BLOGS.find((b) => b.slug === slug) || null;
  }
  
  if (!blog) {
    notFound();
  }

  const lang = (resolvedParams.lang || "vi") as LanguageCode;
  const t = getTranslation(lang);

  const localizedTitle = getLocalizedValue(blog, "title", lang);
  const localizedSummary = getLocalizedValue(blog, "summary", lang);
  const localizedContent = getLocalizedValue(blog, "content", lang);

  const formatBlogDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (lang === "vi") {
        return date.toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } else if (lang === "en") {
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } else {
        return date.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <article className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      {/* Navigation */}
      <div>
        <Link href={getLocalizedHref("/stories", lang)} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>{t.backToStories}</span>
        </Link>
      </div>

      {/* Blog Card */}
      <div className="bg-white border border-border rounded-3xl p-6 sm:p-10 space-y-8">
        {/* Title and Date */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="h-4 w-4" />
            <span>
              {formatBlogDate(blog.created_at)}
            </span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300"></span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
              blog.tag_color === "blue" ? "bg-blue-50 text-blue-700 border-blue-100" :
              blog.tag_color === "amber" ? "bg-amber-50 text-amber-700 border-amber-100" :
              blog.tag_color === "rose" ? "bg-rose-50 text-rose-700 border-rose-100" :
              blog.tag_color === "purple" ? "bg-purple-50 text-purple-700 border-purple-100" :
              blog.tag_color === "slate" ? "bg-slate-50 text-slate-700 border-slate-100" :
              "bg-emerald-50 text-emerald-700 border-emerald-100"
            }`}>
              {getLocalizedValue(blog, "tag", lang) || (lang === "vi" ? "Kinh nghiệm làm nông" : lang === "en" ? "Farmer's Experience" : "农人经验")}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
            {localizedTitle}
          </h1>
          {localizedSummary && (
            <p className="text-slate-500 text-sm italic border-l-4 border-emerald-600 pl-4">
              {localizedSummary}
            </p>
          )}
        </div>

        {/* Cover Image Placeholder */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700/40 border border-border">
          {blog.image_url ? (
            <img
              src={blog.image_url}
              alt={localizedTitle}
              className="h-full w-full object-cover"
            />
          ) : (
            <BookOpen className="h-16 w-16 text-emerald-600/20" />
          )}
        </div>

        {/* Content Body - Render Rich Text HTML */}
        <div 
          className="blog-rich-content text-slate-600 text-sm sm:text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: localizedContent }}
        />
      </div>
    </article>
  );
}
