"use client";

import React, { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { BarChart3, AlertCircle, ShieldAlert, Eye, Globe, Laptop, ArrowUpRight, TrendingUp, RefreshCw } from "lucide-react";

interface DailyStat {
  date: string;
  views: number;
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
  total_views_alltime?: number;
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
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<number>(7);
  const [groupBy, setGroupBy] = useState<GroupBy>("day");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cooldownSecs, setCooldownSecs] = useState<number>(0);

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

  // Sync cooldown from loaded data
  useEffect(() => {
    if (data?.last_synced) {
      const lastSyncedTime = new Date(data.last_synced).getTime();
      const nowTime = new Date().getTime();
      const elapsedSecs = Math.max(0, Math.floor((nowTime - lastSyncedTime) / 1000));
      const remaining = 300 - elapsedSecs;
      if (remaining > 0 && remaining <= 300) {
        setCooldownSecs(remaining);
      } else {
        setCooldownSecs(0);
      }
    }
  }, [data]);

  // Countdown timer interval
  useEffect(() => {
    if (cooldownSecs <= 0) return;
    const interval = setInterval(() => {
      setCooldownSecs((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSecs]);

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSync = async () => {
    if (syncing || cooldownSecs > 0) return;
    setSyncing(true);
    setSyncMessage(null);
    try {
      await api.post("/analytics/sync", {});
      setSyncMessage({ type: "success", text: "Đồng bộ dữ liệu thành công!" });
      await fetchAnalytics(days);
    } catch (err: any) {
      const errMsg = err.message || "";
      const match = errMsg.match(/sau\s+(\d+)\s+giây/);
      if (match && match[1]) {
        const secs = parseInt(match[1], 10);
        setCooldownSecs(secs);
      }
      setSyncMessage({ 
        type: "error", 
        text: errMsg || "Không thể đồng bộ dữ liệu lúc này." 
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
          return { label: `${day}/${month}`, views: s.views };
        } catch { return { label: s.date, views: s.views }; }
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
        if (!weeks[key]) weeks[key] = { label: `T${key}`, views: 0 };
        weeks[key].views += s.views;
      });
      return Object.values(weeks);
    }

    if (groupBy === "month") {
      const months: Record<string, AggregatedStat> = {};
      raw.forEach((s) => {
        const [year, month] = s.date.split("-");
        const key = `${month}/${year}`;
        if (!months[key]) months[key] = { label: `T${month}/${year.slice(2)}`, views: 0 };
        months[key].views += s.views;
      });
      return Object.values(months);
    }
    return [];
  }, [data, groupBy]);

  // SVG Chart Dimensions & Computations
  const chartHeight = 300;
  const paddingX = 64;
  const paddingY = 40;
  // Fixed virtual canvas — SVG scales via CSS to fill container
  const chartWidth = 900;
  // pointSpacing shrinks automatically when there are more data points
  const pointSpacing = (chartWidth - paddingX * 2) / Math.max(aggregatedStats.length - 1, 1);

  const chartParams = useMemo(() => {
    if (aggregatedStats.length === 0) return null;

    const stats = aggregatedStats;
    const maxViews = Math.max(...stats.map((s) => s.views), 100);

    // How many X-axis labels to skip so they don't overlap
    const labelStep = stats.length <= 10 ? 1 : stats.length <= 20 ? 2 : Math.ceil(stats.length / 10);
    const showValueLabels = stats.length <= 14;
    const dotR = stats.length <= 14 ? 4.5 : 3;

    const getX = (index: number) => paddingX + index * pointSpacing;

    const getYViews = (val: number) =>
      chartHeight - paddingY - (val / maxViews) * (chartHeight - paddingY * 2);

    let viewsLinePath = "";
    let viewsAreaPath = "";

    stats.forEach((s, idx) => {
      const x = getX(idx);
      const yViews = getYViews(s.views);
      if (idx === 0) {
        viewsLinePath = `M ${x} ${yViews}`;
        viewsAreaPath = `M ${x} ${chartHeight - paddingY} L ${x} ${yViews}`;
      } else {
        viewsLinePath += ` L ${x} ${yViews}`;
        viewsAreaPath += ` L ${x} ${yViews}`;
      }
      if (idx === stats.length - 1) {
        viewsAreaPath += ` L ${x} ${chartHeight - paddingY} Z`;
      }
    });

    return { maxViews, getX, getYViews, viewsLinePath, viewsAreaPath, labelStep, showValueLabels, dotR };
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
            disabled={syncing || cooldownSecs > 0}
            className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold shadow-sm transition-all ${
              syncing || cooldownSecs > 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" 
                : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
            }`}
          >
            {syncing ? (
              <>
                <RefreshCw className="animate-spin h-3.5 w-3.5" />
                <span>Đang đồng bộ...</span>
              </>
            ) : cooldownSecs > 0 ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                <span>Làm mới ({formatCooldown(cooldownSecs)})</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tổng Lượt Xem Từ Đầu</span>
            <h3 className="text-2xl font-black text-slate-800">
              {(data.total_views_alltime ?? data.total_views).toLocaleString("vi-VN")}
            </h3>
            <span className="text-[10px] text-slate-400 font-normal">
              Tích lũy toàn bộ thời gian
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
      {/* Main chart + Devices side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Traffic Chart — takes 2/3 */}
        {chartParams && (
          <div className="xl:col-span-2 rounded-3xl border border-border bg-white p-6 shadow-sm space-y-4">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-800">Lưu lượng truy cập</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Lượt xem trang theo thời gian</p>
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
              {/* Legend — views only */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-500">Lượt xem trang</span>
              </div>
            </div>
          </div>

          {/* SVG Chart — fixed width, scales to container */}
          <div className="w-full">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto overflow-visible select-none"
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
                  return (
                    <g key={i}>
                      <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y}
                        stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                      <text x={paddingX - 8} y={y + 4} textAnchor="end"
                        fontSize="10" fontWeight="600" fill="#94a3b8" fontFamily="sans-serif">
                        {fmtVal}
                      </text>
                    </g>
                  );
                })}

                {/* Filled area under views line */}
                <path d={chartParams.viewsAreaPath} fill="url(#viewsAreaGrad2)" />

                {/* Requests line — removed */}

                {/* Views line (on top) */}
                <path d={chartParams.viewsLinePath} fill="none" stroke="#10b981"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Per-point elements */}
                {aggregatedStats.map((s, idx) => {
                  const x = chartParams.getX(idx);
                  const yViews = chartParams.getYViews(s.views);
                  const showLabel = idx % chartParams.labelStep === 0;

                  return (
                    <g key={idx}>
                      {showLabel && (
                        <text x={x} y={chartHeight - 8} textAnchor="middle"
                          fontSize="9" fontWeight="700" fill="#64748b" fontFamily="sans-serif">
                          {s.label}
                        </text>
                      )}
                      <line x1={x} y1={paddingY} x2={x} y2={chartHeight - paddingY}
                        stroke="#94a3b8" strokeWidth="1"
                        opacity="0" className="hover:opacity-20 transition-opacity" />
                      <circle cx={x} cy={yViews} r={chartParams.dotR}
                        fill="#10b981" stroke="#fff" strokeWidth="1.5" />
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
        )}

        {/* Devices Breakdown Card — beside the chart */}
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="text-base font-black text-slate-800">Thiết bị truy cập</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tỉ lệ loại thiết bị người dùng</p>
          </div>

          {/* Donut Chart — centered, bigger */}
          <div className="flex items-center justify-center py-2">
            <div className="relative h-48 w-48 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-full w-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                {(() => {
                  let acc = 0;
                  return data.devices.map((d, idx) => {
                    const pct = d.percentage;
                    const dashArray = `${pct} ${100 - pct}`;
                    const dashOffset = -acc;
                    acc += pct;
                    return (
                      <circle key={idx} cx="18" cy="18" r="15.9155" fill="none"
                        stroke={getDeviceColor(d.device)} strokeWidth="2.5"
                        strokeDasharray={dashArray} strokeDashoffset={dashOffset} />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Mobile</span>
                <span className="text-3xl font-black text-slate-700">
                  {data.devices.find(d => d.device === "Mobile")?.percentage || 60}%
                </span>
              </div>
            </div>
          </div>

          {/* Device rows with progress bars */}
          <div className="space-y-4">
            {data.devices.map((d, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-3 w-3 rounded-full ${getDeviceBgClass(d.device)}`}></span>
                    <span className="text-sm font-bold text-slate-700">{d.device}</span>
                  </div>
                  <span className="text-sm font-black text-slate-600">{d.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${d.percentage}%`, backgroundColor: getDeviceColor(d.device) }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      {/* Grid: Referrers (Left) & Countries (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Countries Breakdown */}
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
