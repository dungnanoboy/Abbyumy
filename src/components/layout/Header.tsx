"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-orange-500 text-white shadow-md">
      <div className="container mx-auto px-4">
        {/* Top Navigation */}
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold">🍳 Abbyumy</div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="search"
                placeholder="Tìm kiếm công thức, video, tác giả..."
                className="w-full px-4 py-2.5 pl-11 rounded-full text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-500 shadow-lg"
              />
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Cart Icon */}
                <Link
                  href="/cart"
                  className="relative p-2 hover:bg-orange-600 rounded-full transition-colors"
                  title="Giỏ hàng"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </Link>

                <Link 
                  href="/recipes/new" 
                  className="bg-white text-orange-500 px-5 py-2.5 rounded-full font-medium hover:bg-orange-50 hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Đăng công thức
                </Link>
                
                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-white text-orange-500 rounded-full flex items-center justify-center font-semibold text-sm border-2 border-white">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm font-medium">{user.name}</span>
                    <svg 
                      className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">@{user.email?.split('@')[0]}</p>
                      </div>

                      {/* Menu Items */}
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Bếp cá nhân
                      </Link>

                      <Link
                        href="/messages"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Tin nhắn
                      </Link>

                      {/* Creator Studio - Only show for creator/seller role */}
                      {(user.role === 'creator' || user.role === 'seller') && (
                        <Link
                          href="/studio"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-orange-700 hover:bg-orange-50 transition-colors border-y border-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="font-semibold">Creator Studio</span>
                        </Link>
                      )}

                      {/* Abbyumy Shop Seller - Show for seller with active shop OR show register link if not seller yet */}
                      {user.role === 'seller' && user.shop?.isActive ? (
                        <Link
                          href="/seller"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50 transition-colors border-b border-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span className="font-semibold">Abbyumy Shop Seller</span>
                        </Link>
                      ) : (
                        <Link
                          href="/seller/register"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50 transition-colors border-b border-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span className="font-semibold">Abbyumy Shop Seller</span>
                        </Link>
                      )}

                      {/* Admin Menu - Only show for admin role */}
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 transition-colors border-y border-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="font-semibold">Trang quản trị</span>
                        </Link>
                      )}

                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Cài đặt
                      </Link>

                      <Link
                        href="/saved"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Gửi Góp Ý
                      </Link>

                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Thoát
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/register" 
                  className="bg-white text-orange-500 px-5 py-2.5 rounded-full font-medium hover:bg-orange-50 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Đăng ký
                </Link>
                <Link 
                  href="/login" 
                  className="px-5 py-2.5 font-medium hover:text-orange-100 hover:bg-orange-600 rounded-full transition-all duration-200"
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Secondary Navigation */}
        <nav className="border-t border-orange-400">
          <ul className="flex gap-1">
            <li>
              <Link 
                href="/" 
                className={`block px-5 py-3 text-sm font-medium transition-all relative ${
                  pathname === '/' 
                    ? 'text-white bg-orange-600' 
                    : 'text-orange-50 hover:text-white hover:bg-orange-600/50'
                }`}
              >
                <span className="relative z-10">🏠 Trang chủ</span>
                {pathname === '/' && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-md"></span>
                )}
              </Link>
            </li>
            <li>
              <Link 
                href="/explore" 
                className={`block px-5 py-3 text-sm font-medium transition-all relative ${
                  pathname === '/explore' 
                    ? 'text-white bg-orange-600' 
                    : 'text-orange-50 hover:text-white hover:bg-orange-600/50'
                }`}
              >
                <span className="relative z-10">🔍 Khám phá</span>
                {pathname === '/explore' && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-md"></span>
                )}
              </Link>
            </li>
            <li>
              <Link 
                href="/recipes" 
                className={`block px-5 py-3 text-sm font-medium transition-all relative ${
                  pathname.startsWith('/recipes') 
                    ? 'text-white bg-orange-600' 
                    : 'text-orange-50 hover:text-white hover:bg-orange-600/50'
                }`}
              >
                <span className="relative z-10">📖 Công thức</span>
                {pathname.startsWith('/recipes') && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-md"></span>
                )}
              </Link>
            </li>
            <li>
              <Link 
                href="/shop" 
                className={`block px-5 py-3 text-sm font-medium transition-all relative ${
                  pathname.startsWith('/shop') 
                    ? 'text-white bg-orange-600' 
                    : 'text-orange-50 hover:text-white hover:bg-orange-600/50'
                }`}
              >
                <span className="relative z-10">�️ Cửa hàng</span>
                {pathname.startsWith('/shop') && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-md"></span>
                )}
              </Link>
            </li>
            <li>
              <Link 
                href="/abbyshort" 
                className={`block px-5 py-3 text-sm font-medium transition-all relative ${
                  pathname === '/abbyshort' 
                    ? 'text-white bg-orange-600' 
                    : 'text-orange-50 hover:text-white hover:bg-orange-600/50'
                }`}
              >
                <span className="relative z-10">� AbbyShort</span>
                {pathname === '/abbyshort' && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-md"></span>
                )}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
