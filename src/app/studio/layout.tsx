"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authFetch } from "@/lib/authFetch";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAddingAffiliate, setIsAddingAffiliate] = useState(false);

  // Check if user has affiliate role
  const hasAffiliateRole = user?.role?.split(',').map(r => r.trim()).includes('affiliate');

  // Handle affiliate registration
  const handleAffiliateRegister = async () => {
    setIsAddingAffiliate(true);
    try {
      const response = await authFetch('/api/users/add-affiliate-role', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        window.dispatchEvent(new Event('authChange'));
        
        // Reload page to show updated menu
        window.location.reload();
      } else {
        alert('Có lỗi xảy ra: ' + data.message);
      }
    } catch (error) {
      console.error('Error adding affiliate role:', error);
      alert('Có lỗi xảy ra khi đăng ký affiliate');
    } finally {
      setIsAddingAffiliate(false);
    }
  };

  useEffect(() => {
    const roles = user?.role?.split(',').map(r => r.trim()) || [];
    const hasCreatorRole = roles.includes('creator');
    const hasSellerRole = roles.includes('seller');
    
    if (!loading && (!user || (!hasCreatorRole && !hasSellerRole))) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  const roles = user?.role?.split(',').map(r => r.trim()) || [];
  const hasCreatorRole = roles.includes('creator');
  const hasSellerRole = roles.includes('seller');

  if (!user || (!hasCreatorRole && !hasSellerRole)) {
    return null;
  }

  const navigation = [
    {
      name: "Trang chủ",
      href: "/studio",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Bài đăng",
      href: "/studio/content",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "Phân tích",
      href: "/studio/analytics",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: "Bình luận",
      href: "/studio/comments",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Abbyumy</h1>
              <p className="text-xs text-gray-500">Studio</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/studio" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-orange-50 text-orange-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Affiliate Section */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              {hasAffiliateRole ? (
                // Show Video Management for creator + affiliate
                <Link
                  href="/studio/affiliate-videos"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === "/studio/affiliate-videos"
                      ? "bg-teal-50 text-teal-600 font-medium"
                      : "text-gray-700 hover:bg-teal-50"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  <span>Video quản lý liên kết</span>
                </Link>
              ) : (
                // Show Register Affiliate button
                <button
                  onClick={handleAffiliateRegister}
                  disabled={isAddingAffiliate}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isAddingAffiliate
                      ? "bg-gray-100 text-gray-400 cursor-wait"
                      : "text-teal-700 bg-teal-50 hover:bg-teal-100"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{isAddingAffiliate ? "Đang xử lý..." : "Đăng ký làm Affiliate"}</span>
                  {!isAddingAffiliate && (
                    <svg
                      className="w-4 h-4 ml-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">@{user.email?.split('@')[0]}</p>
            </div>
          </div>
          <Link
            href="/"
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại trang chủ
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
