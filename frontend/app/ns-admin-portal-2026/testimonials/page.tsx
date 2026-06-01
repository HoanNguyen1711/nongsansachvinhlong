"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Edit, Trash2, X, AlertCircle, Star, MessageSquare, Upload } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  content: string;
  content_en?: string;
  content_zh?: string;
  rating: number;
  region: string | null;
  region_en?: string;
  region_zh?: string;
  avatar_url: string | null;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentZh, setContentZh] = useState("");
  const [rating, setRating] = useState(5);
  const [region, setRegion] = useState("");
  const [regionEn, setRegionEn] = useState("");
  const [regionZh, setRegionZh] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"vi" | "en" | "zh">("vi");

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const data = await api.get("/testimonials");
      setTestimonials(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách ý kiến đóng góp.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openAddModal = () => {
    setEditingTestimonial(null);
    setName("");
    setContent("");
    setContentEn("");
    setContentZh("");
    setRating(5);
    setRegion("");
    setRegionEn("");
    setRegionZh("");
    setAvatarUrl("");
    setImageError(null);
    setFormError(null);
    setActiveTab("vi");
    setIsModalOpen(true);
  };

  const openEditModal = (t: Testimonial) => {
    setEditingTestimonial(t);
    setName(t.name);
    setContent(t.content);
    setContentEn(t.content_en || "");
    setContentZh(t.content_zh || "");
    setRating(t.rating);
    setRegion(t.region || "");
    setRegionEn(t.region_en || "");
    setRegionZh(t.region_zh || "");
    setAvatarUrl(t.avatar_url || "");
    setImageError(null);
    setFormError(null);
    setActiveTab("vi");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ý kiến khách hàng này?")) {
      return;
    }
    try {
      await api.delete(`/testimonials/${id}`);
      setTestimonials(testimonials.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.message || "Không thể xóa ý kiến.");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingImage(true);
      setImageError(null);
      try {
        const response = await api.upload("/uploads", file);
        setAvatarUrl(response.url);
      } catch (err: any) {
        setImageError(err.message || "Tải ảnh thất bại.");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) {
      setFormError("Vui lòng điền đầy đủ tên và nội dung đánh giá bằng tiếng Việt.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      name,
      content,
      content_en: contentEn || null,
      content_zh: contentZh || null,
      rating,
      region: region || null,
      region_en: regionEn || null,
      region_zh: regionZh || null,
      avatar_url: avatarUrl || null,
    };

    try {
      if (editingTestimonial) {
        const updated = await api.put(`/testimonials/${editingTestimonial.id}`, payload);
        setTestimonials(testimonials.map((t) => (t.id === editingTestimonial.id ? updated : t)));
      } else {
        const created = await api.post("/testimonials", payload);
        setTestimonials([...testimonials, created]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Lỗi lưu đánh giá. Vui lòng kiểm tra lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Ý Kiến Khách Hàng</h1>
          <p className="text-slate-500 text-xs mt-1">
            Quản lý các phản hồi, đánh giá từ khách hàng hiển thị trên website.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-transform shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm Đánh Giá</span>
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start gap-3 text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}

      {/* Main Grid/Table */}
      <div className="rounded-3xl border border-border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Khu vực</th>
                <th className="px-6 py-4">Đánh giá</th>
                <th className="px-6 py-4">Nội dung</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span className="text-slate-400 text-[11px]">Đang tải đánh giá...</span>
                    </div>
                  </td>
                </tr>
              ) : testimonials.length > 0 ? (
                testimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden border border-border flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                          {t.avatar_url ? (
                            <img src={t.avatar_url} alt={t.name} className="h-full w-full object-cover" />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-slate-300" />
                          )}
                        </div>
                        <span className="text-slate-800 font-bold">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="block font-semibold text-slate-700">{t.region || "Chưa có"}</span>
                        {t.region_en && <span className="block text-[9px] text-slate-400">EN: {t.region_en}</span>}
                        {t.region_zh && <span className="block text-[9px] text-slate-400">ZH: {t.region_zh}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`h-3 w-3 ${idx < t.rating ? "fill-current" : "text-slate-200"}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate" title={t.content}>
                        <span className="block font-medium text-slate-800">{t.content}</span>
                        {t.content_en && <span className="block text-[9px] text-slate-400 truncate">EN: {t.content_en}</span>}
                        {t.content_zh && <span className="block text-[9px] text-slate-400 truncate">ZH: {t.content_zh}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(t)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                          title="Sửa đánh giá"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors"
                          title="Xóa đánh giá"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                    Chưa có đánh giá nào. Hãy nhấp vào "Thêm Đánh Giá" để tạo mới.
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
          <div className="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <h2 className="text-lg font-black text-slate-800">
                {editingTestimonial ? "Chỉnh Sửa Đánh Giá" : "Thêm Đánh Giá Mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex border-b border-slate-100 gap-4 mt-4 shrink-0">
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

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 flex-1 overflow-y-auto pr-1">
              {formError && (
                <div className="rounded-2xl bg-red-50 p-4 border border-red-100 text-xs font-semibold text-red-800 shrink-0">
                  {formError}
                </div>
              )}

              {/* Tab: VI */}
              {activeTab === "vi" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Khu vực/Địa chỉ khách hàng (Tiếng Việt)</label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="Ví dụ: Quận 1, TP.HCM"
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nội dung đánh giá (Tiếng Việt) *</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Nhập nội dung khách hàng nhận xét..."
                      rows={4}
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
                    <label className="text-xs font-bold text-slate-700">Khu vực/Địa chỉ khách hàng (Tiếng Anh)</label>
                    <input
                      type="text"
                      value={regionEn}
                      onChange={(e) => setRegionEn(e.target.value)}
                      placeholder="e.g. District 1, HCMC"
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nội dung đánh giá (Tiếng Anh)</label>
                    <textarea
                      value={contentEn}
                      onChange={(e) => setContentEn(e.target.value)}
                      placeholder="Enter English evaluation..."
                      rows={4}
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab: ZH */}
              {activeTab === "zh" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Khu vực/Địa chỉ khách hàng (Tiếng Trung)</label>
                    <input
                      type="text"
                      value={regionZh}
                      onChange={(e) => setRegionZh(e.target.value)}
                      placeholder="例如：胡志明市第一区"
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nội dung đánh giá (Tiếng Trung)</label>
                    <textarea
                      value={contentZh}
                      onChange={(e) => setContentZh(e.target.value)}
                      placeholder="在这里输入中文评价内容..."
                      rows={4}
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Common Fields */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tên khách hàng *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Chị Mai Anh"
                    className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Số sao đánh giá *</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                  >
                    <option value={5}>5 Sao (Xuất sắc)</option>
                    <option value={4}>4 Sao (Tốt)</option>
                    <option value={3}>3 Sao (Bình thường)</option>
                    <option value={2}>2 Sao (Tệ)</option>
                    <option value={1}>1 Sao (Rất tệ)</option>
                  </select>
                </div>

                {/* Avatar Image Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Ảnh đại diện khách hàng (Avatar)</label>
                  <div className="flex items-center gap-4">
                    <div className="relative border border-dashed border-slate-300 hover:border-primary rounded-2xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer bg-slate-50 hover:bg-slate-50/50 transition-colors flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadingImage}
                      />
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-[10px] text-slate-500">
                        {uploadingImage ? "Đang tải ảnh..." : "Chọn ảnh đại diện"}
                      </span>
                    </div>

                    {avatarUrl && (
                      <div className="relative h-16 w-16 rounded-full overflow-hidden border border-border shrink-0">
                        <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setAvatarUrl("")}
                          className="absolute inset-0 bg-black/45 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {imageError && <p className="text-[10px] text-red-500 font-medium">{imageError}</p>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6 shrink-0">
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
                  {submitting ? "Đang lưu..." : editingTestimonial ? "Cập Nhật" : "Tạo Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
