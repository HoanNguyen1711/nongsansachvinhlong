"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Settings, Save, CheckCircle, AlertCircle, Upload, X } from "lucide-react";

export default function AdminSettingsPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [farmImageUrl, setFarmImageUrl] = useState("");
  const [zaloQrUrl, setZaloQrUrl] = useState("");
  const [bannerImageUrl1, setBannerImageUrl1] = useState("");
  const [bannerImageUrl2, setBannerImageUrl2] = useState("");
  const [bannerImageUrl3, setBannerImageUrl3] = useState("");
  const [homepageLayout, setHomepageLayout] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFarm, setUploadingFarm] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [uploadingBanner1, setUploadingBanner1] = useState(false);
  const [uploadingBanner2, setUploadingBanner2] = useState(false);
  const [uploadingBanner3, setUploadingBanner3] = useState(false);
  const [readonly, setReadonly] = useState(false);

  useEffect(() => {
    api.get("/auth/me")
      .then((me) => setReadonly(me.readonly))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await api.get("/settings");
        if (data) {
          setPhoneNumber(data.phone_number || "");
          setAddress(data.address || "");
          setEmail(data.email || "");
          setFarmImageUrl(data.farm_image_url || "");
          setZaloQrUrl(data.zalo_qr_url || "");
          setBannerImageUrl1(data.banner_image_url_1 || "");
          setBannerImageUrl2(data.banner_image_url_2 || "");
          setBannerImageUrl3(data.banner_image_url_3 || "");
          setHomepageLayout(data.homepage_layout || "default");
        }
      } catch (err: any) {
        setError(err.message || "Không thể tải cấu hình hệ thống.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleUploadFarmImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFarm(true);
    setError(null);
    try {
      const data = await api.upload("/uploads", file);
      setFarmImageUrl(data.url);
    } catch (err: any) {
      setError(err.message || "Tải ảnh nông trại thất bại.");
    } finally {
      setUploadingFarm(false);
    }
  };

  const handleUploadQrCode = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    setError(null);
    try {
      const data = await api.upload("/uploads", file);
      setZaloQrUrl(data.url);
    } catch (err: any) {
      setError(err.message || "Tải mã QR Zalo thất bại.");
    } finally {
      setUploadingQr(false);
    }
  };

  const handleUploadBanner1 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner1(true);
    setError(null);
    try {
      const data = await api.upload("/uploads", file);
      setBannerImageUrl1(data.url);
    } catch (err: any) {
      setError(err.message || "Tải ảnh banner 1 thất bại.");
    } finally {
      setUploadingBanner1(false);
    }
  };

  const handleUploadBanner2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner2(true);
    setError(null);
    try {
      const data = await api.upload("/uploads", file);
      setBannerImageUrl2(data.url);
    } catch (err: any) {
      setError(err.message || "Tải ảnh banner 2 thất bại.");
    } finally {
      setUploadingBanner2(false);
    }
  };

  const handleUploadBanner3 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner3(true);
    setError(null);
    try {
      const data = await api.upload("/uploads", file);
      setBannerImageUrl3(data.url);
    } catch (err: any) {
      setError(err.message || "Tải ảnh banner 3 thất bại.");
    } finally {
      setUploadingBanner3(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !address || !email) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const payload = {
      phone_number: phoneNumber,
      address: address,
      email: email,
      farm_image_url: farmImageUrl,
      zalo_qr_url: zaloQrUrl,
      banner_image_url_1: bannerImageUrl1,
      banner_image_url_2: bannerImageUrl2,
      banner_image_url_3: bannerImageUrl3,
      homepage_layout: homepageLayout,
    };

    try {
      await api.put("/settings/", payload);
      setSuccess("Cập nhật cấu hình hệ thống thành công!");
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Lỗi cập nhật cấu hình hệ thống.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Cấu Hình Hệ Thống</h1>
        <p className="text-slate-500 text-xs mt-1">
          Thiết lập các thông tin liên hệ và cài đặt chung cho toàn bộ website.
        </p>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100 flex items-start gap-3 text-emerald-800">
          <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold">{success}</p>
        </div>
      )}

      {/* Error block */}
      {error && (
        <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start gap-3 text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-border">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="text-slate-400 text-[11px] mt-2">Đang tải cấu hình...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-border p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-2xl bg-emerald-50 p-3 text-primary">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Cài Đặt Liên Hệ</h2>
              <p className="text-slate-400 text-[10px]">
                Số điện thoại liên hệ hotline và liên kết chat Zalo nhanh.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Số điện thoại Hotline / Zalo *</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ví dụ: 0901234567"
                className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Số điện thoại này sẽ tự động cập nhật trên toàn bộ các vị trí hiển thị ở trang chủ, chân trang, đầu trang, các nút bấm gọi điện và liên kết chat Zalo nhanh.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Địa chỉ liên hệ *</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ví dụ: 123 Đường Phan Chu Trinh, TP. Buôn Ma Thuột, Đắk Lắk"
                className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Địa chỉ này sẽ hiển thị ở trang liên hệ và chân trang (footer) của website.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Địa chỉ Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ví dụ: contact@nongsansach.vn"
                className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Email này sẽ hiển thị ở trang liên hệ và chân trang (footer) của website.
              </p>
            </div>

            {/* Farm Image Setting */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="font-bold text-slate-800 text-xs">Hình ảnh Nông Trại Đắk Lắk</h3>
              <p className="text-[10px] text-slate-400">Ảnh chụp nông trại hiển thị tại phần giới thiệu trang chủ và trang Về chúng tôi.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="relative border border-dashed border-slate-300 hover:border-primary rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-50/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadFarmImage}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploadingFarm}
                  />
                  <Upload className="h-6 w-6 text-slate-400" />
                  <span className="text-[10px] text-slate-500">
                    {uploadingFarm ? "Đang tải lên..." : "Kéo thả hoặc Click để tải ảnh nông trại"}
                  </span>
                </div>
                {farmImageUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-border bg-slate-100 h-24 flex items-center justify-center max-w-[200px]">
                    <img src={farmImageUrl} alt="Farm preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFarmImageUrl("")}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Zalo QR Code Setting */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="font-bold text-slate-800 text-xs">Mã QR Zalo Nhận Ưu Đãi</h3>
              <p className="text-[10px] text-slate-400">Hình ảnh mã QR Zalo hiển thị ở khối Kêu gọi hành động (CTA) cuối trang chủ.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="relative border border-dashed border-slate-300 hover:border-primary rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-50/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadQrCode}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploadingQr}
                  />
                  <Upload className="h-6 w-6 text-slate-400" />
                  <span className="text-[10px] text-slate-500">
                    {uploadingQr ? "Đang tải lên..." : "Kéo thả hoặc Click để tải ảnh mã QR"}
                  </span>
                </div>
                {zaloQrUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-border bg-slate-100 h-24 flex items-center justify-center max-w-[200px]">
                    <img src={zaloQrUrl} alt="Zalo QR preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setZaloQrUrl("")}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Banner Images Setting */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="font-bold text-slate-800 text-xs">Hình ảnh Banner Trang Chủ</h3>
              <p className="text-[10px] text-slate-400">Tải lên tối đa 3 hình ảnh làm banner trượt cho trang chủ.</p>
              
              <div className="space-y-4">
                {/* Banner 1 */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-600">Hình ảnh Banner 1 (Sầu Riêng)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="relative border border-dashed border-slate-300 hover:border-primary rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-50/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadBanner1}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadingBanner1}
                      />
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-[10px] text-slate-500">
                        {uploadingBanner1 ? "Đang tải lên..." : "Kéo thả hoặc Click để tải ảnh Banner 1"}
                      </span>
                    </div>
                    {bannerImageUrl1 && (
                      <div className="relative rounded-2xl overflow-hidden border border-border bg-slate-100 h-24 flex items-center justify-center max-w-[200px]">
                        <img src={bannerImageUrl1} alt="Banner 1 preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setBannerImageUrl1("")}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Banner 2 */}
                <div className="space-y-2 pt-2 border-t border-slate-50">
                  <span className="text-[11px] font-bold text-slate-600">Hình ảnh Banner 2 (Bưởi Da Xanh)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="relative border border-dashed border-slate-300 hover:border-primary rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-50/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadBanner2}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadingBanner2}
                      />
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-[10px] text-slate-500">
                        {uploadingBanner2 ? "Đang tải lên..." : "Kéo thả hoặc Click để tải ảnh Banner 2"}
                      </span>
                    </div>
                    {bannerImageUrl2 && (
                      <div className="relative rounded-2xl overflow-hidden border border-border bg-slate-100 h-24 flex items-center justify-center max-w-[200px]">
                        <img src={bannerImageUrl2} alt="Banner 2 preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setBannerImageUrl2("")}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Banner 3 */}
                <div className="space-y-2 pt-2 border-t border-slate-50">
                  <span className="text-[11px] font-bold text-slate-600">Hình ảnh Banner 3 (Chôm Chôm)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="relative border border-dashed border-slate-300 hover:border-primary rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-50/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadBanner3}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadingBanner3}
                      />
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-[10px] text-slate-500">
                        {uploadingBanner3 ? "Đang tải lên..." : "Kéo thả hoặc Click để tải ảnh Banner 3"}
                      </span>
                    </div>
                    {bannerImageUrl3 && (
                      <div className="relative rounded-2xl overflow-hidden border border-border bg-slate-100 h-24 flex items-center justify-center max-w-[200px]">
                        <img src={bannerImageUrl3} alt="Banner 3 preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setBannerImageUrl3("")}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Homepage Layout Setting */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="font-bold text-slate-800 text-xs">Bố Cục Trang Chủ (Layout)</h3>
              <p className="text-[10px] text-slate-400">Chọn bố cục hiển thị trang chủ phù hợp với phong cách thương hiệu của bạn.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Default Layout Card */}
                <div 
                  onClick={() => setHomepageLayout("default")}
                  className={`border rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer transition-all hover:shadow-sm ${
                    homepageLayout === "default" 
                      ? "border-primary bg-emerald-50/30 ring-2 ring-primary/10" 
                      : "border-border bg-slate-50 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="h-2 w-full rounded bg-emerald-700 mb-2"></div>
                  <div className="h-10 w-full rounded bg-slate-200 mb-2 flex items-center justify-center text-[10px] font-bold text-slate-400">Slider + Banner</div>
                  <span className="text-[11px] font-bold text-slate-800">Cổ Điển / Trang Trại</span>
                  <span className="text-[9px] text-slate-400 mt-1">Slider hình ảnh, quy trình trồng và câu chuyện nhà nông.</span>
                </div>

                {/* Modern Grid Layout Card */}
                <div 
                  onClick={() => setHomepageLayout("grid")}
                  className={`border rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer transition-all hover:shadow-sm ${
                    homepageLayout === "grid" 
                      ? "border-primary bg-emerald-50/30 ring-2 ring-primary/10" 
                      : "border-border bg-slate-50 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="h-2 w-full rounded bg-blue-600 mb-2"></div>
                  <div className="h-10 w-full rounded bg-slate-200 mb-2 flex items-center justify-center text-[10px] font-bold text-slate-400">Split Hero + Catalog</div>
                  <span className="text-[11px] font-bold text-slate-800">Hiện Đại / Tối Giản</span>
                  <span className="text-[9px] text-slate-400 mt-1">Hero chia đôi, hiển thị bộ lọc nông sản trực quan, tab lọc.</span>
                </div>

                {/* Editorial Layout Card */}
                <div 
                  onClick={() => setHomepageLayout("editorial")}
                  className={`border rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer transition-all hover:shadow-sm ${
                    homepageLayout === "editorial" 
                      ? "border-primary bg-emerald-50/30 ring-2 ring-primary/10" 
                      : "border-border bg-slate-50 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="h-2 w-full rounded bg-amber-600 mb-2"></div>
                  <div className="h-10 w-full rounded bg-slate-200 mb-2 flex items-center justify-center text-[10px] font-bold text-slate-400">Bold Typography</div>
                  <span className="text-[11px] font-bold text-slate-800">Tạp Chí / Nổi Bật</span>
                  <span className="text-[9px] text-slate-400 mt-1">Nổi bật Deal of the Day, Typography đậm, thương hiệu lớn.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            {!readonly ? (
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{submitting ? "Đang lưu..." : "Lưu Cấu Hình"}</span>
              </button>
            ) : (
              <span className="text-xs font-semibold text-slate-400">Chế độ Chỉ xem - Không thể lưu thay đổi</span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
