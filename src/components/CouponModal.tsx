"use client";

import { useState, useEffect } from "react";

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
  eligible: boolean;
  reason: string;
  isSaved: boolean;
}

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCoupon: (coupon: Coupon) => void;
  userId: string;
  orderValue: number;
  items: any[];
  currentCouponCode?: string;
}

export default function CouponModal({
  isOpen,
  onClose,
  onSelectCoupon,
  userId,
  orderValue,
  items,
  currentCouponCode,
}: CouponModalProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "eligible" | "ineligible">("all");
  const [selectedCode, setSelectedCode] = useState<string | null>(currentCouponCode || null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchCoupons();
    }
  }, [isOpen, userId, orderValue]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/coupons/available", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, orderValue, items }),
      });

      const data = await response.json();

      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDiscountText = (coupon: Coupon) => {
    if (coupon.discount.type === "percent") {
      const maxText = coupon.discount.maxDiscount
        ? ` (tối đa ${coupon.discount.maxDiscount.toLocaleString("vi-VN")}₫)`
        : "";
      return `Giảm ${coupon.discount.value}%${maxText}`;
    } else if (coupon.discount.type === "fixed") {
      return `Giảm ${coupon.discount.value.toLocaleString("vi-VN")}₫`;
    } else if (coupon.discount.type === "freeShip") {
      return "Miễn phí vận chuyển";
    }
    return "Ưu đãi";
  };

  const filteredCoupons = coupons.filter((coupon) => {
    // Filter by eligibility
    if (filter === "eligible" && !coupon.eligible) return false;
    if (filter === "ineligible" && coupon.eligible) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        coupon.code.toLowerCase().includes(query) ||
        coupon.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const eligibleCount = coupons.filter((c) => c.eligible).length;
  const ineligibleCount = coupons.filter((c) => !c.eligible).length;

  const handleSelectCoupon = (coupon: Coupon) => {
    if (!coupon.eligible) return;
    setSelectedCode(coupon.code);
  };

  const handleApply = () => {
    const selected = coupons.find((c) => c.code === selectedCode);
    if (selected && selected.eligible) {
      onSelectCoupon(selected);
      onClose();
    }
  };

  const handleSaveCoupon = async (couponId: string) => {
    try {
      const response = await fetch("/api/user-coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, couponId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh coupons after saving
        fetchCoupons();
      } else {
        alert(data.error || "Không thể lưu voucher");
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      alert("Lỗi khi lưu voucher");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Chọn Voucher</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm mã voucher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-orange-100 text-orange-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tất cả ({coupons.length})
            </button>
            <button
              onClick={() => setFilter("eligible")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "eligible"
                  ? "bg-orange-100 text-orange-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Có thể dùng ({eligibleCount})
            </button>
            <button
              onClick={() => setFilter("ineligible")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "ineligible"
                  ? "bg-orange-100 text-orange-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Không đủ điều kiện ({ineligibleCount})
            </button>
          </div>
        </div>

        {/* Coupon List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải voucher...</p>
              </div>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-12">
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
              <p className="text-gray-500">
                {searchQuery ? "Không tìm thấy voucher phù hợp" : "Chưa có voucher nào"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCoupons.map((coupon) => (
                <div
                  key={coupon._id}
                  onClick={() => handleSelectCoupon(coupon)}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    !coupon.eligible
                      ? "opacity-50 cursor-not-allowed bg-gray-50"
                      : selectedCode === coupon.code
                      ? "border-orange-500 bg-orange-50 cursor-pointer"
                      : "border-gray-200 hover:border-orange-300 cursor-pointer hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedCode === coupon.code}
                        disabled={!coupon.eligible}
                        onChange={() => {}}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Coupon Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded text-sm font-bold ${
                              coupon.eligible
                                ? "bg-orange-600 text-white"
                                : "bg-gray-400 text-white"
                            }`}
                          >
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
                      </div>

                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {getDiscountText(coupon)}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">{coupon.description}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-gray-500 space-y-1">
                          {coupon.discount.minOrderValue && (
                            <p>
                              Đơn tối thiểu:{" "}
                              {coupon.discount.minOrderValue.toLocaleString("vi-VN")}₫
                            </p>
                          )}
                          <p>HSD: {new Date(coupon.endAt).toLocaleDateString("vi-VN")}</p>
                        </div>

                        {/* Save button for unsaved coupons */}
                        {!coupon.isSaved && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveCoupon(coupon._id);
                            }}
                            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                          >
                            Lưu voucher
                          </button>
                        )}
                      </div>

                      {/* Ineligibility reason */}
                      {!coupon.eligible && coupon.reason && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          <span className="font-medium">⚠ {coupon.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              {selectedCode ? (
                <div className="text-sm">
                  <span className="text-gray-600">Đã chọn: </span>
                  <span className="font-semibold text-orange-600">{selectedCode}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Chưa chọn voucher nào</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleApply}
                disabled={!selectedCode}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
