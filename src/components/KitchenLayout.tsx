"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface KitchenLayoutProps {
  children: ReactNode;
  userName?: string;
  userAvatar?: string;
  userRole?: string;
}

export default function KitchenLayout({ children, userName, userAvatar, userRole }: KitchenLayoutProps) {
  const pathname = usePathname();

  const baseMenuItems = [
    {
      title: "Bếp của tôi",
      items: [
        { name: "Công thức", href: "/profile", icon: "📖" },
        { name: "Đã lưu", href: "/profile/saved", icon: "🔖" },
        { name: "Cooksnaps", href: "/profile/cooksnaps", icon: "📷" },
      ],
    },
    {
      title: "Mua sắm",
      items: [
        { name: "Đơn hàng", href: "/profile/orders", icon: "📦" },
        { name: "Kho Voucher", href: "/profile/coupons", icon: "🎫" },
      ],
    },
  ];

  const sellerMenu = {
    title: "Cửa hàng",
    items: [
      { name: "Sản phẩm", href: "/profile/shop", icon: "🛍️" },
    ],
  };

  const menuItems = (userRole === "seller" || userRole === "admin") 
    ? [...baseMenuItems, sellerMenu]
    : baseMenuItems;

  const isActive = (href: string) => {
    if (href === "/profile") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              {/* User Info */}
              <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-xl">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    "👤"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{userName || "Người dùng"}</h3>
                </div>
              </div>

              {/* Menu */}
              <nav className="mt-6 space-y-6">
                {menuItems.map((section, idx) => (
                  <div key={idx}>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {section.title}
                    </h4>
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              isActive(item.href)
                                ? "bg-orange-50 text-orange-600 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">{children}</div>
        </div>
      </div>
    </div>
  );
}
