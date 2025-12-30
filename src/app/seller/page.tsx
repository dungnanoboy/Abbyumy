"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import Link from "next/link";

interface OrderStats {
  pending: number;
  processing: number;
  shipped: number;
  completed: number;
  cancelled: number;
  total: number;
}

interface FinanceStats {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  pendingPayout: number;
}

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [orderStats, setOrderStats] = useState<OrderStats>({
    pending: 0,
    processing: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  });
  const [financeStats, setFinanceStats] = useState<FinanceStats>({
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    pendingPayout: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats - mock data for now
    setTimeout(() => {
      setOrderStats({
        pending: 5,
        processing: 12,
        shipped: 8,
        completed: 45,
        cancelled: 3,
        total: 73,
      });
      setFinanceStats({
        todayRevenue: 1250000,
        weekRevenue: 8500000,
        monthRevenue: 35000000,
        pendingPayout: 5200000,
      });
      setLoading(false);
    }, 500);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const quickActions = [
    {
      icon: "📦",
      title: "Thêm sản phẩm",
      description: "Tạo sản phẩm mới",
      href: "/seller/products/new",
      color: "blue",
    },
    {
      icon: "📋",
      title: "Quản lý đơn hàng",
      description: "Xem tất cả đơn hàng",
      href: "/seller/orders",
      color: "green",
    },
    {
      icon: "📊",
      title: "Xem báo cáo",
      description: "Thống kê bán hàng",
      href: "/seller/analytics",
      color: "purple",
    },
    {
      icon: "💰",
      title: "Tài chính",
      description: "Quản lý doanh thu",
      href: "/seller/finance",
      color: "orange",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Chào mừng trở lại, {user?.shop?.shopName}! 👋</h1>
        <p className="text-blue-100">Đây là tổng quan về hoạt động kinh doanh của bạn hôm nay</p>
      </div>

      {/* Finance Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan tài chính</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Doanh thu hôm nay</span>
              <span className="text-2xl">💵</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(financeStats.todayRevenue)}</p>
            <p className="text-xs text-green-600 mt-1">↑ 12.5% so với hôm qua</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Doanh thu tuần này</span>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(financeStats.weekRevenue)}</p>
            <p className="text-xs text-green-600 mt-1">↑ 8.3% so với tuần trước</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Doanh thu tháng này</span>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(financeStats.monthRevenue)}</p>
            <p className="text-xs text-green-600 mt-1">↑ 15.7% so với tháng trước</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Chờ thanh toán</span>
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(financeStats.pendingPayout)}</p>
            <p className="text-xs text-gray-600 mt-1">Thanh toán vào 05/01</p>
          </div>
        </div>
      </div>

      {/* Order Management */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Quản lý đơn hàng</h2>
          <Link href="/seller/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Xem tất cả →
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Link
              href="/seller/orders?status=all"
              className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-3xl mb-2">📦</div>
              <div className="text-2xl font-bold text-gray-900">{orderStats.total}</div>
              <div className="text-sm text-gray-600 mt-1">Tất cả</div>
            </Link>

            <Link
              href="/seller/orders?status=pending"
              className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-3xl mb-2">⏰</div>
              <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
              <div className="text-sm text-gray-600 mt-1">Chờ xử lý</div>
            </Link>

            <Link
              href="/seller/orders?status=processing"
              className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-3xl mb-2">📋</div>
              <div className="text-2xl font-bold text-blue-600">{orderStats.processing}</div>
              <div className="text-sm text-gray-600 mt-1">Đang xử lý</div>
            </Link>

            <Link
              href="/seller/orders?status=shipped"
              className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-3xl mb-2">🚚</div>
              <div className="text-2xl font-bold text-purple-600">{orderStats.shipped}</div>
              <div className="text-sm text-gray-600 mt-1">Đang giao</div>
            </Link>

            <Link
              href="/seller/orders?status=completed"
              className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600">{orderStats.completed}</div>
              <div className="text-sm text-gray-600 mt-1">Hoàn thành</div>
            </Link>

            <Link
              href="/seller/orders?status=cancelled"
              className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-3xl mb-2">❌</div>
              <div className="text-2xl font-bold text-red-600">{orderStats.cancelled}</div>
              <div className="text-sm text-gray-600 mt-1">Đã hủy</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-3">{action.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            {[
              { icon: "🛒", text: "Đơn hàng #12345 đã được đặt", time: "5 phút trước", color: "blue" },
              { icon: "✅", text: "Đơn hàng #12344 đã giao thành công", time: "1 giờ trước", color: "green" },
              { icon: "📦", text: "Sản phẩm mới đã được thêm", time: "2 giờ trước", color: "purple" },
              { icon: "💬", text: "Bạn có 3 tin nhắn mới từ khách hàng", time: "3 giờ trước", color: "orange" },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
