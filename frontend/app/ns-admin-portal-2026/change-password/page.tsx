"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { Key, AlertCircle, CheckCircle } from "lucide-react";

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ các trường thông tin.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và mật khẩu xác nhận không khớp.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải chứa ít nhất 6 ký tự.");
      return;
    }

    if (newPassword === oldPassword) {
      setError("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
      return;
    }

    setSubmitting(true);
    try {
      await api.put("/users/change-password", {
        old_password: oldPassword,
        new_password: newPassword
      });
      setSuccess("Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Không thể đổi mật khẩu. Vui lòng kiểm tra lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Đổi Mật Khẩu</h1>
        <p className="text-slate-500 text-xs mt-1">
          Thay đổi mật khẩu đăng nhập tài khoản của bạn để bảo mật hệ thống.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="rounded-2xl bg-emerald-50 p-3 text-primary">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Thông tin mật khẩu</h2>
            <p className="text-[11px] text-slate-400">Các mật khẩu phải dài tối thiểu 6 ký tự.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start gap-3 text-red-800 animate-in fade-in slide-in-from-top-1 duration-150">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-2xl bg-green-50 p-4 border border-green-100 flex items-start gap-3 text-green-800 animate-in fade-in slide-in-from-top-1 duration-150">
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold">{success}</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Mật khẩu hiện tại *</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Mật khẩu mới *</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Xác nhận mật khẩu mới *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? "Đang xử lý..." : "Cập Nhật Mật Khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
