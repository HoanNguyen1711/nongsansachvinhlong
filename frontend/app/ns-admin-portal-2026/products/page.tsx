"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Edit, Trash2, X, Upload, Check, AlertCircle } from "lucide-react";

interface Product {
  id: number;
  name: string;
  name_en?: string;
  name_zh?: string;
  slug: string;
  description: string;
  description_en?: string;
  description_zh?: string;
  price: number | null;
  original_price: number | null;
  image_url: string | null;
  category: string;
  is_available: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameZh, setNameZh] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionZh, setDescriptionZh] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
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
    if (!editingProduct) {
      setSlug(slugify(val));
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.get("/products");
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.get("/categories");
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setNameEn("");
    setNameZh("");
    setSlug("");
    setCategory(categories.length > 0 ? categories[0].name : "");
    setPrice("");
    setOriginalPrice("");
    setImageUrl("");
    setDescription("");
    setDescriptionEn("");
    setDescriptionZh("");
    setIsAvailable(true);
    setFormError(null);
    setActiveTab("vi");
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setNameEn(product.name_en || "");
    setNameZh(product.name_zh || "");
    setSlug(product.slug);
    setCategory(product.category);
    setPrice(product.price ? product.price.toString() : "");
    setOriginalPrice(product.original_price ? product.original_price.toString() : "");
    setImageUrl(product.image_url || "");
    setDescription(product.description || "");
    setDescriptionEn(product.description_en || "");
    setDescriptionZh(product.description_zh || "");
    setIsAvailable(product.is_available);
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
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Không thể xóa sản phẩm.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      name,
      name_en: nameEn || null,
      name_zh: nameZh || null,
      slug,
      category,
      price: price ? parseFloat(price) : null,
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      image_url: imageUrl || null,
      description: description || null,
      description_en: descriptionEn || null,
      description_zh: descriptionZh || null,
      is_available: isAvailable,
    };

    try {
      if (editingProduct) {
        const updated = await api.put(`/products/${editingProduct.id}`, payload);
        setProducts(products.map((p) => (p.id === editingProduct.id ? updated : p)));
      } else {
        const created = await api.post("/products", payload);
        setProducts([created, ...products]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Lưu thông tin sản phẩm thất bại.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Sản Phẩm</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách sản phẩm nông trại của bạn đang bán trực tuyến.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1 rounded-full bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-sm hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm sản phẩm</span>
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
                  <th className="px-6 py-4">Hình ảnh</th>
                  <th className="px-6 py-4">Tên sản phẩm</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Giá bán</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 shrink-0">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden border border-border flex items-center justify-center text-[10px] text-slate-400">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <span>Không ảnh</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        <div>
                          <span className="block text-sm leading-snug">{product.name}</span>
                          {product.name_en && (
                            <span className="block text-[10px] text-slate-400 font-normal">EN: {product.name_en}</span>
                          )}
                          {product.name_zh && (
                            <span className="block text-[10px] text-slate-400 font-normal">ZH: {product.name_zh}</span>
                          )}
                          <span className="block text-[10px] text-slate-400 font-normal mt-0.5">/{product.slug}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-amber-600">
                        {product.price ? `${product.price.toLocaleString("vi-VN")} đ` : "Liên hệ"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                          product.is_available ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}>
                          {product.is_available ? "Còn hàng" : "Hết hàng"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-primary transition-colors"
                          title="Sửa sản phẩm"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      Chưa có sản phẩm nào. Hãy bấm "Thêm sản phẩm" để bắt đầu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden border border-border shadow-lg flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-800">
                {editingProduct ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
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

              {/* Language Tabs Selector */}
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
                      <label className="text-xs font-bold text-slate-700">Tên sản phẩm *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        placeholder="Ví dụ: Bơ Sáp Đắk Lắk"
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
                        placeholder="Ví dụ: bo-sap-dak-lak"
                        className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Mô tả chi tiết</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Nhập mô tả sản phẩm bằng Tiếng Việt tại đây..."
                      rows={4}
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab: Tiếng Anh */}
              {activeTab === "en" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tên sản phẩm (Tiếng Anh)</label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="e.g. Premium Dak Lak Avocado"
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Mô tả chi tiết (Tiếng Anh)</label>
                    <textarea
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      placeholder="Enter English product description here..."
                      rows={4}
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab: Tiếng Trung */}
              {activeTab === "zh" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tên sản phẩm (Tiếng Trung)</label>
                    <input
                      type="text"
                      value={nameZh}
                      onChange={(e) => setNameZh(e.target.value)}
                      placeholder="例如：得乐省特级牛油果"
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Mô tả chi tiết (Tiếng Trung)</label>
                    <textarea
                      value={descriptionZh}
                      onChange={(e) => setDescriptionZh(e.target.value)}
                      placeholder="在这里输入中文产品描述..."
                      rows={4}
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Common Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Danh mục *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Giá bán (đ) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Để trống là 'Liên hệ'"
                    className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Giá gốc so sánh (đ)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Gạch ngang nếu KM"
                    className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Hình ảnh sản phẩm</label>
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
                      {uploadingImage ? "Đang xử lý & nén ảnh..." : "Kéo thả hoặc Click để tải ảnh"}
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

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="isAvailable" className="text-xs font-semibold text-slate-700">Sản phẩm còn hàng sẵn sàng bán</label>
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
                  <span>{editingProduct ? "Cập Nhật" : "Tạo Mới"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
