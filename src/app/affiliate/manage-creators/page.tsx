"use client";

import { useState } from "react";
import { Search, Upload, FileText, Filter, MoreVertical, ExternalLink, Trash2, Users } from "lucide-react";

interface ManagedCreator {
  id: string;
  name: string;
  category: string;
  productsInStock: number;
  gmv: string;
  video: number;
  liveStreams: number;
  status: "active" | "inactive" | "pending";
}

export default function ManageCreatorsPage() {
  const [selectedTab, setSelectedTab] = useState<"invited" | "partnership">("invited");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState({
    creatorType: "",
    category: "",
    status: "",
  });

  // Mock data
  const creators: ManagedCreator[] = [];

  const filteredCreators = creators.filter((creator) => {
    if (searchQuery && !creator.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nhà sáng tạo</h1>
          <p className="text-gray-600 mt-1">
            Quản lý và theo dõi hoạt động của nhà sáng tạo đang hợp tác
          </p>
        </div>
        <button className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Tải lên hàng loạt
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setSelectedTab("invited")}
              className={`py-4 border-b-2 font-medium transition-colors ${
                selectedTab === "invited"
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Nhà sáng tạo liên kết
            </button>
            <button
              onClick={() => setSelectedTab("partnership")}
              className={`py-4 border-b-2 font-medium transition-colors ${
                selectedTab === "partnership"
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Đối tác liên kết
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên nhà sáng tạo"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Creator Type Filter */}
            <select
              value={selectedFilter.creatorType}
              onChange={(e) => setSelectedFilter({ ...selectedFilter, creatorType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Thể của nhà...</option>
              <option value="fashion">Thời trang</option>
              <option value="beauty">Làm đẹp</option>
              <option value="food">Đồ ăn & Đồ uống</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedFilter.category}
              onChange={(e) => setSelectedFilter({ ...selectedFilter, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Danh mục</option>
              <option value="all">Tất cả</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedFilter.status}
              onChange={(e) => setSelectedFilter({ ...selectedFilter, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Người theo...</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>

          <div className="flex gap-2 mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">
                Không nằm trong chương trình liên kết
              </span>
            </label>
            <label className="flex items-center gap-2 ml-4">
              <input
                type="checkbox"
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">
                Chưa mật trong 90 ngày qua
              </span>
            </label>
            <button className="ml-auto text-sm text-gray-600 hover:text-gray-800">
              Đặt lại
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 flex items-center gap-4">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Gần thể hàng loạt các nhà sáng tạo
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Mời hàng loạt
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Xóa hàng loạt
          </button>
        </div>

        {/* Table */}
        <div className="p-6">
          {selectedTab === "invited" && (
            <>
              {filteredCreators.length > 0 ? (
                <>
                  {/* Table Header */}
                  <div className="grid grid-cols-8 gap-4 pb-4 mb-4 border-b border-gray-200 text-sm font-medium text-gray-600">
                    <div className="col-span-2">Tên nhà sáng tạo</div>
                    <div>Thể</div>
                    <div className="text-right">
                      Sản phẩm trong trang trung bày
                    </div>
                    <div className="text-right">Video</div>
                    <div className="text-right">Buổi LWE</div>
                    <div className="text-right">Hành động</div>
                  </div>

                  {/* Table Rows */}
                  <div className="space-y-3">
                    {filteredCreators.map((creator) => (
                      <div
                        key={creator.id}
                        className="grid grid-cols-8 gap-4 items-center py-4 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="col-span-2 flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div>
                            <p className="font-medium text-gray-900">{creator.name}</p>
                            <p className="text-sm text-gray-600">{creator.category}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700">{creator.category}</div>
                        <div className="text-sm text-gray-700 text-right">
                          {creator.productsInStock}
                        </div>
                        <div className="text-sm text-gray-700 text-right">
                          {creator.video}
                        </div>
                        <div className="text-sm text-gray-700 text-right">
                          {creator.liveStreams}
                        </div>
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-gray-600 hover:text-gray-900">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Không có kết quả
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Danh sách trống
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <a
                      href="/affiliate/find-creators"
                      className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                    >
                      Tìm nhà sáng tạo
                    </a>
                    <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      Tải lên hàng loạt
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {selectedTab === "partnership" && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không có đối tác liên kết
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn chưa có đối tác liên kết nào
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
