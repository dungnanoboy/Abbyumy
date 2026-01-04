"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authFetch } from "@/lib/authFetch";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAddingAffiliate, setIsAddingAffiliate] = useState(false);

  // Check if user has affiliate role
  const hasAffiliateRole = user?.role?.split(',').map(r => r.trim()).includes('affiliate');

  // Handle affiliate center access
  const handleAffiliateCenterClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    console.log('User data:', user);
    console.log('Has affiliate role:', hasAffiliateRole);
    
    if (hasAffiliateRole) {
      // Already has affiliate role, just navigate
      router.push('/affiliate');
      return;
    }

    // Need to add affiliate role first
    setIsAddingAffiliate(true);
    try {
      console.log('Calling add-affiliate-role API...');
      const response = await authFetch('/api/users/add-affiliate-role', {
        method: 'POST',
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        window.dispatchEvent(new Event('authChange'));
        
        // Navigate to affiliate center
        router.push('/affiliate');
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
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    // Allow anyone to access register page
    if (pathname?.includes("/register")) {
      return;
    }

    const roles = user?.role?.split(',').map(r => r.trim()) || [];
    const hasSellerRole = roles.includes('seller');

    // If user is not seller and not on register page, redirect to home
    if (!loading && user && !hasSellerRole) {
      router.push("/");
      return;
    }

    // If seller but shop not active, redirect to pending page
    if (!loading && user && hasSellerRole && !user.shop?.isActive) {
      if (!pathname?.includes("/pending")) {
        router.push("/seller/pending");
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // For pending and register pages, show without sidebar (allow all logged-in users)
  if (pathname?.includes("/pending") || pathname?.includes("/register")) {
    return <>{children}</>;
  }

  const roles = user?.role?.split(',').map(r => r.trim()) || [];
  const hasSellerRole = roles.includes('seller');

  // For dashboard pages, require seller role
  if (!user || !hasSellerRole) {
    return null;
  }

  // If shop not active and not on pending/register page, show nothing (will redirect)
  if (!user.shop?.isActive) {
    return null;
  }

  const menuItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      label: "Trang chủ",
      href: "/seller",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      label: "Đơn hàng",
      href: "/seller/orders",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      label: "Sản phẩm",
      href: "/seller/products",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
          />
        </svg>
      ),
      label: "Marketing",
      href: "/seller/marketing",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      label: "Liên kết",
      href: "/seller/affiliates",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
      label: "LIVE và video",
      href: "/seller/live",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      label: "La bàn dữ liệu",
      href: "/seller/analytics",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      label: "Tài chính",
      href: "/seller/finance",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: "Cài đặt",
      href: "/seller/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-16">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/seller" className="flex items-center gap-2">
              <span className="text-2xl">🛍️</span>
              <div>
                <span className="text-lg font-bold text-gray-900">Abbyumy Shop Seller</span>
                <p className="text-xs text-gray-600">Trung tâm người bán</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-right">
              <p className="font-medium text-gray-900">{user.shop?.shopName}</p>
              <p className="text-xs text-gray-600">{user.name}</p>
            </div>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              
              // Special handling for Affiliate/Link menu item
              if (item.href === "/seller/affiliates") {
                return (
                  <li key={item.href}>
                    <button
                      onClick={handleAffiliateCenterClick}
                      disabled={isAddingAffiliate}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isAddingAffiliate
                          ? "bg-gray-100 text-gray-400 cursor-wait"
                          : "text-gray-700 hover:bg-teal-50 hover:text-teal-600"
                      }`}
                    >
                      {item.icon}
                      <span className="text-sm">
                        {isAddingAffiliate
                          ? "Đang xử lý..."
                          : hasAffiliateRole
                          ? "Trung tâm liên kết"
                          : "Đi đến trung tâm liên kết"}
                      </span>
                      {!hasAffiliateRole && !isAddingAffiliate && (
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
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Back to Site */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Về trang chủ</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
