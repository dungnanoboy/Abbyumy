"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ExplorePage() {
  const [trendingRecipes, setTrendingRecipes] = useState<any[]>([]);
  const [popularCreators, setPopularCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExploreData();
  }, []);

  const fetchExploreData = async () => {
    try {
      // Fetch trending recipes (sorted by likes, limit to 8 for 2 rows)
      const recipesRes = await fetch("/api/recipes?limit=8&sort=likes");
      const recipesData = await recipesRes.json();
      if (recipesData.success) {
        setTrendingRecipes(recipesData.recipes);
      }

      // Fetch popular creators
      const usersRes = await fetch("/api/users?limit=6&sort=followers");
      const usersData = await usersRes.json();
      if (usersData.success) {
        setPopularCreators(usersData.users);
      }
    } catch (error) {
      console.error("Error fetching explore data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 md:p-12 text-white mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🔍 Khám phá món ngon
          </h1>
          <p className="text-lg md:text-xl text-orange-50 max-w-2xl">
            Tìm kiếm công thức độc đáo, khám phá đầu bếp tài năng và cập nhật xu hướng ẩm thực mới nhất
          </p>
        </div>

        {/* Categories Quick Access */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            📂 Danh mục phổ biến
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Món Việt", icon: "🍜", color: "bg-red-100 text-red-600" },
              { name: "Món Âu", icon: "🍝", color: "bg-blue-100 text-blue-600" },
              { name: "Món Á", icon: "🍱", color: "bg-green-100 text-green-600" },
              { name: "Tráng miệng", icon: "🍰", color: "bg-pink-100 text-pink-600" },
              { name: "Đồ uống", icon: "🥤", color: "bg-purple-100 text-purple-600" },
              { name: "Ăn vặt", icon: "🍿", color: "bg-yellow-100 text-yellow-600" },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={`/categories?name=${cat.name}`}
                className={`${cat.color} rounded-2xl p-6 text-center hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
              >
                <div className="text-4xl mb-2">{cat.icon}</div>
                <div className="font-semibold">{cat.name}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Creators */}
        {popularCreators.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                ⭐ Đầu bếp nổi bật
              </h2>
              <Link
                href="/creators"
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularCreators.map((creator) => (
                <Link
                  key={creator._id}
                  href={`/profile/${creator._id}`}
                  className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {creator.avatar ? (
                    <Image
                      src={creator.avatar}
                      alt={creator.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-orange-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-3xl text-orange-600 font-semibold">
                        {creator.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-800 mb-1 truncate">
                    {creator.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {creator.stats?.totalFollowers || 0} người theo dõi
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trending Recipes */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              🔥 Công thức được yêu thích nhất
            </h2>
            <Link
              href="/trending"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingRecipes.map((recipe) => (
              <Link
                key={recipe._id}
                href={`/recipes/${recipe._id}`}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <div className="relative h-48">
                  {recipe.strMealThumb ? (
                    <Image
                      src={recipe.strMealThumb}
                      alt={recipe.strMeal}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center">
                      <span className="text-6xl">🍳</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-red-500 text-white rounded-full px-3 py-1 text-xs font-bold shadow-lg flex items-center gap-1">
                    ❤️ {recipe.likes || 0}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                    {recipe.strMeal}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>👁️ {recipe.views || 0}</span>
                    <span>💬 {recipe.commentsCount || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Explore More Section */}
        <section className="mt-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            🎉 Khám phá thêm nhiều điều thú vị
          </h2>
          <p className="text-lg text-purple-50 mb-6 max-w-2xl mx-auto">
            Tham gia cộng đồng ẩm thực sôi động với hàng ngàn công thức và đầu bếp tài năng
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:bg-purple-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Tham gia ngay
          </Link>
        </section>
      </div>
    </div>
  );
}
