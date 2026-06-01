"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api, getAuthToken, logoutAdmin } from "@/lib/api";
import { LayoutDashboard, ShoppingBag, BookOpen, LogOut, Home, Leaf, ShieldAlert, Tag, Settings, Users, Key, MessageSquare } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/ns-login-portal-2026");
    } else {
      api.get("/auth/me")
        .then((userData: UserProfile) => {
          setUser(userData);
          setAuthorized(true);
        })
        .catch(() => {
          logoutAdmin();
        });
    }
  }, [router]);

  useEffect(() => {
    if (authorized && user && pathname === "/ns-admin-portal-2026/users" && !user.is_superuser) {
      router.push("/ns-admin-portal-2026");
    }
  }, [authorized, user, pathname, router]);

  if (!authorized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-xs text-slate-500">Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: "Tổng quan", path: "/ns-admin-portal-2026", icon: LayoutDashboard },
    { name: "Quản lý sản phẩm", path: "/ns-admin-portal-2026/products", icon: ShoppingBag },
    { name: "Danh mục sản phẩm", path: "/ns-admin-portal-2026/categories", icon: Tag },
    { name: "Quản lý bài viết", path: "/ns-admin-portal-2026/blogs", icon: BookOpen },
    { name: "Ý kiến khách hàng", path: "/ns-admin-portal-2026/testimonials", icon: MessageSquare },
    { name: "Cấu hình hệ thống", path: "/ns-admin-portal-2026/settings", icon: Settings },
  ];

  if (user.is_superuser) {
    menuItems.push({ name: "Quản lý nhân viên", path: "/ns-admin-portal-2026/users", icon: Users });
  }

  menuItems.push({ name: "Đổi mật khẩu", path: "/ns-admin-portal-2026/change-password", icon: Key });

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-white flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="p-6 space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2 font-bold text-primary">
            <Leaf className="h-6 w-6 text-primary" />
            <span>Nông Sản Admin</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Bottom */}
        <div className="p-6 border-t border-slate-100 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Xem trang web</span>
          </Link>
          <button
            onClick={logoutAdmin}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="h-16 bg-white border-b border-border px-6 flex items-center justify-between md:hidden shrink-0">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="text-sm">Admin Panel</span>
          </div>
          
          <div className="flex gap-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`p-1.5 rounded-lg ${pathname === item.path ? "text-primary bg-slate-100" : "text-slate-500"}`}
                title={item.name}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
            <button onClick={logoutAdmin} className="text-red-500 p-1.5" title="Đăng xuất">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page children wrapper */}
        <main className="flex-grow p-6 sm:p-10 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
