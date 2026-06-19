"use client";

import React, { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { Plus, Edit, Trash2, X, Upload, Check, AlertCircle, BookOpen } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 text-xs text-slate-500">
      Đang tải bộ soạn thảo...
    </div>
  ),
});

interface Blog {
  id: number;
  title: string;
  title_en?: string;
  title_zh?: string;
  slug: string;
  summary: string | null;
  summary_en?: string;
  summary_zh?: string;
  content: string;
  content_en?: string;
  content_zh?: string;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  tag?: string | null;
  tag_en?: string | null;
  tag_zh?: string | null;
  tag_color?: string | null;
  category?: string | null;
  category_en?: string | null;
  category_zh?: string | null;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleZh, setTitleZh] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryEn, setSummaryEn] = useState("");
  const [summaryZh, setSummaryZh] = useState("");
  const [content, setContent] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentZh, setContentZh] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [tag, setTag] = useState("");
  const [tagEn, setTagEn] = useState("");
  const [tagZh, setTagZh] = useState("");
  const [tagColor, setTagColor] = useState("emerald");
  const [category, setCategory] = useState("");
  const [categoryEn, setCategoryEn] = useState("");
  const [categoryZh, setCategoryZh] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"vi" | "en" | "zh">("vi");

  // Quill Editor Modules config with custom image handler
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: function (this: any) {
          const quill = this.quill;
          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", "image/*");
          input.click();

          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            // Size limit: 5MB
            if (file.size > 5 * 1024 * 1024) {
              alert("Dung lượng ảnh tối đa cho phép là 5MB.");
              return;
            }

            try {
              const data = await api.upload("/uploads", file);
              const url = data.url;

              const range = quill.getSelection();
              if (range) {
                quill.insertEmbed(range.index, "image", url);
                quill.setSelection(range.index + 1);
              } else {
                quill.insertEmbed(quill.getLength(), "image", url);
              }
            } catch (err: any) {
              alert(err.message || "Tải ảnh lên thất bại.");
            }
          };
        },
      },
    },
  }), []);

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!editingBlog) {
      setSlug(slugify(val));
    }
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await api.get("/blogs?only_published=false");
      setBlogs(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách bài viết.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openAddModal = () => {
    setEditingBlog(null);
    setTitle("");
    setTitleEn("");
    setTitleZh("");
    setSlug("");
    setSummary("");
    setSummaryEn("");
    setSummaryZh("");
    setContent("");
    setContentEn("");
    setContentZh("");
    setImageUrl("");
    setIsPublished(true);
    setTag("");
    setTagEn("");
    setTagZh("");
    setTagColor("emerald");
    setCategory("");
    setCategoryEn("");
    setCategoryZh("");
    setFormError(null);
    setActiveTab("vi");
    setIsModalOpen(true);
  };

  const openEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setTitleEn(blog.title_en || "");
    setTitleZh(blog.title_zh || "");
    setSlug(blog.slug);
    setSummary(blog.summary || "");
    setSummaryEn(blog.summary_en || "");
    setSummaryZh(blog.summary_zh || "");
    setContent(blog.content);
    setContentEn(blog.content_en || "");
    setContentZh(blog.content_zh || "");
    setImageUrl(blog.image_url || "");
    setIsPublished(blog.is_published);
    setTag(blog.tag || "");
    setTagEn(blog.tag_en || "");
    setTagZh(blog.tag_zh || "");
    setTagColor(blog.tag_color || "emerald");
    setCategory(blog.category || "");
    setCategoryEn(blog.category_en || "");
    setCategoryZh(blog.category_zh || "");
    setFormError(null);
    setActiveTab("vi");
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError(null);
    try {
      const data = await api.upload("/uploads", file);
      setImageUrl(data.url);
    } catch (err: any) {
      setFormError(err.message || "Tải ảnh thất bại.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
    try {
      await api.delete(`/blogs/${id}`);
      setBlogs(blogs.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.message || "Không thể xóa bài viết.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      title,
      title_en: titleEn || null,
      title_zh: titleZh || null,
      slug,
      summary: summary || null,
      summary_en: summaryEn || null,
      summary_zh: summaryZh || null,
      content,
      content_en: contentEn || null,
      content_zh: contentZh || null,
      image_url: imageUrl || null,
      is_published: isPublished,
      tag: tag || null,
      tag_en: tagEn || null,
      tag_zh: tagZh || null,
      tag_color: tagColor || "emerald",
      category: category || null,
      category_en: categoryEn || null,
      category_zh: categoryZh || null,
    };

    try {
      if (editingBlog) {
        const updated = await api.put(`/blogs/${editingBlog.id}`, payload);
        setBlogs(blogs.map((b) => (b.id === editingBlog.id ? updated : b)));
      } else {
        const created = await api.post("/blogs", payload);
        setBlogs([created, ...blogs]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Lưu bài viết thất bại.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Bài Viết</h1>
          <p className="text-xs text-slate-500 mt-1">Quản lý các câu chuyện nhà vườn và cẩm nang nông nghiệp.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1 rounded-full bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-sm hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm bài viết</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-xs text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-10 animate-pulse rounded-2xl bg-slate-200/60"></div>
          <div className="h-20 animate-pulse rounded-2xl bg-slate-200/60"></div>
          <div className="h-20 animate-pulse rounded-2xl bg-slate-200/60"></div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-border text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Bìa</th>
                  <th className="px-6 py-4">Tiêu đề bài viết</th>
                  <th className="px-6 py-4">Ngày đăng</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {blogs.length > 0 ? (
                  blogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 shrink-0">
                        <div className="h-12 w-20 rounded-xl bg-slate-100 overflow-hidden border border-border flex items-center justify-center text-[10px] text-slate-400">
                          {blog.image_url ? (
                            <img src={blog.image_url} alt={blog.title} className="h-full w-full object-cover" />
                          ) : (
                            <BookOpen className="h-6 w-6 text-slate-300" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        <div className="max-w-md">
                          <span className="block text-sm leading-snug truncate">{blog.title}</span>
                          {blog.title_en && (
                            <span className="block text-[10px] text-slate-400 font-normal truncate">EN: {blog.title_en}</span>
                          )}
                          {blog.title_zh && (
                            <span className="block text-[10px] text-slate-400 font-normal truncate">ZH: {blog.title_zh}</span>
                          )}
                          <span className="block text-[10px] text-slate-400 font-normal mt-0.5">/{blog.slug}</span>
                          
                          {/* Tags Display */}
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {blog.category && (
                              <span className="bg-slate-100 text-slate-800 border border-slate-200 rounded-full px-2 py-0.5 text-[9px] font-semibold">
                                Chuyên mục: {blog.category}
                              </span>
                            )}
                            {blog.category_en && (
                              <span className="bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-2 py-0.5 text-[9px]">
                                CM EN: {blog.category_en}
                              </span>
                            )}
                            {blog.category_zh && (
                              <span className="bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-2 py-0.5 text-[9px]">
                                CM ZH: {blog.category_zh}
                              </span>
                            )}
                            {blog.tag && (
                              <span className={`border rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                                blog.tag_color === "blue" ? "bg-blue-50 text-blue-700 border-blue-100" :
                                blog.tag_color === "amber" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                blog.tag_color === "rose" ? "bg-rose-50 text-rose-700 border-rose-100" :
                                blog.tag_color === "purple" ? "bg-purple-50 text-purple-700 border-purple-100" :
                                blog.tag_color === "slate" ? "bg-slate-50 text-slate-700 border-slate-100" :
                                "bg-emerald-50 text-emerald-700 border-emerald-100"
                              }`}>
                                {blog.tag}
                              </span>
                            )}
                            {blog.tag_en && (
                              <span className="bg-slate-50 text-slate-600 border border-slate-200 rounded-full px-2 py-0.5 text-[9px]">
                                EN: {blog.tag_en}
                              </span>
                            )}
                            {blog.tag_zh && (
                              <span className="bg-slate-50 text-slate-600 border border-slate-200 rounded-full px-2 py-0.5 text-[9px]">
                                ZH: {blog.tag_zh}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(blog.created_at).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                          blog.is_published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"
                        }`}>
                          {blog.is_published ? "Đã đăng" : "Bản nháp"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(blog)}
                          className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-primary transition-colors"
                          title="Sửa bài viết"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-400">
                      Chưa có bài viết nào. Hãy bấm "Thêm bài viết" để bắt đầu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Blog Form Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl overflow-hidden border border-border shadow-lg flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-800">
                {editingBlog ? "Chỉnh Sửa Bài Viết" : "Tạo Bài Viết Mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-xs text-red-700 border border-red-100">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Language Tabs */}
              <div className="flex border-b border-slate-100 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("vi")}
                  className={`pb-2 text-xs font-bold border-b-2 transition-colors ${
                    activeTab === "vi" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Tiếng Việt (Gốc)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("en")}
                  className={`pb-2 text-xs font-bold border-b-2 transition-colors ${
                    activeTab === "en" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Tiếng Anh (English)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("zh")}
                  className={`pb-2 text-xs font-bold border-b-2 transition-colors ${
                    activeTab === "zh" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Tiếng Trung (中文)
                </button>
              </div>

              {/* Tab: Tiếng Việt */}
              {activeTab === "vi" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Tiêu đề bài viết *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Ví dụ: Bí quyết chọn bơ sáp thơm ngon"
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
                        placeholder="Ví dụ: bi-quyet-chon-bo-sap"
                        className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Chuyên mục bài viết (Ví dụ: Câu chuyện nhà nông)</label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Ví dụ: Câu chuyện nhà nông"
                        className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Nhãn / Tag bài viết (Ví dụ: Kinh nghiệm làm nông)</label>
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        placeholder="Ví dụ: Kinh nghiệm làm nông"
                        className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tóm tắt ngắn bài viết *</label>
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Nhập tóm tắt ngắn hiển thị ở trang danh sách..."
                      rows={2}
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nội dung chi tiết *</label>
                    <div className="quill-editor-wrapper">
                      <ReactQuill
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        placeholder="Nhập nội dung bài viết chi tiết tại đây..."
                        theme="snow"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Tiếng Anh */}
              {activeTab === "en" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tiêu đề bài viết (Tiếng Anh)</label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="e.g. Tips to select delicious avocados"
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Chuyên mục bài viết (Tiếng Anh)</label>
                      <input
                        type="text"
                        value={categoryEn}
                        onChange={(e) => setCategoryEn(e.target.value)}
                        placeholder="e.g. Farmer Stories"
                        className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Nhãn / Tag bài viết (Tiếng Anh)</label>
                      <input
                        type="text"
                        value={tagEn}
                        onChange={(e) => setTagEn(e.target.value)}
                        placeholder="e.g. Farmer's Experience"
                        className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tóm tắt ngắn (Tiếng Anh)</label>
                    <textarea
                      value={summaryEn}
                      onChange={(e) => setSummaryEn(e.target.value)}
                      placeholder="Enter short English summary..."
                      rows={2}
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nội dung chi tiết (Tiếng Anh)</label>
                    <div className="quill-editor-wrapper">
                      <ReactQuill
                        value={contentEn}
                        onChange={setContentEn}
                        modules={modules}
                        placeholder="Enter detailed English content here..."
                        theme="snow"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Tiếng Trung */}
              {activeTab === "zh" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tiêu đề bài viết (Tiếng Trung)</label>
                    <input
                      type="text"
                      value={titleZh}
                      onChange={(e) => setTitleZh(e.target.value)}
                      placeholder="例如：挑选美味牛油果的秘诀"
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Chuyên mục bài viết (Tiếng Trung)</label>
                      <input
                        type="text"
                        value={categoryZh}
                        onChange={(e) => setCategoryZh(e.target.value)}
                        placeholder="例如：农人故事"
                        className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Nhãn / Tag bài viết (Tiếng Trung)</label>
                      <input
                        type="text"
                        value={tagZh}
                        onChange={(e) => setTagZh(e.target.value)}
                        placeholder="例如：农人经验"
                        className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tóm tắt ngắn (Tiếng Trung)</label>
                    <textarea
                      value={summaryZh}
                      onChange={(e) => setSummaryZh(e.target.value)}
                      placeholder="在此输入中文文章简短摘要..."
                      rows={2}
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nội dung chi tiết (Tiếng Trung)</label>
                    <div className="quill-editor-wrapper">
                      <ReactQuill
                        value={contentZh}
                        onChange={setContentZh}
                        modules={modules}
                        placeholder="在这里输入中文详细内容..."
                        theme="snow"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Image Upload Area (Common) */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700">Ảnh bìa bài viết</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="relative border border-dashed border-slate-300 hover:border-primary rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-50/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploadingImage}
                    />
                    <Upload className="h-6 w-6 text-slate-400" />
                    <span className="text-[10px] text-slate-500">
                      {uploadingImage ? "Đang xử lý ảnh..." : "Kéo thả hoặc Click để tải ảnh bìa"}
                    </span>
                  </div>
                  
                  {imageUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-border bg-slate-100 h-24 flex items-center justify-center max-w-[200px]">
                      <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tag Color Select (Common) */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700">Màu sắc của Tag</label>
                <div className="flex gap-3">
                  {[
                    { id: "emerald", name: "Xanh lá", class: "bg-emerald-500 ring-emerald-500/20" },
                    { id: "blue", name: "Xanh dương", class: "bg-blue-500 ring-blue-500/20" },
                    { id: "amber", name: "Vàng cam", class: "bg-amber-500 ring-amber-500/20" },
                    { id: "rose", name: "Đỏ hồng", class: "bg-rose-500 ring-rose-500/20" },
                    { id: "purple", name: "Tím", class: "bg-purple-500 ring-purple-500/20" },
                    { id: "slate", name: "Xám", class: "bg-slate-500 ring-slate-500/20" },
                  ].map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setTagColor(color.id)}
                      className={`h-6 w-6 rounded-full transition-all ${color.class} ${
                        tagColor === color.id ? "ring-4 scale-110 shadow-sm" : "hover:scale-105 opacity-80"
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="isPublished" className="text-xs font-semibold text-slate-700">Công khai bài viết ngay sau khi lưu</label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-border px-6 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                >
                  <Check className="h-4 w-4" />
                  <span>{editingBlog ? "Cập Nhật" : "Lưu Bài Viết"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
