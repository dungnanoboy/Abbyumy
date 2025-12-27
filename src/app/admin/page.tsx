"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  totalUsers: number;
  totalRecipes: number;
  totalShorts: number;
  totalComments: number;
  totalViews: number;
  totalLikes: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRecipes: 0,
    totalShorts: 0,
    totalComments: 0,
    totalViews: 0,
    totalLikes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch users count
      const usersRes = await fetch("/api/users");
      const usersData = await usersRes.json();

      // Fetch recipes with stats
      const recipesRes = await fetch("/api/recipes");
      const recipesData = await recipesRes.json();

      // Fetch shorts count
      const shortsRes = await fetch("/api/shorts");
      const shortsData = await shortsRes.json();

      // Fetch comments count (from API stats)
      const statsRes = await fetch("/api/admin/stats");
      const statsData = await statsRes.json();

      const totalViews = recipesData.recipes?.reduce(
        (sum: number, recipe: any) => sum + (recipe.views || 0),
        0
      ) || 0;

      const totalLikes = recipesData.recipes?.reduce(
        (sum: number, recipe: any) => sum + (recipe.likes || 0),
        0
      ) || 0;

      setStats({
        totalUsers: usersData.users?.length || 0,
        totalRecipes: recipesData.recipes?.length || 0,
        totalShorts: shortsData.shorts?.length || 0,
        totalComments: statsData.totalComments || 0,
        totalViews,
        totalLikes,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Tổng quan hệ thống Abbyumy</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">
            {stats.totalUsers}
          </h3>
          <p className="text-sm text-gray-600">Người dùng</p>
        </div>

        {/* Total Recipes */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">
            {stats.totalRecipes}
          </h3>
          <p className="text-sm text-gray-600">Công thức</p>
        </div>

        {/* Total Shorts */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">
            {stats.totalShorts}
          </h3>
          <p className="text-sm text-gray-600">AbbyShort</p>
        </div>

        {/* Total Comments */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">
            {stats.totalComments.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600">Bình luận</p>
        </div>

        {/* Total Views */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">
            {stats.totalViews.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600">Lượt xem</p>
        </div>

        {/* Total Likes */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">
            {stats.totalLikes.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600">Lượt thích</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Người dùng mới
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm">
              Hiển thị danh sách người dùng đăng ký gần đây...
            </p>
          </div>
        </div>

        {/* Recent Recipes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Công thức mới
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm">
              Hiển thị công thức được đăng gần đây...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
