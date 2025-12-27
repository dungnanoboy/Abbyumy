"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  limits: {
    usageLimit?: number;
    perUserLimit?: number;
  };
  startAt: string;
  endAt: string;
  isActive: boolean;
  tags?: string[];
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "expired">("all");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/admin/coupons");
      const data = await response.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa mã giảm giá này?")) return;

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Đã xóa mã giảm giá!");
        fetchCoupons();
      } else {
        const data = await response.json();
        alert(data.error || "Không thể xóa mã giảm giá");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      alert("Lỗi khi xóa mã giảm giá");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        alert(`Đã ${!currentStatus ? "kích hoạt" : "tắt"} mã giảm giá!`);
        fetchCoupons();
      } else {
        const data = await response.json();
        alert(data.error || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  const getDiscountText = (coupon: Coupon) => {
    if (coupon.discount.type === "percent") {
      return `${coupon.discount.value}%`;
    } else if (coupon.discount.type === "fixed") {
      return `${coupon.discount.value.toLocaleString("vi-VN")}₫`;
    } else if (coupon.discount.type === "freeShip") {
      return "Miễn phí ship";
    }
    return "Ưu đãi";
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const now = new Date();
    const endDate = new Date(coupon.endAt);
    
    if (filter === "active") {
      return coupon.isActive && endDate >= now;
    } else if (filter === "inactive") {
      return !coupon.isActive;
    } else if (filter === "expired") {
      return endDate < now;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý mã giảm giá</h1>
          <p className="text-gray-600 mt-1">Tạo và quản lý các mã giảm giá</p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          + Tạo mã mới
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-2">
          {[
            { value: "all", label: "Tất cả" },
            { value: "active", label: "Đang hoạt động" },
            { value: "inactive", label: "Tạm dừng" },
            { value: "expired", label: "Hết hạn" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === item.value
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredCoupons.length === 0 ? (
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
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
            <p className="text-gray-500">Chưa có mã giảm giá nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giảm giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giới hạn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{coupon.code}</div>
                          {coupon.tags && coupon.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {coupon.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {coupon.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-purple-600">
                        {getDiscountText(coupon)}
                      </div>
                      {coupon.discount.maxDiscount && (
                        <div className="text-xs text-gray-500">
                          Tối đa: {coupon.discount.maxDiscount.toLocaleString("vi-VN")}₫
                        </div>
                      )}
                      {coupon.discount.minOrderValue && (
                        <div className="text-xs text-gray-500">
                          ĐH tối thiểu: {coupon.discount.minOrderValue.toLocaleString("vi-VN")}₫
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {coupon.limits.usageLimit && (
                        <div>Tổng: {coupon.limits.usageLimit} lượt</div>
                      )}
                      {coupon.limits.perUserLimit && (
                        <div>Mỗi user: {coupon.limits.perUserLimit} lượt</div>
                      )}
                      {!coupon.limits.usageLimit && !coupon.limits.perUserLimit && (
                        <span className="text-gray-400">Không giới hạn</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(coupon.startAt).toLocaleDateString("vi-VN")}</div>
                      <div className="text-xs">đến</div>
                      <div>{new Date(coupon.endAt).toLocaleDateString("vi-VN")}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(coupon.endAt) < new Date() ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Hết hạn
                        </span>
                      ) : coupon.isActive ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Tạm dừng
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(coupon._id, coupon.isActive)}
                          className={`${
                            coupon.isActive
                              ? "text-gray-600 hover:text-gray-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                          title={coupon.isActive ? "Tắt" : "Bật"}
                        >
                          {coupon.isActive ? "⏸" : "▶️"}
                        </button>
                        <Link
                          href={`/admin/coupons/${coupon._id}`}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
