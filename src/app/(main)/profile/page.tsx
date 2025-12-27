"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import KitchenLayout from "@/components/KitchenLayout";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"recipes" | "saved" | "cooksnaps">("recipes");
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [userRecipes, setUserRecipes] = useState<any[]>([]);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch saved recipes when user is loaded
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      fetchSavedRecipes(userId);
      fetchUserRecipes(userId);
      // Fetch products if user is seller or admin
      if (user.role === 'seller' || user.role === 'admin') {
        fetchUserProducts(userId);
      }
    }
  }, [user?._id, user?.id, user?.role]);

  const fetchUserRecipes = async (userId: string) => {
    setLoadingRecipes(true);
    try {
      const res = await fetch(`/api/users/${userId}/recipes`);
      if (res.ok) {
        const data = await res.json();
        setUserRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error fetching user recipes:', error);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const fetchSavedRecipes = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/saved-recipes`);
      if (res.ok) {
        const data = await res.json();
        setSavedRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
    }
  };

  const fetchUserProducts = async (userId: string) => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/users/${userId}/products`);
      if (res.ok) {
        const data = await res.json();
        setUserProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching user products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  if (loading) {
    return (
      <KitchenLayout userName={user?.name} userAvatar={user?.avatar} userRole={user?.role}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </KitchenLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <KitchenLayout userName={user.name} userAvatar={user.avatar} userRole={user.role}>
      <div className="bg-white rounded-lg shadow-sm">
        {/* Profile Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 bg-orange-500 text-white rounded-full flex items-center justify-center text-3xl font-bold border-4 border-gray-200">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {user.name}
              </h1>
              <p className="text-gray-600 mb-4">
                @{user.email?.split('@')[0] || user.id}
              </p>

              {user.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="flex gap-8 mb-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800">
                    {userRecipes.length}
                  </p>
                  <p className="text-sm text-gray-600">Công thức</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800">
                    {user.stats?.totalFollowers || user.followers?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Người theo dõi</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800">
                    {user.following?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Đang theo dõi</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800">
                    {savedRecipes.length}
                  </p>
                  <p className="text-sm text-gray-600">Đã lưu</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800">0</p>
                  <p className="text-sm text-gray-600">Cooksnaps</p>
                </div>
              </div>

              {/* Edit Profile Button */}
              <Link 
                href="/settings"
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors inline-block"
              >
                Sửa thông tin cá nhân
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("recipes")}
              className={`flex-1 px-6 py-4 font-medium ${
                activeTab === "recipes"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Công thức ({userRecipes.length})
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex-1 px-6 py-4 font-medium ${
                activeTab === "saved"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Đã lưu ({savedRecipes.length})
            </button>
            <button
              onClick={() => setActiveTab("cooksnaps")}
              className={`flex-1 px-6 py-4 font-medium ${
                activeTab === "cooksnaps"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Cooksnaps (0)
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
        {activeTab === "recipes" ? (
          loadingRecipes ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : userRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRecipes.map((recipe: any) => (
                <Link
                  key={recipe._id}
                  href={`/recipes/${recipe._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <img
                      src={recipe.strMealThumb || '/placeholder-recipe.jpg'}
                      alt={recipe.strMeal}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                      {recipe.strMeal}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        ❤️ {recipe.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        👁️ {recipe.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        📸 {recipe.cooksnaps || 0}
                      </span>
                    </div>
                    {recipe.strCategory && (
                      <div className="mt-2">
                        <span className="inline-block bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                          {recipe.strCategory}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
          <div className="max-w-2xl mx-auto text-center py-16">
            {/* Empty State Icon */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gray-100 rounded-full">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>

            {/* Empty State Message */}
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Nào, bắt đầu viết cách làm món đầu tiên thôi!
            </h2>
            <p className="text-gray-600 mb-2">
              Bạn vẫn chưa đăng món nào. Hãy chia sẻ món bạn
            </p>
            <p className="text-gray-600 mb-8">
              yêu thích và bạn sẽ thấy món ấy ở đây nhé!
            </p>

            {/* CTA Button */}
            <Link
              href="/recipes/new"
              className="inline-block bg-gray-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Viết món mới
            </Link>
          </div>
          )
        ) : activeTab === "saved" ? (
          savedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.map((recipe: any) => (
                <Link
                  key={recipe._id}
                  href={`/recipes/${recipe._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <img
                      src={recipe.strMealThumb || '/placeholder-recipe.jpg'}
                      alt={recipe.strMeal}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                      {recipe.strMeal}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        ❤️ {recipe.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        👁️ {recipe.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        📸 {recipe.cooksnaps || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gray-100 rounded-full">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Chưa có công thức nào được lưu
              </h2>
              <p className="text-gray-600 mb-8">
                Hãy khám phá và lưu các công thức yêu thích của bạn!
              </p>
              <Link
                href="/"
                className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Khám phá công thức
              </Link>
            </div>
          )
        ) : activeTab === "cooksnaps" ? (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gray-100 rounded-full">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Chưa có Cooksnaps nào
            </h2>
            <p className="text-gray-600 mb-8">
              Hãy thử làm theo một công thức và chia sẻ kết quả của bạn!
            </p>
          </div>
        ) : activeTab === "shop" ? (
          // Shop Tab
          loadingProducts ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : userProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProducts.map((product: any) => (
                <Link
                  key={product._id}
                  href={`/shop/${product._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                    )}
                    {/* Status Badge */}
                    {product.status === 'inactive' && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                          Ngừng bán
                        </span>
                      </div>
                    )}
                    {/* Stock Badge */}
                    {product.stock < 10 && product.stock > 0 && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Còn {product.stock}
                        </span>
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Hết hàng</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-orange-500 font-bold text-xl">
                        {formatPrice(product.price)}₫
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span>{product.rating}</span>
                        <span className="text-gray-400">({product.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                        {product.category}
                      </span>
                      <span className="text-gray-500">
                        SKU: {product.sku}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gray-100 rounded-full">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Chưa có sản phẩm nào
              </h2>
              <p className="text-gray-600 mb-8">
                {user.role === 'admin' 
                  ? 'Hãy thêm sản phẩm vào cửa hàng từ trang quản trị!'
                  : 'Bắt đầu bán sản phẩm của bạn ngay hôm nay!'}
              </p>
              {user.role === 'admin' && (
                <Link
                  href="/admin/products"
                  className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Quản lý sản phẩm
                </Link>
              )}
            </div>
          )
        ) : null}
        </div>
      </div>
    </KitchenLayout>
  );
}
