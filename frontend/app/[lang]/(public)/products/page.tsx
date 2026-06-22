import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { MessageSquare, Eye } from "lucide-react";
import { getTranslation, getLocalizedValue, getLocalizedCategoryName, getLocalizedHref, LanguageCode } from "@/lib/i18n";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ category?: string }>;
}

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

interface Category {
  id: number;
  name: string;
  name_en?: string;
  name_zh?: string;
  slug: string;
}

async function getProducts(category?: string): Promise<Product[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
  try {
    let url = `${apiUrl}/api/products`;
    if (category) {
      url += `?category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching products, using mockups:", error);
  }
  return [];
}

async function getCategories(): Promise<Category[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
  try {
    const res = await fetch(`${apiUrl}/api/categories`, { next: { revalidate: 10 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
  return [
    { id: 1, name: "Trái cây tươi", name_en: "Fresh fruits", name_zh: "新鲜水果", slug: "trai-cay-tuoi" },
    { id: 2, name: "Hạt dinh dưỡng", name_en: "Nutritious seeds", name_zh: "营养坚果", slug: "hat-dinh-duong" },
    { id: 3, name: "Đồ uống", name_en: "Beverages", name_zh: "饮品", slug: "do-uong" }
  ];
}

async function getSettings() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
  try {
    const res = await fetch(`${apiUrl}/api/settings`, { next: { revalidate: 10 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
  }
  return { phone_number: "0901234567" };
}

const MOCKUP_PRODUCTS: Product[] = [
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
    name: "Nhãn Xuồng Cơm Vàng",
    name_en: "Golden Flesh Longan",
    name_zh: "金肉龙眼",
    slug: "nhan-xuong-com-vang",
    price: 60000,
    original_price: 75000,
    category: "Trái cây tươi",
    category_en: "Fresh fruits",
    category_zh: "新鲜水果",
    image_url: null,
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
    image_url: null,
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
    image_url: null,
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
    image_url: null,
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
    image_url: null,
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
    image_url: null,
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
    image_url: null,
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
    image_url: null,
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
    image_url: null,
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
    image_url: null,
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
    image_url: null,
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
    image_url: null,
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
    image_url: null,
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
    image_url: null,
    is_available: true,
  }
];

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const lang = (resolvedParams.lang || "vi") as LanguageCode;
  const currentCategory = resolvedSearchParams.category || "Tất cả";
  
  const [apiProducts, categoriesData, settings] = await Promise.all([
    getProducts(currentCategory === "Tất cả" ? undefined : currentCategory),
    getCategories(),
    getSettings()
  ]);

  const phone = settings.phone_number || "0901234567";
  const t = getTranslation(lang);

  // Re-build categories list to include virtual "All" category at the top
  const categoriesList = [
    { name: "Tất cả", name_en: "All", name_zh: "全部", slug: "all" },
    ...categoriesData
  ];
  
  // Apply mockup filter if API returned nothing
  let displayProducts = apiProducts;
  if (displayProducts.length === 0) {
    displayProducts = currentCategory === "Tất cả" 
      ? MOCKUP_PRODUCTS 
      : MOCKUP_PRODUCTS.filter(p => p.category === currentCategory);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Page Banner */}
      <div className="relative overflow-hidden bg-emerald-600 text-white py-20 px-8 rounded-[32px] shadow-lg border border-white/5">
        {/* Background Image */}
        <img 
          src="/banner_products.png" 
          alt="Products Banner" 
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-20 z-0"
        />
        {/* Soft background glow overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.12),transparent)] z-10 pointer-events-none"></div>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

        <div className="relative z-20 text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
            {t.products}
          </h1>
          <div className="w-12 h-1 bg-emerald-500 mx-auto rounded-full"></div>
          <p className="text-emerald-200/80 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            {lang === "vi" 
              ? "Tất cả sản phẩm đều sạch, an toàn, được thu hoạch trực tiếp và đóng gói cẩn thận tại nhà vườn."
              : lang === "en"
              ? "All products are clean, safe, harvested directly, and carefully packaged at the orchard."
              : "所有产品均为绿色安全食品，直接从果园采收并精心包装。"}
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-2">
        {categoriesList.map((cat) => {
          const isActive = currentCategory === cat.name;
          const query = cat.name === "Tất cả" ? {} : { category: cat.name };
          const localizedCatName = getLocalizedValue(cat, "name", lang);
          
          return (
            <Link
              key={cat.name}
              href={{
                pathname: getLocalizedHref("/products", lang),
                query: query,
              }}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold border transition-all ${
                isActive
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-sm scale-105"
                  : "bg-white border-border text-slate-600 hover:bg-slate-50"
              }`}
            >
              {localizedCatName}
            </Link>
          );
        })}
      </div>

      {/* Product Grid */}
      {displayProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayProducts.map((product) => {
            const localizedProductName = getLocalizedValue(product, "name", lang);
            const localizedProductCategory = getLocalizedCategoryName(product.category, lang, categoriesData);
            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  {/* Image Placeholder */}
                  <Link href={getLocalizedHref(`/products/${product.slug}`, lang)}>
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700/40">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={localizedProductName}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                        />
                      ) : (
                        <span className="font-bold text-sm">{t.nongSanImagePlaceholder}</span>
                      )}
                      <span className="absolute top-3 left-3 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                        {localizedProductCategory}
                      </span>
                    </div>
                  </Link>
                  {/* Details */}
                  <div className="mt-4 space-y-1">
                    <h3 className="font-bold text-slate-800 leading-snug group-hover:text-emerald-600 transition-colors">
                      <Link href={getLocalizedHref(`/products/${product.slug}`, lang)}>
                        {localizedProductName}
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
                    className="flex w-full items-center justify-center gap-1 rounded-2xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 active:scale-95 transition-all"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{lang === "vi" ? "Xem chi tiết" : lang === "en" ? "View details" : "查看详情"}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-slate-50/50">
          <p className="text-slate-500 text-sm">
            {lang === "vi" 
              ? "Không tìm thấy sản phẩm nào trong danh mục này."
              : lang === "en"
              ? "No products found in this category."
              : "在此分类中未找到任何产品。"}
          </p>
        </div>
      )}
    </div>
  );
}
