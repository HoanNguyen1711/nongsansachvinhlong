"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Trash2, X, AlertCircle, Shield, User, Pencil } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
  role: string;
  readonly: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  // Form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("content_editor");
  const [readonly, setReadonly] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, meData] = await Promise.all([
        api.get("/users"),
        api.get("/auth/me")
      ]);
      setUsers(usersData);
      setCurrentUser(meData);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setRole("content_editor");
    setReadonly(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (userItem: UserProfile) => {
    setIsEditing(true);
    setEditingUserId(userItem.id);
    setUsername(userItem.username);
    setPassword("");
    setConfirmPassword("");
    setRole(userItem.role);
    setReadonly(userItem.readonly);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleRoleChange = (selectedRole: string) => {
    setRole(selectedRole);
    if (selectedRole === "super_admin") {
      setReadonly(false);
    }
  };

  const handleDelete = async (user: UserProfile) => {
    if (user.id === currentUser?.id) {
      alert("Bạn không thể tự xóa tài khoản của chính mình.");
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.username}"?`)) {
      return;
    }
    try {
      await api.delete(`/users/${user.id}`);
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (err: any) {
      alert(err.message || "Không thể xóa tài khoản.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      if (!username) {
        setFormError("Tên đăng nhập không được để trống.");
        return;
      }
      if (password) {
        if (password !== confirmPassword) {
          setFormError("Mật khẩu xác nhận không khớp.");
          return;
        }
        if (password.length < 6) {
          setFormError("Mật khẩu phải chứa ít nhất 6 ký tự.");
          return;
        }
      }
    } else {
      if (!username || !password || !confirmPassword) {
        setFormError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
        return;
      }
      if (password !== confirmPassword) {
        setFormError("Mật khẩu xác nhận không khớp.");
        return;
      }
      if (password.length < 6) {
        setFormError("Mật khẩu phải chứa ít nhất 6 ký tự.");
        return;
      }
    }

    setSubmitting(true);
    setFormError(null);

    // Coerce readonly to false if role is super_admin
    const finalReadonly = role === "super_admin" ? false : readonly;

    const payload: any = { role, readonly: finalReadonly };
    if (!isEditing) {
      payload.username = username;
      payload.password = password;
    } else if (password) {
      payload.password = password;
    }

    try {
      if (isEditing && editingUserId) {
        const updated = await api.put(`/users/${editingUserId}`, payload);
        setUsers(users.map((u) => (u.id === editingUserId ? updated : u)));
      } else {
        const created = await api.post("/users", payload);
        setUsers([...users, created]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || (isEditing ? "Lỗi cập nhật tài khoản." : "Lỗi tạo tài khoản. Vui lòng kiểm tra lại."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản Lý Nhân Viên</h1>
          <p className="text-slate-500 text-xs mt-1">
            Danh sách nhân viên quản lý website và phân quyền truy cập.
          </p>
        </div>
        {!currentUser?.readonly && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-transform shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Nhân Viên</span>
          </button>
        )}
      </div>

      {/* Error block */}
      {error && (
        <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start gap-3 text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}

      {/* Main Grid/Table */}
      <div className="rounded-3xl border border-border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Tên đăng nhập</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Chế độ</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span className="text-slate-400 text-[11px]">Đang tải danh sách tài khoản...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl p-2 ${userItem.is_superuser ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-primary'}`}>
                          {userItem.is_superuser ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </div>
                        <span className="text-slate-800 font-bold">
                          {userItem.username}
                          {userItem.id === currentUser?.id && (
                            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                              Bạn
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold leading-5 ${
                        userItem.role === "super_admin" ? "bg-amber-100 text-amber-800" :
                        userItem.role === "admin" ? "bg-blue-100 text-blue-800" :
                        userItem.role === "product_manager" ? "bg-emerald-100 text-emerald-800" :
                        "bg-slate-100 text-slate-800"
                      }`}>
                        {userItem.role === "super_admin" ? "Quản trị tối cao" :
                         userItem.role === "admin" ? "Quản trị viên" :
                         userItem.role === "product_manager" ? "Quản lý sản phẩm" :
                         "Biên tập viên"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold leading-5 ${
                        userItem.readonly ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                      }`}>
                        {userItem.readonly ? "Chỉ xem (Read-only)" : "Đọc & Ghi"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold leading-5 ${
                        userItem.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {userItem.is_active ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {userItem.id !== currentUser?.id && !currentUser?.readonly && (
                          <>
                            <button
                              onClick={() => openEditModal(userItem)}
                              className="rounded-lg p-1.5 text-primary hover:bg-emerald-50 transition-colors"
                              title="Chỉnh sửa tài khoản"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(userItem)}
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                    Chưa có tài khoản nào khác.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-800">
                {isEditing ? "Chỉnh Sửa Nhân Viên" : "Thêm Nhân Viên Mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {formError && (
                <div className="rounded-2xl bg-red-50 p-4 border border-red-100 text-xs font-semibold text-red-800">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tên đăng nhập *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  required
                  disabled={isEditing}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isEditing ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu *"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditing ? "Nhập mật khẩu mới" : "Nhập mật khẩu (tối thiểu 6 ký tự)"}
                  className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                  required={!isEditing}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isEditing ? "Xác nhận mật khẩu mới" : "Xác nhận mật khẩu *"}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isEditing ? "Xác nhận mật khẩu mới" : "Nhập lại mật khẩu"}
                  className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                  required={!isEditing || !!password}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Vai trò *</label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                  required
                >
                  <option value="admin">Quản trị viên (Admin)</option>
                  <option value="product_manager">Quản lý sản phẩm</option>
                  <option value="content_editor">Biên tập viên nội dung</option>
                  <option value="super_admin">Quản trị tối cao (Super Admin)</option>
                </select>
              </div>

              <div className={`flex items-center gap-2 py-2 ${role === "super_admin" ? "opacity-50 cursor-not-allowed" : ""}`}>
                <input
                  type="checkbox"
                  id="readonly-checkbox"
                  checked={role === "super_admin" ? false : readonly}
                  onChange={(e) => setReadonly(e.target.checked)}
                  disabled={role === "super_admin"}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="readonly-checkbox"
                  className={`text-xs font-bold text-slate-700 select-none ${role === "super_admin" ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  Chỉ xem (Read-only) - Không được phép Sửa/Thêm/Xóa {role === "super_admin" && "(Không áp dụng cho Super Admin)"}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-border bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-transform disabled:opacity-50"
                >
                  {submitting ? (isEditing ? "Đang cập nhật..." : "Đang tạo...") : (isEditing ? "Cập Nhật" : "Tạo Mới")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
