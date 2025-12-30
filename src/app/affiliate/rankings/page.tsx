"use client";

import { useState } from "react";
import { TrendingUp, Calendar, Award } from "lucide-react";

interface RankedCreator {
  rank: number;
  name: string;
  username: string;
  category: string[];
  score: number;
  gmv: string;
  orders: number;
  engagementRate: number;
  badge?: "gold" | "silver" | "bronze";
}

export default function RankingsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [selectedRankingType, setSelectedRankingType] = useState("fastest");

  // Mock data
  const rankings: RankedCreator[] = [
    {
      rank: 1,
      name: "ungthaimenuochoa",
      username: "Thời trang, Điện tử",
      category: ["Thời trang", "Điện tử"],
      score: 94.47,
      gmv: "2.0M₫ - 3.0M₫",
      orders: 1700,
      engagementRate: 8.2,
      badge: "gold",
    },
    {
      rank: 2,
      name: "vienvibi_9v9",
      username: "Thời trang, Làm đẹp",
      category: ["Thời trang", "Làm đẹp"],
      score: 89.07,
      gmv: "1.6M₫ - 2.4M₫",
      orders: 9600,
      engagementRate: 7.5,
      badge: "silver",
    },
    {
      rank: 3,
      name: "trangtrankoc",
      username: "Nhà cửa & đồ sống, Chăm sóc cá nhân...",
      category: ["Nhà cửa", "Chăm sóc"],
      score: 82.73,
      gmv: "1.6M₫ - 2.3M₫",
      orders: 556100,
      engagementRate: 6.8,
      badge: "bronze",
    },
    {
      rank: 4,
      name: "debaotham",
      username: "Nhà cửa & đồ sống, Thời trang",
      category: ["Nhà cửa", "Thời trang"],
      score: 46.48,
      gmv: "2.1M₫ - 3.1M₫",
      orders: 194500,
      engagementRate: 5.2,
    },
    {
      rank: 5,
      name: "mayreview.1",
      username: "Thời trang",
      category: ["Thời trang"],
      score: 17.02,
      gmv: "1.4M₫ - 2.1M₫",
      orders: 103700,
      engagementRate: 4.5,
    },
  ];

  const getBadgeColor = (badge?: "gold" | "silver" | "bronze") => {
    switch (badge) {
      case "gold":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "silver":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "bronze":
        return "bg-orange-100 text-orange-700 border-orange-300";
      default:
        return "";
    }
  };

  const getBadgeIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Xem bảng xếp hạng</h1>
        <p className="text-gray-600 mt-1">
          Các danh sách xếp hạng này thể hiện hiệu suất của nhà sáng tạo trong một giai đoạn. 
          Vui lòng chỉ số dụng cho mục đích tham khảo và không được chia sẻ ra bên ngoài.
        </p>
      </div>

      {/* Filter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hạng mục chính
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Tất cả</option>
            <option value="fashion">Thời trang</option>
            <option value="food">Đồ ăn & Đồ uống</option>
            <option value="beauty">Làm đẹp</option>
            <option value="electronics">Điện tử</option>
            <option value="home">Nhà cửa & Đồ sống</option>
            <option value="mom-baby">Mẹ & Bé</option>
          </select>
        </div>

        {/* Time Period Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thời gian
          </label>
          <div className="flex gap-2">
            {["Ngày", "Tuần", "Tháng"].map((period, index) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(["daily", "weekly", "monthly"][index])}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                  selectedPeriod === ["daily", "weekly", "monthly"][index]
                    ? "bg-teal-50 border-teal-600 text-teal-700 font-medium"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Date Display */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border border-teal-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium text-gray-700">Kỳ dữ liệu được cập nhật vào</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            28/12/2025 07:00:01 (+07:00)
          </p>
        </div>
      </div>

      {/* Ranking Type Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-8">
            {[
              { id: "fastest", label: "Tăng chạy nhất", icon: TrendingUp },
              { id: "trending", label: "Phát triển nhanh", icon: TrendingUp },
              { id: "potential", label: "Mới dùng phổ biến", icon: Award },
              { id: "sales", label: "Nhà sáng tạo hàng đầu", icon: Award },
            ].map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedRankingType(type.id)}
                  className={`py-4 border-b-2 font-medium transition-colors flex items-center gap-2 ${
                    selectedRankingType === type.id
                      ? "border-teal-600 text-teal-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sắp xếp theo */}
        <div className="px-6 py-4 border-b border-gray-200">
          <label className="text-sm font-medium text-gray-700 mr-4">Sắp xếp theo Mức độ liên quan</label>
          <button className="text-sm text-teal-600 hover:text-teal-700">Đổi</button>
        </div>

        {/* Rankings Table */}
        <div className="p-6">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 pb-4 mb-4 border-b border-gray-200 text-sm font-medium text-gray-600">
            <div className="col-span-1 text-center">Xếp hạng</div>
            <div className="col-span-3">Nhà sáng tạo</div>
            <div className="col-span-2 text-center">Điểm thăng hạng</div>
            <div className="col-span-2 text-center">
              GMV đến từ liên kết Phân tích
            </div>
            <div className="col-span-2 text-center">
              Doanh số LVE trên trên mỗi luồt hiển thị trên bình
            </div>
            <div className="col-span-2 text-center">Người theo dõi</div>
          </div>

          {/* Rankings List */}
          <div className="space-y-3">
            {rankings.map((creator) => (
              <div
                key={creator.rank}
                className={`grid grid-cols-12 gap-4 items-center py-4 px-4 rounded-lg transition-all hover:shadow-md ${
                  creator.badge ? getBadgeColor(creator.badge) + " border" : "bg-gray-50"
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 text-center">
                  <div className="text-2xl font-bold">
                    {typeof getBadgeIcon(creator.rank) === "string" 
                      ? getBadgeIcon(creator.rank)
                      : <span className="text-gray-700">{creator.rank}</span>
                    }
                  </div>
                  {creator.rank <= 3 && (
                    <div className="text-xs text-gray-600 mt-1">+{creator.rank}</div>
                  )}
                </div>

                {/* Creator Info */}
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600">
                        {creator.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{creator.name}</p>
                      <p className="text-sm text-gray-600">{creator.username}</p>
                      {creator.badge && (
                        <div className="flex items-center gap-1 mt-1">
                          <Award className="w-3 h-3" />
                          <span className="text-xs">Buổi LWE NMI dụng phổ biến</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="col-span-2 text-center">
                  <p className="text-lg font-bold text-gray-900">{creator.score}</p>
                </div>

                {/* GMV */}
                <div className="col-span-2 text-center">
                  <p className="font-semibold text-gray-900">{creator.gmv}</p>
                </div>

                {/* Sales Performance */}
                <div className="col-span-2 text-center">
                  <p className="text-gray-700">--</p>
                </div>

                {/* Followers */}
                <div className="col-span-2 text-center">
                  <p className="font-semibold text-gray-900">
                    {(creator.orders / 1000).toFixed(1)}K
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Trước
            </button>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              2
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              3
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Lưu ý:</strong> Dữ liệu bảng xếp hạng được cập nhật định kỳ và chỉ mang tính chất tham khảo. 
          Để có quyết định chính xác, vui lòng kết hợp với dữ liệu phân tích chi tiết.
        </p>
      </div>
    </div>
  );
}
