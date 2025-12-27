"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Lưu user vào localStorage (bao gồm cả role và stats)
        localStorage.setItem("currentUser", JSON.stringify({
          id: data.user._id,
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar,
          bio: data.user.bio,
          recipeCount: data.user.recipeCount,
          role: data.user.role || 'user',
          followers: data.user.followers || [],
          following: data.user.following || [],
          stats: data.user.stats || {
            totalFollowers: data.user.followers?.length || 0,
            totalFollowing: data.user.following?.length || 0,
            totalLikes: 0,
            totalViews: 0,
          },
        }));
        
        // Dispatch event to notify other components
        window.dispatchEvent(new Event("authChange"));
        
        // Check if there's a redirect URL
        const redirectUrl = localStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
          localStorage.removeItem('redirectAfterLogin');
          router.push(redirectUrl);
        } else {
          // Nếu là admin, redirect về trang admin
          if (data.user.role === 'admin') {
            router.push("/admin");
          } else {
            // Người dùng thường redirect về trang chủ
            router.push("/");
          }
        }
        router.refresh();
      } else {
        setError(data.message || "Email hoặc mật khẩu không đúng!");
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Có lỗi xảy ra. Vui lòng thử lại!");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Đăng nhập
            </h1>
            <p className="text-gray-600">
              Chào mừng bạn quay lại với Abbyumy! 🍳
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-400"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 space-y-3">
            {/* User accounts */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                👤 Tài khoản người dùng:
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• nguyenvana@example.com / 123456</p>
                <p>• tranthib@example.com / 123456</p>
                <p>• levanc@example.com / 123456</p>
              </div>
            </div>

            {/* Admin account */}
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
                🛡️ Tài khoản quản trị:
              </p>
              <div className="text-xs text-purple-600 font-medium">
                <p>• admin@example.com / 123456</p>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-orange-500 font-medium hover:text-orange-600">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
