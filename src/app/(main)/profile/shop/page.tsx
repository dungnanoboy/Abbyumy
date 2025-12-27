"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import KitchenLayout from "@/components/KitchenLayout";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  status: string;
}

export default function MyShopPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && (user.role === "seller" || user.role === "admin")) {
      fetchProducts();
    } else if (user) {
      router.push("/profile");
    }
  }, [user, authLoading, router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/users/${user?._id}/products`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <KitchenLayout userName={user?.name} userAvatar={user?.avatar}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </KitchenLayout>
    );
  }

  if (!user) return null;

  return (
    <KitchenLayout userName={user.name} userAvatar={user.avatar} userRole={user.role}>
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sản phẩm của tôi</h1>
            <p className="text-gray-600 mt-1">Quản lý sản phẩm đang bán</p>
          </div>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Thêm sản phẩm mới
          </Link>
        </div>

        {/* Products Grid */}
        <div className="p-6">
          {products.length === 0 ? (
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <p className="text-gray-500 mb-4">Chưa có sản phẩm nào</p>
              <Link
                href="/admin/products/new"
                className="inline-block px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Thêm sản phẩm đầu tiên
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-orange-600 mb-2">
                      {product.price.toLocaleString("vi-VN")}₫
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Kho: {product.stock}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          product.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.status === "active" ? "Đang bán" : "Tạm ngưng"}
                      </span>
                    </div>
                    <Link
                      href={`/admin/products/${product._id}`}
                      className="block mt-3 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Chỉnh sửa
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </KitchenLayout>
  );
}
