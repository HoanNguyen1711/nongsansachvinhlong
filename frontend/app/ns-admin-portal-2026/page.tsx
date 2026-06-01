"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ShoppingBag, BookOpen, User, PlusCircle, ArrowUpRight } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, blogs: 0 });
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [products, blogs, me] = await Promise.all([
          api.get("/products"),
          api.get("/blogs?only_published=false"),
          api.get("/auth/me")
        ]);
        
        setStats({
          products: products.length,
          blogs: blogs.length
        });
        setAdminUser(me.username);
      } catch (err) {
        console.error("Lỗi khi tải thống kê:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Xin chào, {adminUser || "Quản trị viên"}!</h1>
        <p className="text-xs text-slate-500 mt-1">Chào mừng bạn đến với hệ thống quản lý nội dung website Nông Sản Sạch.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="h-32 animate-pulse rounded-3xl bg-slate-200/60"></div>
          <div className="h-32 animate-pulse rounded-3xl bg-slate-200/60"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Products Card */}
            <div className="rounded-3xl border border-border bg-white p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Sản Phẩm</span>
                <span className="text-4xl font-black text-slate-800 block">{stats.products}</span>
                <Link
                  href="/ns-admin-portal-2026/products"
                  className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline pt-2"
                >
                  <span>Quản lý sản phẩm</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 text-primary shrink-0">
                <ShoppingBag className="h-8 w-8" />
              </div>
            </div>

            {/* Blogs Card */}
            <div className="rounded-3xl border border-border bg-white p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Bài Viết / Tin Tức</span>
                <span className="text-4xl font-black text-slate-800 block">{stats.blogs}</span>
                <Link
                  href="/ns-admin-portal-2026/blogs"
                  className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline pt-2"
                >
                  <span>Quản lý bài viết</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4 text-amber-600 shrink-0">
                <BookOpen className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-3xl border border-border bg-white p-8 space-y-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800">Thao Tác Nhanh</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link
                href="/ns-admin-portal-2026/products"
                className="flex items-center justify-between rounded-2xl border border-border bg-slate-50/50 p-5 hover:bg-slate-50 hover:border-primary group transition-all"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">Thêm sản phẩm mới</h3>
                  <p className="text-[10px] text-slate-500">Đăng bán trái cây sấy dẻo, hạt dinh dưỡng mới thu hoạch</p>
                </div>
                <PlusCircle className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
              </Link>
              <Link
                href="/ns-admin-portal-2026/blogs"
                className="flex items-center justify-between rounded-2xl border border-border bg-slate-50/50 p-5 hover:bg-slate-50 hover:border-primary group transition-all"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">Viết bài chia sẻ kinh nghiệm</h3>
                  <p className="text-[10px] text-slate-500">Đăng mẹo bảo quản nông sản hoặc công thức chế biến</p>
                </div>
                <PlusCircle className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
