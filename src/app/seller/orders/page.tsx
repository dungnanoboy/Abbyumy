"use client";

import { useState } from "react";
import Link from "next/link";

type OrderStatus = "all" | "pending" | "processing" | "shipped" | "completed" | "cancelled";

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    avatar?: string;
  };
  products: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: Exclude<OrderStatus, "all">;
  createdAt: string;
}

export default function SellerOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const orders: Order[] = [
    {
      id: "1",
      orderNumber: "ORD-2025-001",
      customer: { name: "Nguyễn Văn A" },
      products: [{ name: "Nước chấm Thanh Hóa", quantity: 2, price: 30000 }],
      total: 60000,
      status: "pending",
      createdAt: "2025-12-30T10:30:00",
    },
    {
      id: "2",
      orderNumber: "ORD-2025-002",
      customer: { name: "Trần Thị B" },
      products: [{ name: "Gia vị cà ri", quantity: 1, price: 45000 }],
      total: 45000,
      status: "processing",
      createdAt: "2025-12-29T15:20:00",
    },
  ];

  const statusTabs = [
    { key: "all" as OrderStatus, label: "Tất cả", count: orders.length },
    { key: "pending" as OrderStatus, label: "Chờ xử lý", count: orders.filter((o) => o.status === "pending").length },
    {
      key: "processing" as OrderStatus,
      label: "Đang xử lý",
      count: orders.filter((o) => o.status === "processing").length,
    },
    { key: "shipped" as OrderStatus, label: "Đang giao", count: orders.filter((o) => o.status === "shipped").length },
    {
      key: "completed" as OrderStatus,
      label: "Hoàn thành",
      count: orders.filter((o) => o.status === "completed").length,
    },
    {
      key: "cancelled" as OrderStatus,
      label: "Đã hủy",
      count: orders.filter((o) => o.status === "cancelled").length,
    },
  ];

  const getStatusBadge = (status: Exclude<OrderStatus, "all">) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    const labels = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      shipped: "Đang giao",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{labels[status]}</span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== "all" && order.status !== selectedStatus) return false;
    if (searchQuery && !order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-sm text-gray-600 mt-1">Theo dõi và xử lý đơn hàng của bạn</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Xuất báo cáo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedStatus(tab.key)}
            className={`bg-white rounded-lg border p-4 text-center transition-all ${
              selectedStatus === tab.key ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-2xl font-bold text-gray-900">{tab.count}</div>
            <div className="text-sm text-gray-600 mt-1">{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-600">Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {order.customer.avatar ? (
                          <img src={order.customer.avatar} alt="" className="w-8 h-8 rounded-full mr-2" />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs text-gray-600">{order.customer.name.charAt(0)}</span>
                          </div>
                        )}
                        <span className="text-sm text-gray-900">{order.customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.products.map((p, i) => (
                          <div key={i}>
                            {p.name} x{p.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(order.total)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/seller/orders/${order.id}`} className="text-blue-600 hover:text-blue-700">
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
