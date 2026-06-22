import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowLeft, MessageSquare, ShieldCheck, Heart, Calendar, Phone } from "lucide-react";
import { getTranslation, getLocalizedValue, getLocalizedCategoryName, getLocalizedHref, LanguageCode } from "@/lib/i18n";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; lang: string }>;
}

async function getProductBySlug(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
  try {
    const res = await fetch(`${apiUrl}/api/products/${slug}`, { next: { revalidate: 30 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching product detail:", error);
  }
  return null;
}

const MOCKUP_PRODUCTS = [
  {
    id: 1,
    name: "Thanh Long Ruột Đỏ Đắk Lắk",
    name_en: "Dak Lak Red Dragon Fruit",
    name_zh: "得乐省红心火龙果",
    slug: "thanh-long-ruot-do-dak-lak",
    price: 35000,
    original_price: 45000,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    description: "Thanh long ruột đỏ Đắk Lắk ngọt thanh, nhiều nước, thịt quả chắc giòn. Đạt tiêu chuẩn an toàn VietGAP, giàu chất xơ và chất chống oxy hóa.",
    description_en: "Dak Lak red dragon fruit is sweet, juicy, and has firm flesh. Grown under VietGAP safety standards, rich in fiber and antioxidants.",
    description_zh: "得乐省红心火龙果，清甜多汁，果肉紧实。符合VietGAP安全标准，富含膳食纤维和抗氧化剂。",
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
    description: "Xoài cát Hòa Lộc nổi tiếng ngọt đậm đà, cùi dày ít xơ và thơm nồng. Được thu hoạch chín cây tự nhiên trên cành, không dùng hóa chất thúc chín.",
    description_en: "Hoa Loc mangoes are famous for their intense sweetness, thick flesh with minimal fiber, and rich aroma. Naturally harvested fully ripe on the tree, without any chemical ripening agents.",
    description_zh: "和禄沙芒果以其浓郁的甜度、丰厚的果肉（少丝）和馥郁的香气而闻名。树上自然熟透后采摘，不使用any化学催熟剂。",
    is_available: true,
  },
  {
    id: 3,
    name: "Nhãn Xuồng Cơm Vàng",
    name_en: "Golden Flesh Longan",
    name_zh: "金肉龙眼",
    slug: "nhan-xuong-com-vang",
    price: 60000,
    original_price: 75000,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    description: "Nhãn xuồng cơm vàng đặc sản Vũng Tàu, quả to, cơm nhãn dày màu vàng nhạt, giòn ngọt thanh khiết. Trái chín tự nhiên trên cây, giữ nguyên hương vị tự nhiên đặc trưng.",
    description_en: "Golden flesh longan has large fruit, thick pale-yellow flesh, crunchy and pure sweet taste. Naturally ripened on the tree to preserve its unique flavor.",
    description_zh: "金肉龙眼，果大，肉厚呈淡黄色，口感酥脆清甜。在树上自然熟透，保留独特的天然风味。",
    is_available: true,
  },
  {
    id: 4,
    name: "Vải Thiều Lục Ngạn Hữu Cơ",
    name_en: "Organic Luc Ngan Lychee",
    name_zh: "陆岸有机荔枝",
    slug: "vai-thieu-luc-ngan-huu-co",
    price: 50000,
    original_price: 65000,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    description: "Vải thiều Lục Ngạn chính hiệu, quả to đều, vỏ đỏ đẹp, cùi dày mọng nước, hạt nhỏ và ngọt lịm. Canh tác an toàn sinh học, không dư lượng thuốc bảo vệ thực vật.",
    description_en: "Authentic Luc Ngan lychee, large and uniform fruits, red skin, thick and juicy flesh, small seeds, and honey-like sweetness. Cultivated with biosecurity, no pesticide residues.",
    description_zh: "正宗陆岸荔枝，果大均匀，皮红美观，肉厚多汁，核小甜如蜜。采用生物安全种植，无农药残留。",
    is_available: true,
  },
  {
    id: 5,
    name: "Chuối Laba Lâm Đồng",
    name_en: "Lam Dong Laba Banana",
    name_zh: "林同拉巴香蕉",
    slug: "chuoi-laba-lam-dong",
    price: 25000,
    original_price: 30000,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    description: "Chuối Laba Lâm Đồng nổi tiếng dẻo thơm, vị ngọt đậm đà đặc trưng. Chuối chín tự nhiên, không ngâm hóa chất, giàu kali và vitamin tốt cho sức khỏe.",
    description_en: "Lam Dong Laba banana is famous for its chewy texture, unique rich sweetness. Naturally ripened, no chemical soaking, rich in potassium and healthy vitamins.",
    description_zh: "林同拉巴香蕉，以其软糯芳香、独特的浓郁甜度而闻名。自然熟透，不浸泡化学药剂，富含钾 和 有益健康的维生素。",
    is_available: true,
  },
  {
    id: 6,
    name: "Dưa Hấu Không Hạt Long An",
    name_en: "Long An Seedless Watermelon",
    name_zh: "隆安无籽西瓜",
    slug: "dua-hau-khong-hat-long-an",
    price: 22000,
    original_price: 28000,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    description: "Dưa hấu không hạt ngọt lịm, đỏ mọng nước, vỏ mỏng bền. Đạt tiêu chuẩn VietGAP, là thức quả giải nhiệt lý tưởng cho những ngày hè nắng nóng.",
    description_en: "Seedless watermelon is sweet, deep red, juicy, and has thin skin. Complies with VietGAP standards, making it the ideal refreshing fruit for hot summer days.",
    description_zh: "无籽西瓜，甜度高，红润多汁，皮薄。符合VietGAP标准，是炎热夏日理想的消暑水果。",
    is_available: true,
  },
  {
    id: 7,
    name: "Chôm Chôm Nhãn Bến Tre",
    name_en: "Ben Tre Rambutan",
    name_zh: "槟知红毛丹",
    slug: "chom-chom-nhan-ben-tre",
    price: 45000,
    original_price: 55000,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    description: "Chôm chôm nhãn đặc sản Bến Tre tróc hạt, cùi giòn, vị ngọt thanh mát đặc trưng. Trái hái trong ngày tại vườn, giữ nguyên độ tươi mới.",
    description_en: "Ben Tre rambutan is easy to peel, crunchy, and has a refreshing sweet taste. Harvested daily from the orchard to ensure maximum freshness.",
    description_zh: "槟知特产红毛丹，易剥壳，肉质酥脆，具有独特的清甜口感。当天从果园采摘，保持原汁原味的新鲜度。",
    is_available: true,
  },
  {
    id: 8,
    name: "Mít Thái Viên Linh Đắk Lắk",
    name_en: "Dak Lak Thai Jackfruit",
    name_zh: "得乐省泰国菠萝蜜",
    slug: "mit-thai-vien-linh-dak-lak",
    price: 38000,
    original_price: 48000,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    description: "Mít Thái cơm vàng rơm, múi dày, giòn và ngọt lịm. Đậm đà hương vị núi rừng Tây Nguyên, đóng khay sạch sẽ hoặc nguyên quả tiện lợi.",
    description_en: "Thai jackfruit with straw-yellow flesh, thick, crunchy and sweet segments. Full of Central Highlands flavor, available in clean pre-packaged trays or whole fruit.",
    description_zh: "泰国菠萝蜜，果肉呈金黄色，肉厚、酥脆且甜美。充满西原山林风味，提供干净的盒装或整只购买。",
    is_available: true,
  },
  {
    id: 9,
    name: "Măng Cụt Lái Thiêu Loại 1",
    name_en: "Lai Thieu Mangosteen (Grade 1)",
    name_zh: "莱眺特级山竹 (1级)",
    slug: "mang-cut-lai-thieu-loai-1",
    price: 95000,
    original_price: 120000,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    description: "Măng cụt Lái Thiêu vỏ mỏng, múi trắng muốt, vị chua ngọt hài hòa tinh tế. Được thu hoạch thủ công cẩn thận, không làm dập quả.",
    description_en: "Lai Thieu mangosteen with thin skin, snow-white segments, and a delicate sweet-and-sour flavor. Carefully hand-harvested to prevent bruising.",
    description_zh: "莱眺山竹，皮薄，果肉雪白，酸甜适口，口感细腻。手工精心采收，避免果实受损。",
    is_available: true,
  },
  {
    id: 10,
    name: "Thạch Đen Tràng Định Lạng Sơn",
    name_en: "Lang Son Grass Jelly",
    name_zh: "谅山省石门黑凉粉",
    slug: "thach-den-trang-dinh-lang-son",
    price: 30000,
    original_price: 35000,
    category: "Nông sản chế biến & Đông lạnh",
    category_en: "Processed & Frozen Products",
    category_zh: "加工与冷冻农产品",
    description: "Thạch đen được chế biến từ cây sương sáo tự nhiên của vùng Tràng Định, Lạng Sơn. Thạch giòn dai, thanh mát, là món ăn giải nhiệt tuyệt hảo.",
    description_en: "Grass jelly processed from natural mesona plants in Trang Dinh, Lang Son. Chewy, crunchy and cooling, it is an excellent dessert to beat the heat.",
    description_zh: "谅山省石门黑凉粉，采用当地天然仙草（凉粉草）制成。口感Q弹清爽，是极佳的消暑甜品。",
    is_available: true,
  },
  {
    id: 11,
    name: "Sầu Riêng Ri6 Đắk Lắk",
    name_en: "Dak Lak Ri6 Durian",
    name_zh: "得乐省Ri6榴莲",
    slug: "sau-rieng-ri6-dak-lak",
    price: 150000,
    original_price: 180000,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    description: "Sầu riêng Ri6 cơm vàng hạt lép, thơm ngon béo ngậy, ngọt đậm đà. Hái già chín tự nhiên, không nhúng thuốc, cơm sầu riêng dày mịn không sượng bột.",
    description_en: "Ri6 durian with thick yellow flesh, small seeds, rich aroma, and deep sweetness. Harvested at peak maturity, chemical-free, smooth and creamy texture.",
    description_zh: "得乐省Ri6榴莲，果肉金黄，核小，香气浓郁，甜度高。成熟度佳时采摘，无化学处理，果肉厚实细腻。",
    is_available: true,
  },
  {
    id: 12,
    name: "Chanh Dây Tươi Đắk Lắk",
    name_en: "Fresh Dak Lak Passion Fruit",
    name_zh: "得乐省新鲜百香果",
    slug: "chanh-day-tuoi-dak-lak",
    price: 30000,
    original_price: 40000,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    description: "Chanh dây tươi quả mọng, nhiều dịch, vị chua thanh thơm ngát đặc trưng. Giàu vitamin C, lý tưởng để pha chế nước uống giải nhiệt hoặc làm nước sốt.",
    description_en: "Fresh passion fruit, juicy pulp with a characteristic refreshing tartness and rich aroma. Rich in vitamin C, perfect for drinks or culinary sauces.",
    description_zh: "得乐省新鲜百香果，果实饱满，汁多，具有独特的清酸香气。富含维生素C，非常适合调制消暑饮品或制作酱汁。",
    is_available: true,
  },
  {
    id: 13,
    name: "Khoai Lang Mật Đắk Lắk",
    name_en: "Dak Lak Sweet Honey Potatoes",
    name_zh: "得乐省蜜汁红薯",
    slug: "khoai-lang-mat-dak-lak",
    price: 25000,
    original_price: 35000,
    category: "Rau củ & Gia vị",
    category_en: "Vegetables & Spices",
    category_zh: "蔬菜与香料",
    description: "Khoai lang mật Đắk Lắk được trồng trên vùng đất bazan màu mỡ. Khi nướng hoặc luộc, khoai chảy mật ngọt lịm, dẻo thơm, giàu chất xơ tốt cho tiêu hóa.",
    description_en: "Dak Lak sweet honey potatoes grown in fertile basalt soil. When roasted or boiled, they release a sweet, honey-like syrup, soft texture, rich in dietary fiber.",
    description_zh: "得乐省蜜汁红薯，种植于肥沃的红土高原。烤或煮时会流出 như 蜜般的糖汁，软糯香甜，富含膳食纤维，有益消化。",
    is_available: true,
  },
  {
    id: 14,
    name: "Dừa Xiêm Xanh Bến Tre",
    name_en: "Ben Tre Fresh Green Coconut",
    name_zh: "槟知新鲜青椰",
    slug: "dua-xiem-xanh-ben-tre",
    price: 18000,
    original_price: 22000,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    description: "Dừa xiêm xanh đặc sản Bến Tre gọt trọc tiện lợi. Nước dừa ngọt thanh mát tự nhiên, cơm dừa non dẻo mềm, chứa nhiều khoáng chất bù nước hiệu quả.",
    description_en: "Ben Tre green coconut, conveniently shaved. The coconut water is naturally sweet and refreshing, with soft tender flesh, rich in hydrating minerals.",
    description_zh: "槟知新鲜青椰，去皮便于饮用。椰子水清甜消暑，椰肉鲜嫩软糯，富含矿物质，能有效补充身体水分。",
    is_available: true,
  },
  {
    id: 15,
    name: "Ớt Chỉ Thiên Cay Nồng",
    name_en: "Spicy Bird's Eye Chili",
    name_zh: "Xin辣朝天椒",
    slug: "ot-chi-thien-cay-nong",
    price: 20000,
    original_price: 25000,
    category: "Rau củ & Gia vị",
    category_en: "Vegetables & Spices",
    category_zh: "蔬菜与香料",
    description: "Ớt chỉ thiên được thu hoạch chín đỏ tươi tại vườn, vị cay nồng đặc trưng, quả giòn ráo nước. Gia vị không thể thiếu trong mỗi bữa ăn gia đình Việt.",
    description_en: "Bird's eye chili harvested ripe and bright red from the garden, featuring a characteristic intense heat and crunchy texture. A must-have spice in Vietnamese meals.",
    description_zh: "新鲜采收的红色朝天椒，辣度十足，果实清脆。是越南家庭餐桌上不可或缺的辛辣调味品。",
    is_available: true,
  },
  {
    id: 16,
    name: "Sầu Riêng Ri6 Cấp Đông Xuất Khẩu",
    name_en: "Export-Quality Frozen Ri6 Durian",
    name_zh: "出口级冷冻Ri6榴莲",
    slug: "sau-rieng-ri6-cap-dong-xuat-khau",
    price: 180000,
    original_price: 220000,
    category: "Nông sản chế biến & Đông lạnh",
    category_en: "Processed & Frozen Products",
    category_zh: "加工与冷冻农产品",
    description: "Sầu riêng Ri6 được bóc múi chọn lọc từ những quả chín cây tự nhiên, cấp đông nhanh siêu tốc để giữ trọn vẹn hương vị béo ngậy và dinh dưỡng.",
    description_en: "Ri6 durian flesh selected from tree-ripened fruits, quick-frozen immediately to preserve all of its rich flavor and nutritional value.",
    description_zh: "精选树上熟的Ri6榴莲果肉，采用超快速冷冻技术，完美锁住其浓郁的奶香与营养成分。",
    is_available: true,
  }
];

async function getSettings() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
  try {
    const res = await fetch(`${apiUrl}/api/settings`, { next: { revalidate: 10 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching settings in product detail page:", error);
  }
  return { phone_number: "0901234567" };
}

const formatPhone = (phoneStr: string) => {
  if (phoneStr.length === 10) {
    return `${phoneStr.slice(0, 4)} ${phoneStr.slice(4, 7)} ${phoneStr.slice(7)}`;
  }
  return phoneStr;
};

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const lang = (resolvedParams.lang || "vi") as LanguageCode;
  
  let product = await getProductBySlug(slug);
  
  // Fallback to mockup if not found in API
  if (!product) {
    product = MOCKUP_PRODUCTS.find((p) => p.slug === slug) || null;
  }
  
  if (!product) {
    notFound();
  }
  
  const settings = await getSettings();
  const phone = settings.phone_number || "0901234567";
  const t = getTranslation(lang);

  const localizedName = getLocalizedValue(product, "name", lang);
  const localizedCategory = getLocalizedCategoryName(product.category, lang);
  const localizedDescription = getLocalizedValue(product, "description", lang);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Back navigation */}
      <div>
        <Link href={getLocalizedHref("/products", lang)} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>{t.backToProducts}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start bg-white p-6 sm:p-8 rounded-3xl border border-border">
        {/* Product Image Section */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700/40 border border-border">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={localizedName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-bold text-lg">{t.nongSanImagePlaceholder}</span>
          )}
          <span className="absolute top-4 left-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            {localizedCategory}
          </span>
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
              {localizedName}
            </h1>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                product.is_available ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}>
                {product.is_available 
                  ? (lang === "vi" ? "Còn hàng - Mới thu hoạch" : lang === "en" ? "In stock - Freshly harvested" : "有现货 - 新鲜采收")
                  : (lang === "vi" ? "Hết mùa / Đang đợi thu hoạch" : lang === "en" ? "Out of season / Awaiting harvest" : "缺货中 / 等待采收")
                }
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 border-y border-slate-100 py-4">
            {product.price ? (
              <>
                <span className="text-3xl font-extrabold text-amber-600">
                  {product.price.toLocaleString("vi-VN")}{t.priceSuffix}
                </span>
                {product.original_price && (
                  <span className="text-sm text-slate-400 line-through">
                    {product.original_price.toLocaleString("vi-VN")}{t.originalPriceSuffix}
                  </span>
                )}
              </>
            ) : (
              <span className="text-lg font-bold text-slate-500">{t.contactWholesalePrice}</span>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">{lang === "vi" ? "Mô tả sản phẩm:" : lang === "en" ? "Product Description:" : "产品描述:"}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {localizedDescription || (lang === "vi" 
                ? "Sản phẩm được trồng tự nhiên, chọn lọc tay kỹ lưỡng để đảm bảo quả ngon và tươi nhất khi tới tay quý khách."
                : lang === "en"
                ? "Grown naturally and meticulously hand-picked to guarantee the most delicious and freshest fruits reach your hand."
                : "自然种植并经过精心手工挑选，以确保送达您手中的水果最新鲜美味。")}
            </p>
          </div>

          {/* Trust points card */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{t.vietgapTitle}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Heart className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{lang === "vi" ? "Không chất bảo quản" : lang === "en" ? "No preservatives" : "无防腐剂"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{lang === "vi" ? "Hái tươi trực tiếp" : lang === "en" ? "Freshly picked" : "产地新鲜直采"}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a
              href={`tel:${phone}`}
              className="flex-1 rounded-full border border-emerald-600 bg-emerald-600 text-white px-8 py-4 text-center text-base font-semibold hover:bg-emerald-500 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Phone className="h-5 w-5 animate-pulse" />
              <span>{t.callNow}: {formatPhone(phone)}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
