"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  Search,
  TrendingUp,
  BarChart3,
  Package,
  Video,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role?: string;
  shop?: {
    isActive: boolean;
    businessName?: string;
  };
}

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["main"]);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = localStorage.getItem("currentUser");
      if (!currentUser) {
        router.push("/login");
        return;
      }

      const userData = JSON.parse(currentUser);
      
      // Check if user has affiliate role
      const roles = userData.role?.split(",").map((r: string) => r.trim()) || [];
      if (!roles.includes("affiliate")) {
        router.push("/");
        return;
      }

      setUser(userData);
      setIsLoading(false);
    };

    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, [router]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  // Get user roles
  const roles = user?.role?.split(",").map((r) => r.trim()) || [];
  const hasSellerRole = roles.includes("seller");
  const hasCreatorRole = roles.includes("creator");
  const hasAffiliateRole = roles.includes("affiliate");

  // Navigation items based on roles
  const navigationItems = [
    {
      id: "main",
      title: "Công tác",
      icon: Home,
      children: [
        { href: "/affiliate", label: "Công tác mở", icon: Home },
        { href: "/affiliate/objectives", label: "Công tác mục tiêu", icon: TrendingUp },
      ],
    },
    {
      id: "creators",
      title: "Khám phá các nhà sáng tạo",
      icon: Users,
      children: [
        { href: "/affiliate/find-creators", label: "Tìm nhà sáng tạo", icon: Search },
        { href: "/affiliate/rankings", label: "Xem bảng xếp hạng", icon: TrendingUp },
      ],
    },
    {
      id: "manage",
      title: "Quản lý nhà sáng tạo",
      icon: Users,
      href: "/affiliate/manage-creators",
    },
    // Seller-only features
    ...(hasSellerRole
      ? [
          {
            id: "products",
            title: "Sản phẩm",
            icon: Package,
            children: [
              { href: "/affiliate/products", label: "Tất cả sản phẩm", icon: Package },
              { href: "/affiliate/products/add", label: "Thêm sản phẩm", icon: Package },
            ],
          },
        ]
      : []),
    // Creator-only features
    ...(hasCreatorRole
      ? [
          {
            id: "videos",
            title: "Video",
            icon: Video,
            children: [
              { href: "/affiliate/videos", label: "Tất cả video", icon: Video },
              { href: "/affiliate/videos/create", label: "Tạo video mới", icon: Video },
            ],
          },
        ]
      : []),
    {
      id: "analytics",
      title: "Phân tích",
      icon: BarChart3,
      children: [
        { href: "/affiliate/analytics", label: "Hiệu suất", icon: BarChart3 },
        { href: "/affiliate/analytics/creators", label: "Hiệu suất nhà sáng tạo", icon: Users },
        ...(hasSellerRole ? [{ href: "/affiliate/analytics/products", label: "Hiệu suất sản phẩm", icon: Package }] : []),
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          {/* User Info */}
          <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <div className="flex gap-1 mt-1">
                  {hasAffiliateRole && (
                    <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded">
                      Affiliate
                    </span>
                  )}
                  {hasSellerRole && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      Seller
                    </span>
                  )}
                  {hasCreatorRole && (
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                      Creator
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isExpanded = expandedMenus.includes(item.id);
              const hasChildren = "children" in item && item.children;

              if (!hasChildren && item.href) {
                // Single menu item
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      pathname === item.href
                        ? "bg-teal-50 text-teal-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                );
              }

              // Menu with children
              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {isExpanded && hasChildren && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              pathname === child.href
                                ? "bg-teal-50 text-teal-700"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <ChildIcon className="w-4 h-4" />
                            <span className="text-sm">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Trung tâm nhà bán hàng link */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href="https://affiliate.tiktok.com"
              target="_blank"
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Trung tâm nhà bán hàng
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-16">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
