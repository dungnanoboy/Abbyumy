"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import KitchenLayout from "@/components/KitchenLayout";
import Link from "next/link";

export default function SavedRecipesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchSavedRecipes();
    }
  }, [user, authLoading, router]);

  const fetchSavedRecipes = async () => {
    try {
      const userId = user?._id || user?.id;
      const response = await fetch(`/api/users/${userId}/saved-recipes`);
      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
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

  if (!user) return null;

  return (
    <KitchenLayout userName={user.name} userAvatar={user.avatar} userRole={user.role}>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Công thức đã lưu</h1>
          <p className="text-gray-600 mt-1">{recipes.length} công thức</p>
        </div>

        <div className="p-6">
          {recipes.length === 0 ? (
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
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              <p className="text-gray-500 mb-4">Chưa có công thức nào được lưu</p>
              <Link
                href="/recipes"
                className="inline-block px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Khám phá công thức
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe: any) => (
                <Link
                  key={recipe._id}
                  href={`/recipes/${recipe._id}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48">
                    <img
                      src={recipe.strMealThumb || "/placeholder-recipe.jpg"}
                      alt={recipe.strMeal}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                      {recipe.strMeal}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        {recipe.strCategory}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </KitchenLayout>
  );
}
