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
  last_synced?: string | null;
}

const getDeviceColor = (device: string) => {
  switch (device.toLowerCase()) {
    case "mobile":
      return "#10b981";
    case "desktop":
      return "#60a5fa";
    case "tablet":
      return "#fbbf24";
    default:
      return "#a855f7";
  }
};

const getDeviceBgClass = (device: string) => {
  switch (device.toLowerCase()) {
    case "mobile":
      return "bg-emerald-500";
    case "desktop":
      return "bg-blue-400";
    case "tablet":
      return "bg-amber-400";
    default:
      return "bg-purple-500";
  }
};

type GroupBy = "day" | "week" | "month";

interface AggregatedStat {
  label: string;
  views: number;
  requests: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<number>(7);
  const [groupBy, setGroupBy] = useState<GroupBy>("day");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAnalytics = async (selectedDays = days) => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics?days=${selectedDays}`);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Không thể tải dữ liệu thống kê.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(days);
  }, []);

  useEffect(() => {
    if (syncMessage) {
      const timer = setTimeout(() => {
        setSyncMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [syncMessage]);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncMessage(null);
    try {
      await api.post("/analytics/sync", {});
      setSyncMessage({ type: "success", text: "Đồng bộ dữ liệu thành công!" });
      await fetchAnalytics(days);
    } catch (err: any) {
      setSyncMessage({ 
        type: "error", 
        text: err.message || "Không thể đồng bộ dữ liệu lúc này." 
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatLastSynced = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());
      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1);
      const year = date.getFullYear();
      return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    } catch {
      return isoStr;
    }
  };

  // Aggregate daily_stats based on groupBy selection
  const aggregatedStats = useMemo((): AggregatedStat[] => {
    if (!data || data.daily_stats.length === 0) return [];
    const raw = data.daily_stats;

    if (groupBy === "day") {
      return raw.map((s) => {
        try {
          const [, month, day] = s.date.split("-");
          return { label: `${day}/${month}`, views: s.views, requests: s.requests };
        } catch { return { label: s.date, views: s.views, requests: s.requests }; }
      });
    }

    if (groupBy === "week") {
      const weeks: Record<string, AggregatedStat> = {};
      raw.forEach((s) => {
        const d = new Date(s.date);
        // ISO week start Monday
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d);
        monday.setDate(diff);
        const key = `${String(monday.getDate()).padStart(2,"0")}/${String(monday.getMonth()+1).padStart(2,"0")}`;
        if (!weeks[key]) weeks[key] = { label: `T${key}`, views: 0, requests: 0 };
        weeks[key].views += s.views;
        weeks[key].requests += s.requests;
      });
      return Object.values(weeks);
    }

    if (groupBy === "month") {
      const months: Record<string, AggregatedStat> = {};
      raw.forEach((s) => {
        const [year, month] = s.date.split("-");
        const key = `${month}/${year}`;
        if (!months[key]) months[key] = { label: `T${month}/${year.slice(2)}`, views: 0, requests: 0 };
        months[key].views += s.views;
        months[key].requests += s.requests;
      });
      return Object.values(months);
    }
    return [];
  }, [data, groupBy]);

  // SVG Chart Dimensions & Computations
  const chartHeight = 280;
  const paddingX = 64;
  const paddingY = 32;
  // Min px per data point so chart doesn't get cramped
  const pointSpacing = Math.max(36, Math.min(72, 700 / (aggregatedStats.length || 1)));
  const chartWidth = Math.max(640, paddingX * 2 + pointSpacing * (aggregatedStats.length - 1 || 1));

  const chartParams = useMemo(() => {
    if (aggregatedStats.length === 0) return null;

    const stats = aggregatedStats;
    const maxViews = Math.max(...stats.map((s) => s.views), 100);
    const maxReqs = Math.max(...stats.map((s) => s.requests), 100);

    // How many X-axis labels to skip so they don't overlap
    const labelStep = stats.length <= 10 ? 1 : stats.length <= 20 ? 2 : Math.ceil(stats.length / 10);
    const showValueLabels = stats.length <= 14;
    // Dot size shrinks for many points
    const dotR = stats.length <= 14 ? 4.5 : 3;
    const dotRSmall = stats.length <= 14 ? 3.5 : 2;

    const getX = (index: number) => paddingX + index * pointSpacing;

    const getYViews = (val: number) =>
      chartHeight - paddingY - (val / maxViews) * (chartHeight - paddingY * 2);

    const getYReqs = (val: number) =>
      chartHeight - paddingY - (val / maxReqs) * (chartHeight - paddingY * 2);

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

    return { maxViews, maxReqs, getX, getYViews, getYReqs, viewsLinePath, viewsAreaPath, reqsLinePath, labelStep, showValueLabels, dotR, dotRSmall };
  }, [aggregatedStats, chartWidth, pointSpacing]);

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
          onClick={() => fetchAnalytics(days)}
          className="rounded-full bg-red-600 text-white px-6 py-2.5 text-xs font-bold shadow-md hover:bg-red-700 transition-colors"
        >
          Thử Lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-emerald-600" />
            <span>Thống Kê Truy Cập</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Xem phân tích lượng truy cập, nguồn dẫn và thiết bị người dùng truy cập website.
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {data?.last_synced && (
            <span className="text-[11px] text-slate-400 font-medium">
              Đồng bộ: {formatLastSynced(data.last_synced)}
            </span>
          )}
          
          {/* Dropdown */}
          <div className="relative">
            <select
              value={days}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setDays(val);
                fetchAnalytics(val);
              }}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-2xl px-4 py-2 pr-8 text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value={7}>7 ngày qua</option>
              <option value={14}>14 ngày qua</option>
              <option value={30}>30 ngày qua</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold shadow-sm transition-all ${
              syncing 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
            }`}
          >
            {syncing ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang đồng bộ...</span>
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17m0 0V4"></path>
                </svg>
                <span>Làm mới</span>
              </>
            )}
          </button>
        </div>
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
              <span>{days} ngày gần nhất</span>
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
              {Math.round(data.total_views / days).toLocaleString("vi-VN")}
            </h3>
            <span className="text-[10px] text-slate-400 font-normal">
              Tính trên khoảng thời gian {days} ngày
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Laptop className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Traffic Chart Card */}
      {chartParams && (
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm space-y-4">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-800">Lưu lượng truy cập</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">So sánh lượt xem trang và tổng số yêu cầu</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Group-by tabs */}
              <div className="flex items-center bg-slate-100 rounded-2xl p-1 gap-0.5">
                {(["day", "week", "month"] as GroupBy[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGroupBy(g)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                      groupBy === g
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {g === "day" ? "Ngày" : g === "week" ? "Tuần" : "Tháng"}
                  </button>
                ))}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-500">Xem trang</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-400"></span>
                  <span className="text-slate-500">Yêu cầu</span>
                </div>
              </div>
            </div>
          </div>

          {/* SVG Chart — scrollable horizontally */}
          <div className="overflow-x-auto pb-1">
            <div style={{ minWidth: `${chartWidth}px` }}>
              <svg
                width={chartWidth}
                height={chartHeight}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="overflow-visible select-none"
              >
                <defs>
                  <linearGradient id="viewsAreaGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines + Y-axis labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                  const y = paddingY + r * (chartHeight - paddingY * 2);
                  const val = Math.round((1 - r) * chartParams.maxViews);
                  const fmtVal = val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toString();
                  const valR = Math.round((1 - r) * chartParams.maxReqs);
                  const fmtValR = valR >= 1000 ? `${(valR / 1000).toFixed(1)}k` : valR.toString();
                  return (
                    <g key={i}>
                      <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y}
                        stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                      <text x={paddingX - 8} y={y + 4} textAnchor="end"
                        fontSize="10" fontWeight="600" fill="#94a3b8" fontFamily="sans-serif">
                        {fmtVal}
                      </text>
                      <text x={chartWidth - paddingX + 8} y={y + 4} textAnchor="start"
                        fontSize="10" fontWeight="600" fill="#93c5fd" fontFamily="sans-serif">
                        {fmtValR}
                      </text>
                    </g>
                  );
                })}

                {/* Filled area under views line */}
                <path d={chartParams.viewsAreaPath} fill="url(#viewsAreaGrad2)" />

                {/* Requests line */}
                <path d={chartParams.reqsLinePath} fill="none" stroke="#60a5fa"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" />

                {/* Views line (on top) */}
                <path d={chartParams.viewsLinePath} fill="none" stroke="#10b981"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Per-point elements */}
                {aggregatedStats.map((s, idx) => {
                  const x = chartParams.getX(idx);
                  const yViews = chartParams.getYViews(s.views);
                  const yReqs = chartParams.getYReqs(s.requests);
                  const showLabel = idx % chartParams.labelStep === 0;

                  return (
                    <g key={idx}>
                      {/* X-axis label (thinned) */}
                      {showLabel && (
                        <text x={x} y={chartHeight - 8} textAnchor="middle"
                          fontSize="9" fontWeight="700" fill="#64748b" fontFamily="sans-serif">
                          {s.label}
                        </text>
                      )}

                      {/* Vertical hover guide */}
                      <line x1={x} y1={paddingY} x2={x} y2={chartHeight - paddingY}
                        stroke="#94a3b8" strokeWidth="1"
                        opacity="0" className="hover:opacity-20 transition-opacity" />

                      {/* Views dot */}
                      <circle cx={x} cy={yViews} r={chartParams.dotR}
                        fill="#10b981" stroke="#fff" strokeWidth="1.5" />

                      {/* Requests dot */}
                      <circle cx={x} cy={yReqs} r={chartParams.dotRSmall}
                        fill="#60a5fa" stroke="#fff" strokeWidth="1.5" />

                      {/* Value label above views dot — only when not too crowded */}
                      {chartParams.showValueLabels && s.views > 0 && (
                        <text x={x} y={yViews - 7} textAnchor="middle"
                          fontSize="8" fontWeight="800" fill="#059669" fontFamily="sans-serif">
                          {s.views >= 1000 ? `${(s.views / 1000).toFixed(1)}k` : s.views}
                        </text>
                      )}
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
                    <span className={`h-2.5 w-2.5 rounded-full ${getDeviceBgClass(d.device)}`}></span>
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
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    {(() => {
                      let accumulatedPercentage = 0;
                      return data.devices.map((d, idx) => {
                        const pct = d.percentage;
                        const dashArray = `${pct} ${100 - pct}`;
                        const dashOffset = -accumulatedPercentage;
                        accumulatedPercentage += pct;
                        const color = getDeviceColor(d.device);
                        return (
                          <circle
                            key={idx}
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="none"
                            stroke={color}
                            strokeWidth="3"
                            strokeDasharray={dashArray}
                            strokeDashoffset={dashOffset}
                          />
                        );
                      });
                    })()}
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

      {/* Floating Toast Notification */}
      {syncMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-500">
          <div className={`flex items-center gap-2 rounded-2xl px-5 py-3 shadow-lg border text-xs font-bold text-white ${
            syncMessage.type === "success"
              ? "bg-emerald-600 border-emerald-500"
              : "bg-red-600 border-red-500"
          }`}>
            {syncMessage.type === "success" ? (
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : (
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            )}
            <span>{syncMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
