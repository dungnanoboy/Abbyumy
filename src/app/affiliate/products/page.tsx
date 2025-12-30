"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, ExternalLink, Package, DollarSign } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  commission: number;
  stock: number;
  sales: number;
  status: "active" | "inactive";
  image?: string;
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock products - replace with API call
  const products: Product[] = [];

  const filteredProducts = products.filter((product) => {
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== "all" && product.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
          <p className="text-gray-600 mt-1">
            Quản lý sản phẩm và thiết lập hoa hồng cho affiliate
          </p>
        </div>
        <button className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="fashion">Thời trang</option>
            <option value="beauty">Làm đẹp</option>
            <option value="food">Đồ ăn & Đồ uống</option>
            <option value="electronics">Điện tử</option>
          </select>
        </div>
      </div>

      {/* Products Table/Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredProducts.length > 0 ? (
          <div className="p-6">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-4 mb-4 border-b border-gray-200 text-sm font-medium text-gray-600">
              <div className="col-span-4">Sản phẩm</div>
              <div className="col-span-2">Danh mục</div>
              <div className="col-span-1 text-right">Giá</div>
              <div className="col-span-2 text-right">Hoa hồng</div>
              <div className="col-span-1 text-right">Tồn kho</div>
              <div className="col-span-1 text-right">Đã bán</div>
              <div className="col-span-1 text-right">Hành động</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-12 gap-4 items-center py-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {/* Product Info */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          product.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {product.status === "active" ? "Đang bán" : "Tạm dừng"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-2 text-sm text-gray-700">{product.category}</div>

                  {/* Price */}
                  <div className="col-span-1 text-sm text-gray-900 font-medium text-right">
                    {product.price.toLocaleString()} ₫
                  </div>

                  {/* Commission */}
                  <div className="col-span-2 text-right">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
                      <DollarSign className="w-4 h-4" />
                      {product.commission}%
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="col-span-1 text-sm text-gray-700 text-right">{product.stock}</div>

                  {/* Sales */}
                  <div className="col-span-1 text-sm text-gray-700 text-right">{product.sales}</div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end gap-2">
                    <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
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
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có sản phẩm nào
            </h3>
            <p className="text-gray-600 mb-6">
              Bắt đầu thêm sản phẩm để cho phép affiliate quảng bá
            </p>
            <button className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Thêm sản phẩm đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Commission Setup Tips */}
      <div className="mt-6 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-teal-600" />
          Hướng dẫn thiết lập hoa hồng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4 border border-teal-100">
            <p className="font-medium text-gray-900 mb-1">Hoa hồng thấp (3-5%)</p>
            <p className="text-gray-600">Phù hợp với sản phẩm có biên lợi nhuận thấp hoặc giá cao</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-teal-100">
            <p className="font-medium text-gray-900 mb-1">Hoa hồng trung bình (8-12%)</p>
            <p className="text-gray-600">Mức phổ biến, cân bằng giữa thu hút affiliate và lợi nhuận</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-teal-100">
            <p className="font-medium text-gray-900 mb-1">Hoa hồng cao (15-25%)</p>
            <p className="text-gray-600">Cho chiến dịch đặc biệt hoặc sản phẩm cần đẩy mạnh</p>
          </div>
        </div>
      </div>
    </div>
  );
}
