"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ExternalLink, MessageCircle } from "lucide-react";
import Image from "next/image";

interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  category: string[];
  followers: number;
  avgViews: number;
  engagementRate: number;
  gender: string;
  language: string;
  activeWithin90Days: boolean;
}

export default function FindCreatorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"creators" | "followers" | "performance">("creators");
  const [filters, setFilters] = useState({
    productCategory: "",
    creatorAgency: "",
    language: "",
    activeRecent: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with API call
  const creators: Creator[] = [
    {
      id: "1",
      name: "cu.bill28",
      username: "Sa Cu Bill ✌️",
      avatar: "/placeholder-avatar.jpg",
      category: ["Trang phục nam & Đồ...", "+2"],
      followers: 38700,
      avgViews: 4700000,
      engagementRate: 1.4,
      gender: "Nam",
      language: "Tiếng Việt",
      activeWithin90Days: true,
    },
    {
      id: "2",
      name: "mythuong_2",
      username: "MỸ THƯƠNG",
      avatar: "/placeholder-avatar.jpg",
      category: ["Đồ ăn & Đồ uống", "+2"],
      followers: 22000,
      avgViews: 1000000,
      engagementRate: 0.6,
      gender: "Nữ",
      language: "Tiếng Việt",
      activeWithin90Days: true,
    },
    {
      id: "3",
      name: "phangphuonglivestream",
      username: "Phương Bắc Livestream",
      avatar: "/placeholder-avatar.jpg",
      category: ["Đồ ăn & Đồ uống", "+2"],
      followers: 89500,
      avgViews: 6800000,
      engagementRate: 0.5,
      gender: "Nữ",
      language: "Tiếng Việt",
      activeWithin90Days: true,
    },
  ];

  const filteredCreators = creators.filter((creator) => {
    if (searchQuery && !creator.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.activeRecent && !creator.activeWithin90Days) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tìm nhà sáng tạo</h1>
        <p className="text-gray-600 mt-1">
          Khám phá và kết nối với nhà sáng tạo phù hợp để quảng bá sản phẩm
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex gap-4 mb-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tên, sản phẩm, hashtag hoặc từ khóa"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Bộ lọc</span>
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hạng mục sản phẩm
              </label>
              <select
                value={filters.productCategory}
                onChange={(e) => setFilters({ ...filters, productCategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Chọn</option>
                <option value="fashion">Thời trang</option>
                <option value="food">Đồ ăn & Đồ uống</option>
                <option value="beauty">Làm đẹp</option>
                <option value="electronics">Điện tử</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agency của nhà sáng tạo
              </label>
              <select
                value={filters.creatorAgency}
                onChange={(e) => setFilters({ ...filters, creatorAgency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Chọn</option>
                <option value="agency1">Agency 1</option>
                <option value="agency2">Agency 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngôn ngữ nội dung
              </label>
              <select
                value={filters.language}
                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Chọn</option>
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.activeRecent}
                  onChange={(e) => setFilters({ ...filters, activeRecent: e.target.checked })}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">
                  Chưa mở trong 90 ngày qua
                </span>
              </label>
            </div>

            <div className="md:col-span-4 flex gap-2">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
                Đặt lại
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <div className="flex gap-8 px-6">
            <button
              onClick={() => setSelectedTab("creators")}
              className={`py-4 border-b-2 font-medium transition-colors ${
                selectedTab === "creators"
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Nhà sáng tạo
            </button>
            <button
              onClick={() => setSelectedTab("followers")}
              className={`py-4 border-b-2 font-medium transition-colors ${
                selectedTab === "followers"
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Người theo dõi
            </button>
            <button
              onClick={() => setSelectedTab("performance")}
              className={`py-4 border-b-2 font-medium transition-colors ${
                selectedTab === "performance"
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Hiệu suất
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="p-6">
          {selectedTab === "creators" && (
            <div>
              {/* Table Header */}
              <div className="grid grid-cols-7 gap-4 pb-4 mb-4 border-b border-gray-200 text-sm font-medium text-gray-600">
                <div className="col-span-2">Nhà sáng tạo</div>
                <div>Thể</div>
                <div className="text-right">
                  Số món bán ra ghi nhận vào liên kết
                </div>
                <div className="text-right">
                  Lượt xem video trung bình
                </div>
                <div className="text-right">
                  Tỷ lệ tương tác
                </div>
                <div className="text-right">Hành động</div>
              </div>

              {/* Creator List */}
              <div className="space-y-4">
                {filteredCreators.map((creator) => (
                  <div
                    key={creator.id}
                    className="grid grid-cols-7 gap-4 items-center py-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {/* Creator Info */}
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        <span className="text-lg font-semibold text-gray-600">
                          {creator.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{creator.name}</p>
                        <p className="text-sm text-gray-600">{creator.username}</p>
                        <div className="flex gap-1 mt-1">
                          {creator.category.map((cat, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="text-sm text-gray-700">{creator.gender}</div>

                    {/* Followers */}
                    <div className="text-sm text-gray-700 text-right">
                      {creator.followers.toLocaleString()}
                    </div>

                    {/* Avg Views */}
                    <div className="text-sm text-gray-700 text-right">
                      {(creator.avgViews / 1000000).toFixed(1)}M
                    </div>

                    {/* Engagement Rate */}
                    <div className="text-sm text-gray-700 text-right">
                      {creator.engagementRate}%
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                      <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium">
                        Mời
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCreators.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">Không tìm thấy nhà sáng tạo phù hợp</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedTab === "followers" && (
            <div className="text-center py-12">
              <p className="text-gray-600">Tính năng đang phát triển</p>
            </div>
          )}

          {selectedTab === "performance" && (
            <div className="text-center py-12">
              <p className="text-gray-600">Tính năng đang phát triển</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
