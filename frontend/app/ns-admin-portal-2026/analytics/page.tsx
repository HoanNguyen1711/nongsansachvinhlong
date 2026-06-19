"use client";

import React, { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { BarChart3, AlertCircle, ShieldAlert, Eye, Globe, Laptop, ArrowUpRight, TrendingUp } from "lucide-react";

interface DailyStat {
  date: string;
  views: number;
  requests: number;
}

interface ReferrerStat {
  source: string;
  count: number;
  percentage: number;
}

interface DeviceStat {
  device: string;
  count: number;
  percentage: number;
}

interface CountryStat {
  country: string;
  count: number;
  percentage: number;
}

interface AnalyticsData {
  configured: boolean;
  error?: string | null;
  total_views: number;
  total_requests: number;
  daily_stats: DailyStat[];
  referrers: ReferrerStat[];
  devices: DeviceStat[];
  countries: CountryStat[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/analytics");
      setData(res);
    } catch (err: any) {
      setError(err.message || "Không thể tải dữ liệu thống kê.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Format date helper (e.g., "19/06")
  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}`;
    } catch {
      return dateStr;
    }
  };

  // SVG Chart Dimensions & Computations
  const chartWidth = 700;
  const chartHeight = 260;
  const paddingX = 60;
  const paddingY = 30;

  const chartParams = useMemo(() => {
    if (!data || data.daily_stats.length === 0) return null;

    const stats = data.daily_stats;
    const maxViews = Math.max(...stats.map((s) => s.views), 100);
    const maxReqs = Math.max(...stats.map((s) => s.requests), 100);

    const stepX = (chartWidth - paddingX * 2) / (stats.length - 1 || 1);

    const getX = (index: number) => paddingX + index * stepX;
    
    // Scale functions: 0 is bottom (chartHeight - paddingY), max is top (paddingY)
    const getYViews = (val: number) =>
      chartHeight - paddingY - (val / maxViews) * (chartHeight - paddingY * 2);

    const getYReqs = (val: number) =>
      chartHeight - paddingY - (val / maxReqs) * (chartHeight - paddingY * 2);

    // Build SVG Path strings
    let viewsLinePath = "";
    let viewsAreaPath = "";
    let reqsLinePath = "";

    stats.forEach((s, idx) => {
      const x = getX(idx);
      const yViews = getYViews(s.views);
      const yReqs = getYReqs(s.requests);

      if (idx === 0) {
        viewsLinePath = `M ${x} ${yViews}`;
        viewsAreaPath = `M ${x} ${chartHeight - paddingY} L ${x} ${yViews}`;
        reqsLinePath = `M ${x} ${yReqs}`;
      } else {
        viewsLinePath += ` L ${x} ${yViews}`;
        viewsAreaPath += ` L ${x} ${yViews}`;
        reqsLinePath += ` L ${x} ${yReqs}`;
      }

      if (idx === stats.length - 1) {
        viewsAreaPath += ` L ${x} ${chartHeight - paddingY} Z`;
      }
    });

    return {
      maxViews,
      maxReqs,
      getX,
      getYViews,
      getYReqs,
      viewsLinePath,
      viewsAreaPath,
      reqsLinePath,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 animate-pulse rounded-2xl bg-slate-200/60 w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 animate-pulse rounded-3xl bg-slate-200/60"></div>
          <div className="h-28 animate-pulse rounded-3xl bg-slate-200/60"></div>
          <div className="h-28 animate-pulse rounded-3xl bg-slate-200/60"></div>
        </div>
        <div className="h-80 animate-pulse rounded-3xl bg-slate-200/60"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl bg-red-50 p-6 border border-red-100 flex flex-col items-center gap-4 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="h-12 w-12 text-red-600" />
        <h2 className="text-lg font-bold text-red-950">Không thể tải số liệu thống kê</h2>
        <p className="text-xs text-red-700/80 leading-relaxed">
          {error || "Đã xảy ra lỗi không xác định. Vui lòng kiểm tra lại cấu hình."}
        </p>
        <button
          onClick={fetchAnalytics}
          className="rounded-full bg-red-600 text-white px-6 py-2.5 text-xs font-bold shadow-md hover:bg-red-700 transition-colors"
        >
          Thử Lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <span>Thống Kê Truy Cập</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Xem phân tích lượng truy cập, nguồn dẫn và thiết bị người dùng truy cập website.
        </p>
      </div>

      {/* Warning Alert if running on Mock Data */}
      {!data.configured && (
        <div className="rounded-3xl bg-amber-50/70 border border-amber-200/80 p-5 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
          <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-700 shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-sm font-extrabold text-amber-900">
              Đang hiển thị dữ liệu mô phỏng (Demo Mode)
            </h4>
            <p className="text-xs text-amber-800/80 leading-relaxed">
              Hệ thống chưa tìm thấy cấu hình kết nối API của Cloudflare trong tệp biến môi trường. Để hiển thị số liệu thực tế của website, vui lòng thêm các dòng sau vào tệp cấu hình <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px] font-bold">backend/.env</code>:
            </p>
            <pre className="bg-amber-950 text-amber-200 p-3 rounded-2xl text-[10px] font-mono leading-normal select-all">
{`CLOUDFLARE_ZONE_ID=your_cloudflare_zone_id_here
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here`}
            </pre>
            {data.error && (
              <p className="text-[10px] text-red-600 font-bold mt-1">
                Lỗi chi tiết: {data.error}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Metrics Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tổng Lượt Xem Trang</span>
            <h3 className="text-2xl font-black text-slate-800">
              {data.total_views.toLocaleString("vi-VN")}
            </h3>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />
              <span>7 ngày gần nhất</span>
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Eye className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tổng Số Yêu Cầu (Requests)</span>
            <h3 className="text-2xl font-black text-slate-800">
              {data.total_requests.toLocaleString("vi-VN")}
            </h3>
            <span className="text-[10px] text-slate-400 font-normal">
              Bao gồm tài nguyên tĩnh & hình ảnh
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Globe className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Xem Trang Trung Bình / Ngày</span>
            <h3 className="text-2xl font-black text-slate-800">
              {Math.round(data.total_views / 7).toLocaleString("vi-VN")}
            </h3>
            <span className="text-[10px] text-slate-400 font-normal">
              Tính trên khoảng thời gian 7 ngày
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Laptop className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Daily Traffic Chart Card */}
      {chartParams && (
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-800">Lưu lượng truy cập theo ngày</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Biểu đồ so sánh số lượt xem trang và số lượng yêu cầu</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600">Lượt xem trang</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-blue-400"></span>
                <span className="text-slate-600">Tổng yêu cầu</span>
              </div>
            </div>
          </div>

          {/* Custom SVG Line Chart */}
          <div className="overflow-x-auto pt-2">
            <div className="min-w-[650px] relative">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto overflow-visible select-none"
              >
                <defs>
                  {/* Views Gradient */}
                  <linearGradient id="viewsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                  const y = paddingY + r * (chartHeight - paddingY * 2);
                  return (
                    <g key={i}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      {/* Left Y Axis Labels (Views) */}
                      <text
                        x={paddingX - 10}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[9px] font-bold fill-slate-400 font-sans"
                      >
                        {Math.round((1 - r) * chartParams.maxViews).toLocaleString("vi-VN")}
                      </text>
                      {/* Right Y Axis Labels (Reqs) */}
                      <text
                        x={chartWidth - paddingX + 10}
                        y={y + 4}
                        textAnchor="start"
                        className="text-[9px] font-bold fill-slate-400 font-sans"
                      >
                        {Math.round((1 - r) * chartParams.maxReqs).toLocaleString("vi-VN")}
                      </text>
                    </g>
                  );
                })}

                {/* Area Gradient (Views) */}
                <path d={chartParams.viewsAreaPath} fill="url(#viewsAreaGrad)" />

                {/* Lines */}
                <path
                  d={chartParams.viewsLinePath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={chartParams.reqsLinePath}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="2 2"
                />

                {/* Vertical markers and Dots */}
                {data.daily_stats.map((s, idx) => {
                  const x = chartParams.getX(idx);
                  const yViews = chartParams.getYViews(s.views);
                  const yReqs = chartParams.getYReqs(s.requests);

                  return (
                    <g key={idx}>
                      {/* X axis labels */}
                      <text
                        x={x}
                        y={chartHeight - 10}
                        textAnchor="middle"
                        className="text-[9px] font-bold fill-slate-500 font-sans"
                      >
                        {formatDate(s.date)}
                      </text>

                      {/* Tooltip Hover Guide lines */}
                      <line
                        x1={x}
                        y1={paddingY}
                        x2={x}
                        y2={chartHeight - paddingY}
                        stroke="#94a3b8"
                        strokeWidth="1"
                        className="opacity-0 hover:opacity-30 transition-opacity"
                        style={{ cursor: "pointer" }}
                      />

                      {/* Views Dot */}
                      <circle
                        cx={x}
                        cy={yViews}
                        r="4.5"
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="drop-shadow-sm hover:r-6 hover:scale-125 transition-transform"
                      />

                      {/* Reqs Dot */}
                      <circle
                        cx={x}
                        cy={yReqs}
                        r="3.5"
                        fill="#60a5fa"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="drop-shadow-sm"
                      />

                      {/* Interactive labels above points */}
                      <text
                        x={x}
                        y={yViews - 8}
                        textAnchor="middle"
                        className="text-[8px] font-extrabold fill-emerald-700 bg-white"
                      >
                        {s.views}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Referrers (Left) & Devices/Countries (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Referral Traffic */}
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-black text-slate-800">Nguồn giới thiệu lượng truy cập</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Top nguồn dẫn truy cập nhiều nhất vào website</p>
          </div>

          <div className="space-y-4">
            {data.referrers.map((ref, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    {ref.source === "Direct / Bookmarks" || ref.source === "Direct / Unknown" ? (
                      <span className="text-slate-400 font-medium">Trực tiếp / Bookmark</span>
                    ) : (
                      <>
                        <span className="text-slate-600">{ref.source}</span>
                        <ArrowUpRight className="h-3 w-3 text-slate-400" />
                      </>
                    )}
                  </span>
                  <span className="font-bold text-slate-500">
                    {ref.count.toLocaleString("vi-VN")} ({ref.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${ref.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device & Country Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Devices Breakdown Card */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between space-y-5">
            <div>
              <h3 className="text-base font-black text-slate-800">Thiết bị truy cập</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Tỉ lệ loại thiết bị người dùng</p>
            </div>
            
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {data.devices.map((d, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      d.device === "Mobile" ? "bg-emerald-500" :
                      d.device === "Desktop" ? "bg-blue-400" :
                      "bg-amber-400"
                    }`}></span>
                    <span className="font-bold text-slate-600">{d.device}</span>
                  </div>
                  <span className="font-bold text-slate-500">{d.percentage}%</span>
                </div>
              ))}
              {/* Circular gauge simulator */}
              <div className="pt-4 flex items-center justify-center">
                <div className="relative h-24 w-24 flex items-center justify-center">
                  {/* Simulated Donut Chart using SVG */}
                  <svg viewBox="0 0 36 36" className="h-full w-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    {/* Mobile: 60% */}
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="60 40" strokeDashoffset="0" />
                    {/* Desktop: 35% */}
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#60a5fa" strokeWidth="3" strokeDasharray="35 65" strokeDashoffset="-60" />
                    {/* Tablet: 5% */}
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="5 95" strokeDashoffset="-95" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Mobile</span>
                    <span className="text-sm font-black text-slate-700">
                      {data.devices.find(d => d.device === "Mobile")?.percentage || 60}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Countries Breakdown Card */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between space-y-5">
            <div>
              <h3 className="text-base font-black text-slate-800">Quốc gia</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Top vị trí truy cập hàng đầu</p>
            </div>

            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {data.countries.map((c, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">{c.country}</span>
                    <span className="font-bold text-slate-500">{c.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${c.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
