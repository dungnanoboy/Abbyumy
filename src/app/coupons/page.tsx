"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface Coupon {
  _id: string;
  type: string;
  code: string;
  description: string;
  discount: {
    type: string;
    value: number;
    maxDiscount?: number;
    minOrderValue?: number;
  };
  startAt: string;
  endAt: string;
  banner?: string;
  tags?: string[];
}

interface UserCoupon {
  _id: string;
  userId: string;
  couponId: string;
  savedAt: string;
  usedAt?: string | null;
  expiresAt: string;
  status: "saved" | "used" | "expired" | "invalid";
  coupon: Coupon;
}

export default function MyCouponsPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"my-coupons" | "available">("my-coupons");
  const [filter, setFilter] = useState<"all" | "saved" | "used" | "expired">("all");

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    fetchUserCoupons();
    fetchAvailableCoupons();
  }, [currentUser]);

  const fetchUserCoupons = async () => {
    try {
      const response = await fetch(`/api/user-coupons?userId=${currentUser?._id}`);
      const data = await response.json();
      setUserCoupons(data.userCoupons || []);
    } catch (error) {
      console.error("Error fetching user coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCoupons = async () => {
    try {
      const response = await fetch("/api/coupons?limit=50");
      const data = await response.json();
      setAvailableCoupons(data.coupons || []);
    } catch (error) {
      console.error("Error fetching available coupons:", error);
    }
  };

  const handleSaveCoupon = async (couponId: string) => {
    try {
      const response = await fetch("/api/user-coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser?._id, couponId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Không thể lưu mã giảm giá");
        return;
      }

      alert("Đã lưu mã giảm giá!");
      fetchUserCoupons();
    } catch (error) {
      console.error("Error saving coupon:", error);
      alert("Lỗi khi lưu mã giảm giá");
    }
  };

  const handleDeleteCoupon = async (userCouponId: string) => {
    if (!confirm("Bạn có chắc muốn xóa mã giảm giá này?")) return;

    try {
      const response = await fetch(`/api/user-coupons?id=${userCouponId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Không thể xóa mã giảm giá");
        return;
      }

      alert("Đã xóa mã giảm giá!");
      fetchUserCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      alert("Lỗi khi xóa mã giảm giá");
    }
  };

  const getDiscountText = (coupon: Coupon) => {
    if (coupon.discount.type === "percent") {
      return `Giảm ${coupon.discount.value}%`;
    } else if (coupon.discount.type === "fixed") {
      return `Giảm ${coupon.discount.value.toLocaleString("vi-VN")}₫`;
    } else if (coupon.discount.type === "freeShip") {
      return "Miễn phí vận chuyển";
    }
    return "Ưu đãi";
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      saved: "bg-green-100 text-green-800",
      used: "bg-gray-100 text-gray-800",
      expired: "bg-red-100 text-red-800",
      invalid: "bg-red-100 text-red-800",
    };

    const labels = {
      saved: "Chưa dùng",
      used: "Đã dùng",
      expired: "Hết hạn",
      invalid: "Không hợp lệ",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredCoupons = userCoupons.filter((uc) => {
    if (filter === "all") return true;
    return uc.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Kho Voucher</h1>
          <p className="text-gray-600 mt-1">Quản lý các mã giảm giá của bạn</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("my-coupons")}
              className={`flex-1 px-6 py-4 font-medium ${
                activeTab === "my-coupons"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Voucher của tôi ({userCoupons.length})
            </button>
            <button
              onClick={() => setActiveTab("available")}
              className={`flex-1 px-6 py-4 font-medium ${
                activeTab === "available"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Voucher khả dụng ({availableCoupons.length})
            </button>
          </div>

          {/* My Coupons Tab */}
          {activeTab === "my-coupons" && (
            <div className="p-6">
              {/* Filter */}
              <div className="flex gap-2 mb-6">
                {[
                  { value: "all", label: "Tất cả" },
                  { value: "saved", label: "Chưa dùng" },
                  { value: "used", label: "Đã dùng" },
                  { value: "expired", label: "Hết hạn" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFilter(item.value as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      filter === item.value
                        ? "bg-orange-100 text-orange-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Coupon List */}
              <div className="space-y-4">
                {filteredCoupons.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                      />
                    </svg>
                    <p>Chưa có voucher nào</p>
                  </div>
                ) : (
                  filteredCoupons.map((userCoupon) => (
                    <div
                      key={userCoupon._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-orange-600 text-white px-3 py-1 rounded text-sm font-bold">
                              {userCoupon.coupon.code}
                            </span>
                            {getStatusBadge(userCoupon.status)}
                          </div>
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {getDiscountText(userCoupon.coupon)}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {userCoupon.coupon.description}
                          </p>
                          {userCoupon.coupon.discount.minOrderValue && (
                            <p className="text-xs text-gray-500">
                              Đơn tối thiểu:{" "}
                              {userCoupon.coupon.discount.minOrderValue.toLocaleString("vi-VN")}₫
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            HSD: {new Date(userCoupon.expiresAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <div className="ml-4">
                          {userCoupon.status === "saved" ? (
                            <button
                              onClick={() => handleDeleteCoupon(userCoupon._id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Xóa
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Available Coupons Tab */}
          {activeTab === "available" && (
            <div className="p-6">
              <div className="space-y-4">
                {availableCoupons.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Chưa có voucher khả dụng</p>
                  </div>
                ) : (
                  availableCoupons.map((coupon) => {
                    const isSaved = userCoupons.some(
                      (uc) => uc.couponId === coupon._id && uc.status !== "expired"
                    );

                    return (
                      <div
                        key={coupon._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="bg-orange-600 text-white px-3 py-1 rounded text-sm font-bold">
                                {coupon.code}
                              </span>
                              {coupon.tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              {getDiscountText(coupon)}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">{coupon.description}</p>
                            {coupon.discount.minOrderValue && (
                              <p className="text-xs text-gray-500">
                                Đơn tối thiểu:{" "}
                                {coupon.discount.minOrderValue.toLocaleString("vi-VN")}₫
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              HSD: {new Date(coupon.endAt).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                          <div className="ml-4">
                            {isSaved ? (
                              <span className="text-green-600 text-sm font-medium">Đã lưu</span>
                            ) : (
                              <button
                                onClick={() => handleSaveCoupon(coupon._id)}
                                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                              >
                                Lưu
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
