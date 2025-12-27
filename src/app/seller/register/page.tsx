"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

type BusinessType = "business" | "individual" | "household";

export default function SellerRegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"select" | "form">("select");
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Common fields
    shopName: "",
    description: "",
    phoneNumber: "",
    email: user?.email || "",
    
    // Business specific
    businessName: "",
    taxCode: "",
    businessAddress: "",
    businessLicense: "",
    
    // Individual specific
    fullName: "",
    idNumber: "",
    idFrontImage: "",
    idBackImage: "",
    
    // Household specific
    householdName: "",
    householdLicense: "",
    householdAddress: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    // Check if user already has active shop
    if (user?.shop?.isActive) {
      router.push("/seller");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || "" }));
    }
  }, [user]);

  const businessTypes = [
    {
      type: "business" as BusinessType,
      icon: "🏢",
      title: "Doanh nghiệp",
      description: "Đăng ký nếu bạn có giấy phép kinh doanh. Bán được hàng TMĐT và vận chuyển TMĐT.",
      badge: "Công ty TNHH hoặc Công ty Cổ phần",
    },
    {
      type: "individual" as BusinessType,
      icon: "👤",
      title: "Cá nhân",
      description: "Đăng ký nếu bạn là cá nhân bán hàng. Hãy chuẩn bị CCCD/CMND để xác minh tài khoản.",
      badge: "Chứng minh nhân dân/Căn cước công dân",
    },
    {
      type: "household" as BusinessType,
      icon: "🏠",
      title: "Hộ kinh doanh",
      description: "Đăng ký nếu bạn có giấy chứng nhận đăng ký hộ kinh doanh.",
      badge: "Giấy CNĐKKD hộ kinh doanh",
    },
  ];

  const handleSelectType = (type: BusinessType) => {
    setBusinessType(type);
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/seller/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || user?._id || "",
        },
        body: JSON.stringify({
          businessType,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Đăng ký thành công! Đơn của bạn đang chờ xét duyệt.");
        router.push("/profile");
      } else {
        alert(data.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error submitting registration:", error);
      alert("Có lỗi xảy ra khi gửi đơn đăng ký.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tài liệu tài liệu</h1>
          <p className="text-lg text-gray-600">
            Hãy bắt đầu bằng cách cho chúng tôi biết về doanh nghiệp của bạn
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Vì mục đích thủ tục, chúng tôi có thể sẽ xác minh thông tin hồ kinh doanh của bạn. Thông tin này sẽ không bao giờ được tiết lộ vào giao diện trên TikTok Shop.
          </p>
        </div>

        {step === "select" ? (
          /* Business Type Selection */
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Loại hình kinh doanh của bạn là gì?
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Loại hình kinh doanh sẽ ảnh hưởng đến thông tin bạn cần điền.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {businessTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => handleSelectType(type.type)}
                  className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-orange-500 hover:shadow-lg transition-all text-left"
                >
                  <div className="text-5xl mb-4">{type.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                  <div className="inline-block px-3 py-1 bg-orange-50 text-orange-700 text-xs rounded-full">
                    {type.badge}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Không thể thay đổi loại hình doanh nghiệp sau khi đăng ký.</p>
                  <p className="text-sm text-yellow-700 mt-1">Bạn sẽ không thể thay đổi loại hình doanh nghiệp sau khi hoàn thành đăng ký.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6 flex items-center gap-3">
              <button
                onClick={() => setStep("select")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Đăng ký - {businessTypes.find(t => t.type === businessType)?.title}
                </h2>
                <p className="text-sm text-gray-600">Vui lòng điền đầy đủ thông tin bên dưới</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Common Fields */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cửa hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên cửa hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.shopName}
                      onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                      placeholder="Vd: Bếp Nhà A"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="+84"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả cửa hàng
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Giới thiệu về cửa hàng của bạn..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Business Specific Fields */}
              {businessType === "business" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin doanh nghiệp</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên doanh nghiệp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã số thuế <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.taxCode}
                        onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ kinh doanh <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.businessAddress}
                        onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Individual Specific Fields */}
              {businessType === "individual" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số CCCD/CMND <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.idNumber}
                        onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Household Specific Fields */}
              {businessType === "household" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hộ kinh doanh</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên hộ kinh doanh <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.householdName}
                        onChange={(e) => setFormData({ ...formData, householdName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số giấy phép <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.householdLicense}
                        onChange={(e) => setFormData({ ...formData, householdLicense: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.householdAddress}
                        onChange={(e) => setFormData({ ...formData, householdAddress: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Terms */}
              <div className="border-t border-gray-200 pt-6">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">
                    Tôi đồng ý với{" "}
                    <a href="#" className="text-orange-600 hover:underline">
                      Điều khoản quảng cáo TikTok
                    </a>{" "}
                    và{" "}
                    <a href="#" className="text-orange-600 hover:underline">
                      Điều khoản thanh toán TikTok
                    </a>{" "}
                    và chấp nhận rằng hồ sơ hợp lệ của tôi sẽ bắt đầu ngay khi tài khoản quảng cáo của tôi
                    xác minh liên kết của tôi với hồ khoản Business Center cũng như cho phép tài khoản
                    quảng cáo của tôi sử dụng các dịch vụ liên quan đến quảng cáo.
                  </span>
                </label>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setStep("select")}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {submitting ? "Đang gửi..." : "Gửi đơn đăng ký"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
