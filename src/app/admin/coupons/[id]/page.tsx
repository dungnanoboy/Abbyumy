"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface EditCouponPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCouponPage({ params }: EditCouponPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "voucher",
    code: "",
    description: "",
    discountType: "percent",
    discountValue: 0,
    maxDiscount: "",
    minOrderValue: "",
    usageLimit: "",
    perUserLimit: "",
    startAt: "",
    endAt: "",
    tags: "",
    isActive: true,
    sellerId: "",
  });

  const [conditions, setConditions] = useState<{ rule: string; value: string | number | boolean }[]>([]);

  // Available rule types
  const ruleTypes = [
    { value: "follow_seller", label: "Phải follow shop", valueType: "boolean" },
    { value: "min_completed_orders", label: "Số đơn đã hoàn thành tối thiểu", valueType: "number" },
    { value: "follow_duration_days", label: "Thời gian follow tối thiểu (ngày)", valueType: "number" },
    { value: "min_total_spent", label: "Tổng chi tiêu tối thiểu (₫)", valueType: "number" },
    { value: "new_user_only", label: "Chỉ khách hàng mới", valueType: "boolean" },
    { value: "level", label: "Hạng khách hàng", valueType: "select" },
    { value: "livestream_only", label: "Chỉ trong livestream", valueType: "boolean" },
  ];

  const addCondition = () => {
    setConditions([...conditions, { rule: "follow_seller", value: true }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: string, value: any) => {
    const updated = [...conditions];
    if (field === "rule") {
      // Reset value when rule changes
      const ruleType = ruleTypes.find((r) => r.value === value);
      updated[index] = { 
        rule: value, 
        value: ruleType?.valueType === "boolean" ? true : ruleType?.valueType === "number" ? 0 : "" 
      };
    } else {
      updated[index][field as keyof typeof updated[0]] = value;
    }
    setConditions(updated);
  };

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const response = await fetch(`/api/admin/coupons/${resolvedParams.id}`);
        const data = await response.json();

        if (response.ok) {
          const coupon = data.coupon;
          setFormData({
            type: coupon.type || "voucher",
            code: coupon.code || "",
            description: coupon.description || "",
            discountType: coupon.discount?.type || "percent",
            discountValue: coupon.discount?.value || 0,
            maxDiscount: coupon.discount?.maxDiscount?.toString() || "",
            minOrderValue: coupon.discount?.minOrderValue?.toString() || "",
            usageLimit: coupon.limits?.usageLimit?.toString() || "",
            perUserLimit: coupon.limits?.perUserLimit?.toString() || "",
            startAt: coupon.startAt ? new Date(coupon.startAt).toISOString().slice(0, 16) : "",
            endAt: coupon.endAt ? new Date(coupon.endAt).toISOString().slice(0, 16) : "",
            tags: coupon.tags?.join(", ") || "",
            isActive: coupon.isActive ?? true,
            sellerId: coupon.scope?.sellerId || "",
          });
          // Load conditions
          if (coupon.conditions && Array.isArray(coupon.conditions)) {
            setConditions(coupon.conditions);
          }
        } else {
          alert(data.error || "Không tìm thấy mã giảm giá");
          router.push("/admin/coupons");
        }
      } catch (error) {
        console.error("Error fetching coupon:", error);
        alert("Lỗi khi tải thông tin mã giảm giá");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupon();
  }, [resolvedParams.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const updateData = {
        type: formData.type,
        code: formData.code.toUpperCase(),
        description: formData.description,
        discount: {
          type: formData.discountType,
          value: Number(formData.discountValue),
          maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
          minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : undefined,
        },
        scope: {
          sellerId: formData.sellerId || undefined,
        },
        conditions: conditions.map((c) => ({
          rule: c.rule,
          value: c.value,
        })),
        limits: {
          usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
          perUserLimit: formData.perUserLimit ? Number(formData.perUserLimit) : undefined,
        },
        startAt: formData.startAt,
        endAt: formData.endAt,
        isActive: formData.isActive,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
      };

      const response = await fetch(`/api/admin/coupons/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Cập nhật mã giảm giá thành công!");
        router.push("/admin/coupons");
      } else {
        alert(data.error || "Không thể cập nhật mã giảm giá");
      }
    } catch (error) {
      console.error("Error updating coupon:", error);
      alert("Lỗi khi cập nhật mã giảm giá");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa mã giảm giá</h1>
        <p className="text-gray-600 mt-1">Cập nhật thông tin mã giảm giá</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại mã <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="voucher">Voucher thường</option>
                  <option value="shop_voucher">Voucher shop</option>
                  <option value="free_ship">Miễn phí vận chuyển</option>
                  <option value="combo">Combo</option>
                  <option value="event">Sự kiện</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã giảm giá <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="VD: FREESHIP50K"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết về mã giảm giá"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Scope */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Phạm vi áp dụng</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop áp dụng (để trống = toàn sàn)
                </label>
                <input
                  type="text"
                  value={formData.sellerId}
                  onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
                  placeholder="ID của shop (nếu là shop voucher)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Để trống nếu mã áp dụng cho toàn sàn
                </p>
              </div>
            </div>
          </div>

          {/* Discount Config */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cấu hình giảm giá</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại giảm giá <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="percent">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định (₫)</option>
                  <option value="freeShip">Miễn phí ship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá trị giảm <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: Number(e.target.value) })
                  }
                  placeholder={formData.discountType === "percent" ? "VD: 30" : "VD: 50000"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giảm tối đa (₫)
                </label>
                <input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  placeholder="VD: 100000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn hàng tối thiểu (₫)
                </label>
                <input
                  type="number"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                  placeholder="VD: 200000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Limits */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Giới hạn sử dụng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng số lượt sử dụng
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="VD: 1000 (để trống = không giới hạn)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới hạn mỗi người dùng
                </label>
                <input
                  type="number"
                  value={formData.perUserLimit}
                  onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                  placeholder="VD: 2 (để trống = không giới hạn)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Conditions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Điều kiện động (Dynamic Rules)</h2>
              <button
                type="button"
                onClick={addCondition}
                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
              >
                + Thêm điều kiện
              </button>
            </div>
            
            {conditions.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">Chưa có điều kiện nào. Nhấn "Thêm điều kiện" để thêm.</p>
                <p className="text-xs text-gray-400 mt-2">
                  Điều kiện động giúp kiểm soát ai được sử dụng mã (VD: phải follow shop, đã mua tối thiểu X đơn...)
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {conditions.map((condition, index) => {
                  const ruleType = ruleTypes.find((r) => r.value === condition.rule);
                  return (
                    <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Loại điều kiện
                        </label>
                        <select
                          value={condition.rule}
                          onChange={(e) => updateCondition(index, "rule", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        >
                          {ruleTypes.map((rule) => (
                            <option key={rule.value} value={rule.value}>
                              {rule.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Giá trị
                        </label>
                        {ruleType?.valueType === "boolean" ? (
                          <select
                            value={condition.value.toString()}
                            onChange={(e) => updateCondition(index, "value", e.target.value === "true")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          >
                            <option value="true">Có</option>
                            <option value="false">Không</option>
                          </select>
                        ) : ruleType?.valueType === "select" ? (
                          <select
                            value={condition.value.toString()}
                            onChange={(e) => updateCondition(index, "value", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          >
                            <option value="silver">Silver</option>
                            <option value="gold">Gold</option>
                            <option value="platinum">Platinum</option>
                          </select>
                        ) : (
                          <input
                            type="number"
                            value={typeof condition.value === 'number' ? condition.value : 0}
                            onChange={(e) => updateCondition(index, "value", Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            min="0"
                          />
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeCondition(index)}
                        className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa điều kiện"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Time */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thời gian hiệu lực</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.startAt}
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="VD: 12.12, flash-sale, new-user"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Kích hoạt mã giảm giá</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
            >
              {submitting ? "Đang cập nhật..." : "Cập nhật mã giảm giá"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
