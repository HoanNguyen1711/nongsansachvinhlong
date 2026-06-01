"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setAuthToken, getAuthToken } from "@/lib/api";
import { Leaf, Lock, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (getAuthToken()) {
      router.push("/ns-admin-portal-2026");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!res.ok) {
        let errMsg = "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
        try {
          const errData = await res.json();
          errMsg = errData.detail || errMsg;
        } catch {
          // ignore
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      setAuthToken(data.access_token);
      router.push("/ns-admin-portal-2026");
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-3xl border border-border shadow-sm">
        {/* Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="rounded-full bg-emerald-50 p-3 text-primary">
            <Leaf className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Hệ Thống Quản Trị</h1>
          <p className="text-xs text-slate-500">Đăng nhập tài khoản để quản lý sản phẩm & bài viết</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-xs text-red-700 border border-red-100">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Tên đăng nhập</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập..."
                className="w-full rounded-2xl border border-border bg-slate-50 py-3 pl-11 pr-4 text-xs focus:border-primary focus:bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Mật khẩu</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full rounded-2xl border border-border bg-slate-50 py-3 pl-11 pr-4 text-xs focus:border-primary focus:bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary py-3.5 text-xs font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? "Đang xác thực..." : "Đăng Nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
