import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, BookOpen } from "lucide-react";
import { getTranslation, getLocalizedValue, getLocalizedHref, LanguageCode } from "@/lib/i18n";

export const dynamic = "force-dynamic";

interface Blog {
  id: number;
  title: string;
  title_en?: string;
  title_zh?: string;
  slug: string;
  summary: string | null;
  summary_en?: string;
  summary_zh?: string;
  image_url: string | null;
  created_at: string;
  tag?: string | null;
  tag_en?: string | null;
  tag_zh?: string | null;
  tag_color?: string | null;
}

async function getBlogs(): Promise<Blog[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
  try {
    const res = await fetch(`${apiUrl}/api/blogs`, { next: { revalidate: 30 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
  }
  return [];
}

const MOCKUP_BLOGS: Blog[] = [
  {
    id: 1,
    title: "Cách Chọn Bơ Sáp Đắk Lắk Dẻo Béo, Không Sượng Bột",
    title_en: "How to Choose Rich, Buttery Dak Lak Avocados Without Bitterness",
    title_zh: "如何挑选软糯浓郁且不发苦的得乐省牛油果",
    slug: "cach-chon-bo-sap-dak-lak-deo-beo-khong-suong-bot",
    summary: "Bơ sáp là loại trái cây bổ dưỡng nhưng rất dễ mua nhầm quả sượng, đắng. Khám phá 5 bí quyết vàng từ nhà nông Đắk Lắk giúp bạn luôn lựa chọn được quả bơ ngon nhất.",
    summary_en: "Avocado is a highly nutritious fruit but it is easy to accidentally buy watery or bitter ones. Explore 5 golden tips from Dak Lak farmers to help you always select the best avocado.",
    summary_zh: "牛油果营养丰富，但很容易买到水汪汪或发苦的果实。探索得乐省果农分享的5个黄金秘诀，帮助您挑选出最完美的牛油果。",
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
    created_at: "2024-05-18T08:30:00Z",
    image_url: null,
  },
  {
    id: 3,
    title: "Lợi Ích Sức Khỏe Tuyệt Vời Của Hạt Mắc Ca Sấy Gió",
    title_en: "Amazing Health Benefits of Wind-Dried Macadamia Nuts",
    title_zh: "风干夏威夷果令人惊叹的的健康益处",
    slug: "loi-ich-suc-khoe-tuyet-voi-cua-hat-mac-ca-say-gio",
    summary: "Mắc ca được mệnh danh là nữ hoàng các loại quả khô. Cùng Nông Sản Sạch tìm hiểu những lợi ích bất ngờ đối với tim mạch, não bộ và làm đẹp da khi ăn mắc ca mỗi ngày.",
    summary_en: "Macadamia is crowned as the queen of dried fruits. Discover the unexpected benefits for heart health, brain function, and skin beauty when eating macadamia nuts daily with Nong San Sach.",
    summary_zh: "夏威夷果被誉为干果皇后。与“Nông Sản Sạch”一起探索每天食用夏威夷果对心脏健康、大脑功能和美容护肤带来的惊喜益处。",
    created_at: "2024-05-15T14:00:00Z",
    image_url: null,
  }
];

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function BlogsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const lang = (resolvedParams.lang || "vi") as LanguageCode;

  const apiBlogs = await getBlogs();
  const displayBlogs = apiBlogs.length > 0 ? apiBlogs : MOCKUP_BLOGS;

  const t = getTranslation(lang);

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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Page Banner */}
      <div className="relative overflow-hidden bg-emerald-950 text-white py-16 px-8 rounded-[32px] shadow-lg border border-white/5">
        {/* Background Image */}
        <img 
          src="/banner_stories.png" 
          alt="Stories Banner" 
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-20 z-0"
        />
        {/* Soft background glow overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.12),transparent)] z-10 pointer-events-none"></div>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

        <div className="relative z-20 text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
            {t.storiesTitle}
          </h1>
          <div className="w-12 h-1 bg-emerald-500 mx-auto rounded-full"></div>
          <p className="text-emerald-200/80 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            {t.storiesSubtitle}
          </p>
        </div>
      </div>

      {/* Blogs Grid */}
      {displayBlogs.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {displayBlogs.map((blog) => {
            const localizedTitle = getLocalizedValue(blog, "title", lang);
            const localizedSummary = getLocalizedValue(blog, "summary", lang);
            return (
              <article
                key={blog.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  {/* Image Placeholder */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700/40">
                    {blog.image_url ? (
                      <img
                        src={blog.image_url}
                        alt={localizedTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-10 w-10 text-emerald-600/30" />
                    )}
                    <span className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-[10px] font-semibold ${
                      blog.tag_color === "blue" ? "bg-blue-100 text-blue-800" :
                      blog.tag_color === "amber" ? "bg-amber-100 text-amber-800" :
                      blog.tag_color === "rose" ? "bg-rose-100 text-rose-800" :
                      blog.tag_color === "purple" ? "bg-purple-100 text-purple-800" :
                      blog.tag_color === "slate" ? "bg-slate-100 text-slate-800" :
                      "bg-emerald-100 text-emerald-800"
                    }`}>
                      {getLocalizedValue(blog, "tag", lang) || (lang === "vi" ? "Kinh nghiệm nhà nông" : lang === "en" ? "Farmer's Experience" : "农人经验")}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-4 space-y-2">
                    <span className="text-xs text-slate-400">
                      {formatBlogDate(blog.created_at)}
                    </span>
                    <h2 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={getLocalizedHref(`/stories/${blog.slug}`, lang)}>
                        {localizedTitle}
                      </Link>
                    </h2>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                      {localizedSummary}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <Link
                    href={getLocalizedHref(`/stories/${blog.slug}`, lang)}
                    className="flex items-center gap-1 text-xs font-semibold text-primary"
                  >
                    <span>{t.readMore}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-slate-50/50">
          <p className="text-slate-500 text-sm">
            {lang === "vi" ? "Chưa có bài viết nào được đăng tải." : lang === "en" ? "No posts have been published yet." : "尚未发布任何文章。"}
          </p>
        </div>
      )}
    </div>
  );
}
