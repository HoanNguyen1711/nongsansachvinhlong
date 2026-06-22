"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Edit, Trash2, X, Tag, AlertCircle } from "lucide-react";

interface BlogCategory {
  id: number;
  name: string;
  name_en?: string;
  name_zh?: string;
  slug: string;
}

export default function AdminBlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [readonly, setReadonly] = useState(false);

  useEffect(() => {
    api.get("/auth/me")
      .then((me) => setReadonly(me.readonly))
      .catch((err) => console.error(err));
  }, []);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameZh, setNameZh] = useState("");
  const [slug, setSlug] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"vi" | "en" | "zh">("vi");

  // Auto-slugify Vietnamese text helper
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingCategory) {
      setSlug(slugify(val));
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.get("/blog-categories");
      setCategories(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách chuyên mục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setNameEn("");
    setNameZh("");
    setSlug("");
    setFormError(null);
    setActiveTab("vi");
    setIsModalOpen(true);
  };

  const openEditModal = (category: BlogCategory) => {
    setEditingCategory(category);
    setName(category.name);
    setNameEn(category.name_en || "");
    setNameZh(category.name_zh || "");
    setSlug(category.slug);
    setFormError(null);
    setActiveTab("vi");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chuyên mục này? LƯU Ý: Các bài viết thuộc chuyên mục này sẽ tự động trở về trạng thái không có chuyên mục.")) {
      return;
    }
    try {
      await api.delete(`/blog-categories/${id}`);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || "Không thể xóa chuyên mục.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      setFormError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    const payload = {
      name,
      name_en: nameEn || null,
      name_zh: nameZh || null,
      slug,
    };

    try {
      if (editingCategory) {
        const updated = await api.put(`/blog-categories/${editingCategory.id}`, payload);
        setCategories(categories.map((c) => (c.id === editingCategory.id ? updated : c)));
      } else {
        const created = await api.post("/blog-categories", payload);
        setCategories([...categories, created]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Lỗi lưu chuyên mục. Vui lòng kiểm tra lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Chuyên Mục Bài Viết</h1>
          <p className="text-slate-500 text-xs mt-1">
            Quản lý các chuyên mục phân loại câu chuyện nhà vườn và cẩm nang nông nghiệp.
          </p>
        </div>
        {!readonly && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-transform shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Chuyên Mục</span>
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start gap-3 text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}

      {/* Main Grid/Table */}
      <div className="rounded-3xl border border-border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Tên chuyên mục</th>
                <th className="px-6 py-4">Đường dẫn tĩnh (Slug)</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span className="text-slate-400 text-[11px]">Đang tải chuyên mục...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-50 p-2 text-primary">
                          <Tag className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-slate-800 font-bold block">{cat.name}</span>
                          {cat.name_en && (
                            <span className="text-[10px] text-slate-400 font-normal block">EN: {cat.name_en}</span>
                          )}
                          {cat.name_zh && (
                            <span className="text-[10px] text-slate-400 font-normal block">ZH: {cat.name_zh}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono">/{cat.slug}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!readonly ? (
                          <>
                            <button
                              onClick={() => openEditModal(cat)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Chỉ xem</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-slate-400">
                    Chưa có chuyên mục nào. Nhấp vào "Thêm Chuyên Mức" để tạo mới.
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
                {editingCategory ? "Chỉnh Sửa Chuyên Mục" : "Thêm Chuyên Mục Mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex border-b border-slate-100 gap-4 mt-4">
              <button
                type="button"
                onClick={() => setActiveTab("vi")}
                className={`pb-2 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === "vi" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("en")}
                className={`pb-2 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === "en" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("zh")}
                className={`pb-2 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === "zh" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                ZH
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-2xl bg-red-50 p-4 border border-red-100 text-xs font-semibold text-red-800">
                  {formError}
                </div>
              )}

              {/* Tab: VI */}
              {activeTab === "vi" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tên chuyên mục *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={handleNameChange}
                      placeholder="Ví dụ: Câu chuyện nhà nông"
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Đường dẫn tĩnh (Slug) *</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      placeholder="Ví dụ: cau-chuyen-nha-nong"
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Tab: EN */}
              {activeTab === "en" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tên chuyên mục (Tiếng Anh)</label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="e.g. Farmer's stories"
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab: ZH */}
              {activeTab === "zh" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tên chuyên mục (Tiếng Trung)</label>
                    <input
                      type="text"
                      value={nameZh}
                      onChange={(e) => setNameZh(e.target.value)}
                      placeholder="例如：农人故事"
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

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
                  {submitting ? "Đang lưu..." : editingCategory ? "Cập Nhật" : "Tạo Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
