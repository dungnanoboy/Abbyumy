"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  Calendar,
  Download,
} from "lucide-react";

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [selectedTab, setSelectedTab] = useState<"overview" | "products" | "creators">("overview");
  const [dateRange, setDateRange] = useState({
    start: "22/12/2025",
    end: "28/12/2025",
  });

  // Mock stats
  const stats = [
    {
      label: "GMV đến từ liên kết Phân tích",
      value: "0 ₫",
      change: "+0%",
      trend: "up" as const,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Số món bán ra ghi nhận vào liên kết",
      value: "0",
      change: "+0%",
      trend: "neutral" as const,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Hoa hồng ước tính",
      value: "0 ₫",
      change: "+0%",
      trend: "up" as const,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Số nhà sáng tạo trung bình có doanh số mỗi ngày",
      value: "0",
      change: "+0%",
      trend: "neutral" as const,
      icon: Users,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ];

  const detailedStats = [
    { label: "Video", value: "0", subValue: "Buổi LWE", subNumber: "0" },
    { label: "Số nhà sáng tạo trung bình có doanh số mỗi ngày đã đăng nội dung mới ngày", value: "0", subValue: "", subNumber: "" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hiệu suất</h1>
        <p className="text-gray-600 mt-1">
          Theo dõi và phân tích hiệu suất chiến dịch affiliate
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Số liệu chính</span>
            </div>
            <div className="flex gap-2">
              {[
                { label: "7 ngày qua", value: "7days" },
                { label: "28 ngày qua", value: "28days" },
                { label: "Tháng này", value: "thismonth" },
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    selectedPeriod === period.value
                      ? "bg-teal-50 text-teal-700 border border-teal-200"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value="2025-12-22"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-600">-</span>
              <input
                type="date"
                value="2025-12-28"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <button className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Cập nhật lần cuối: Dec 28, 2025 12:00 AM (GMT+7:00)
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.trend !== "neutral" && (
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}>
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setSelectedTab("overview")}
              className={`py-4 border-b-2 font-medium transition-colors ${
                selectedTab === "overview"
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Công tác
            </button>
            <button
              onClick={() => setSelectedTab("products")}
              className={`py-4 border-b-2 font-medium transition-colors ${
                selectedTab === "products"
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Loại nội dung
            </button>
            <button
              onClick={() => setSelectedTab("creators")}
              className={`py-4 border-b-2 font-medium transition-colors ${
                selectedTab === "creators"
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Hạng mục sản phẩm
            </button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="p-6">
          {selectedTab === "overview" && (
            <div>
              {/* GMV Chart Placeholder */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    GMV đến từ liên kết Phân tích
                  </h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-teal-600 text-teal-600 rounded bg-teal-50">
                      Công tác mô
                    </button>
                    <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      Công tác mục tiêu
                    </button>
                    <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      Đối tác
                    </button>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">Không có dữ liệu</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Dữ liệu sẽ xuất hiện khi có đơn hàng thành công
                    </p>
                  </div>
                </div>

                {/* Chart Legend */}
                <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-teal-500 rounded"></div>
                    <span className="text-gray-700">Công tác mô</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-gray-700">Công tác mục tiêu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className="text-gray-700">Đối tác</span>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {detailedStats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-6"
                  >
                    <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                    <div className="flex items-baseline gap-4">
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      {stat.subValue && (
                        <div className="text-sm text-gray-600">
                          <span>{stat.subValue}</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {stat.subNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === "products" && (
            <div className="text-center py-12">
              <p className="text-gray-600">Phân tích theo loại nội dung</p>
              <p className="text-sm text-gray-500 mt-1">Tính năng đang phát triển</p>
            </div>
          )}

          {selectedTab === "creators" && (
            <div className="text-center py-12">
              <p className="text-gray-600">Phân tích theo hạng mục sản phẩm</p>
              <p className="text-sm text-gray-500 mt-1">Tính năng đang phát triển</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Mẹo tối ưu hiệu suất
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>• Theo dõi GMV hàng ngày để điều chỉnh chiến lược kịp thời</li>
          <li>• So sánh hiệu suất giữa các nhà sáng tạo để tối ưu ngân sách</li>
          <li>• Phân tích sản phẩm có tỷ lệ chuyển đổi cao để nhân rộng</li>
          <li>• Xuất báo cáo định kỳ để theo dõi xu hướng dài hạn</li>
        </ul>
      </div>
    </div>
  );
}
