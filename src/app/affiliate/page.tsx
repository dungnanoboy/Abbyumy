"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  AlertCircle, 
  Users, 
  Package, 
  DollarSign,
  ArrowUpRight,
  X,
  Lightbulb,
  Target
} from "lucide-react";

interface User {
  _id?: string;
  id?: string;
  name: string;
  role?: string;
}

export default function AffiliateDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [showAlert, setShowAlert] = useState(true);
  const [showObjective, setShowObjective] = useState(true);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
  }, []);

  const roles = user?.role?.split(",").map((r) => r.trim()) || [];
  const hasSellerRole = roles.includes("seller");

  // Mock stats - in production, fetch from API
  const stats = [
    {
      label: "Doanh số hôm nay",
      value: "0 ₫",
      change: "+0%",
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Đơn hàng mới",
      value: "0",
      change: "+0%",
      icon: Package,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Nhà sáng tạo đang hợp tác",
      value: "0",
      change: "+0%",
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Hiệu suất tháng này",
      value: "0%",
      change: "+0%",
      icon: TrendingUp,
      color: "bg-teal-50 text-teal-600",
    },
  ];

  const objectives = [
    {
      title: "Mời nhà sáng tạo ban thích quảng bá sản phẩm của bạn",
      description: "Nhà sáng tạo có nhiều khả năng quảng bá sản phẩm có hoa hồng cao hơn. Chọn các loại hàng mẫu khác nhau, số lượng và thời gian yêu cầu của cũng một nỗi.",
      action: "Tìm hiểu thêm",
      link: "/affiliate/find-creators",
      icon: Users,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Công tác mở</h1>
        <p className="text-gray-600 mt-1">
          Quản lý chiến dịch affiliate và theo dõi hiệu suất
        </p>
      </div>

      {/* Alert Banner */}
      {showAlert && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900">
              Cập nhật: Hoàn giảm hoa hồng Quảng cáo của hàng trong 30 ngày.
            </h3>
            <p className="text-sm text-amber-800 mt-1">
              Thay đổi này chỉ ảnh hưởng nhà sáng tạo nào đang quảng bá sản phẩm của bạn. 
              Hoa hồng Quảng cáo của hàng sẽ giảm ngày với ai chưa thêm sản phẩm vào trang 
              trung trước hoặc trong nội dung của mình.{" "}
              <button className="text-amber-600 underline hover:text-amber-700">
                Tìm hiểu thêm
              </button>
            </p>
          </div>
          <button
            onClick={() => setShowAlert(false)}
            className="text-amber-600 hover:text-amber-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                  {stat.change}
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Objectives Section */}
      {showObjective && (
        <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 rounded-xl border border-teal-200 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Thúc đẩy doanh số bằng cách cung cấp hàng mẫu
              </h2>
            </div>
            <button
              onClick={() => setShowObjective(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {objectives.map((objective, index) => {
              const Icon = objective.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {objective.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {objective.description}
                      </p>
                      <a
                        href={objective.link}
                        className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
                      >
                        {objective.action}
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex gap-2">
            <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
              Thiết lập
            </button>
            <button className="px-6 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-300">
              Để sau
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Hành động nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/affiliate/find-creators"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50 transition-all group"
          >
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-600 transition-colors">
              <Users className="w-5 h-5 text-teal-600 group-hover:text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Tìm nhà sáng tạo</p>
              <p className="text-xs text-gray-600">Khám phá người phù hợp</p>
            </div>
          </a>

          {hasSellerRole && (
            <a
              href="/affiliate/products"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <Package className="w-5 h-5 text-blue-600 group-hover:text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Quản lý sản phẩm</p>
                <p className="text-xs text-gray-600">Thiết lập hoa hồng</p>
              </div>
            </a>
          )}

          <a
            href="/affiliate/analytics"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
              <TrendingUp className="w-5 h-5 text-purple-600 group-hover:text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Xem hiệu suất</p>
              <p className="text-xs text-gray-600">Phân tích chi tiết</p>
            </div>
          </a>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Mẹo: Tăng hiệu suất affiliate
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Đặt mức hoa hồng hấp dẫn (8-15%) để thu hút nhà sáng tạo</li>
              <li>• Chọn nhà sáng tạo có lượng người theo dõi phù hợp với sản phẩm</li>
              <li>• Theo dõi hiệu suất thường xuyên và điều chỉnh chiến lược</li>
              <li>• Cung cấp hàng mẫu chất lượng để nhà sáng tạo trải nghiệm</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
