"use client";

import { useState } from "react";
import { Search, Plus, Video, Package, DollarSign, ExternalLink, BarChart3 } from "lucide-react";

interface AffiliateVideo {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  productLinks: number;
  gmv: number;
  commission: number;
  status: "published" | "draft" | "processing";
  createdAt: string;
}

export default function AffiliateVideosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock data - replace with API call
  const videos: AffiliateVideo[] = [];

  const filteredVideos = videos.filter((video) => {
    if (searchQuery && !video.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedFilter !== "all" && video.status !== selectedFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Video quản lý liên kết</h1>
          <p className="text-gray-600 mt-1">
            Quản lý video có gắn sản phẩm affiliate và theo dõi doanh thu
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Tổng video</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Tổng GMV</p>
            <p className="text-2xl font-bold text-gray-900">0 ₫</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Hoa hồng kiếm được</p>
            <p className="text-2xl font-bold text-gray-900">0 ₫</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Sản phẩm đã gắn</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm video..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
              <option value="processing">Đang xử lý</option>
            </select>
          </div>
        </div>

        {/* Videos Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredVideos.length > 0 ? (
            <div className="p-6">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 pb-4 mb-4 border-b border-gray-200 text-sm font-medium text-gray-600">
                <div className="col-span-4">Video</div>
                <div className="col-span-2 text-right">Lượt xem</div>
                <div className="col-span-2 text-right">Sản phẩm</div>
                <div className="col-span-2 text-right">GMV</div>
                <div className="col-span-2 text-right">Hành động</div>
              </div>

              {/* Table Rows */}
              <div className="space-y-3">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className="grid grid-cols-12 gap-4 items-center py-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {/* Video Info */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden relative">
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                          {video.status === "published" ? "Live" : "Draft"}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-2">{video.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{video.createdAt}</p>
                      </div>
                    </div>

                    {/* Views */}
                    <div className="col-span-2 text-right">
                      <p className="font-semibold text-gray-900">{video.views.toLocaleString()}</p>
                      <div className="flex items-center justify-end gap-2 mt-1 text-xs text-gray-500">
                        <span>❤️ {video.likes}</span>
                        <span>💬 {video.comments}</span>
                      </div>
                    </div>

                    {/* Products */}
                    <div className="col-span-2 text-right">
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        <Package className="w-4 h-4" />
                        {video.productLinks}
                      </div>
                    </div>

                    {/* GMV */}
                    <div className="col-span-2 text-right">
                      <p className="font-semibold text-gray-900">{video.gmv.toLocaleString()} ₫</p>
                      <p className="text-xs text-teal-600 mt-1">+{video.commission.toLocaleString()} ₫</p>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-2">
                      <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-teal-600 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center">
                <Video className="w-12 h-12 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có video affiliate nào
              </h3>
              <p className="text-gray-600 mb-6">
                Tạo video và gắn sản phẩm để bắt đầu kiếm hoa hồng
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/studio/content"
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Tạo video mới
                </a>
                <a
                  href="/affiliate"
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium inline-flex items-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  Tìm sản phẩm
                </a>
              </div>
            </div>
          )}
        </div>

        {/* How to Guide */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            Cách gắn sản phẩm vào video
          </h3>
          <ol className="text-sm text-gray-700 space-y-2 ml-7 list-decimal">
            <li>Tạo hoặc chỉnh sửa video trong phần "Bài đăng"</li>
            <li>Trong editor, click vào nút "Thêm sản phẩm"</li>
            <li>Tìm và chọn sản phẩm có hoa hồng từ Trung tâm liên kết</li>
            <li>Xuất bản video và theo dõi doanh thu tại đây</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
