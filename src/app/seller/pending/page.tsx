"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Application {
  _id: string;
  businessType: string;
  shopName: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export default function SellerPendingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    // If user has active shop, redirect to seller dashboard
    if (user?.shop?.isActive) {
      router.push("/seller");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchApplication();
    }
  }, [user]);

  const fetchApplication = async () => {
    try {
      const response = await fetch("/api/seller/application-status", {
        headers: {
          "x-user-id": user?._id || user?.id || "",
        },
      });

      const data = await response.json();
      if (data.success && data.application) {
        setApplication(data.application);
      }
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setFetchingData(false);
    }
  };

  if (loading || fetchingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: "⏳",
          title: "Đơn đăng ký đang được xét duyệt",
          description: "Đơn đăng ký của bạn đang được xem xét bởi đội ngũ quản trị viên",
          color: "yellow",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800",
        };
      case "rejected":
        return {
          icon: "❌",
          title: "Đơn đăng ký đã bị từ chối",
          description: "Rất tiếc, đơn đăng ký của bạn đã bị từ chối",
          color: "red",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
        };
      default:
        return {
          icon: "📝",
          title: "Đơn đăng ký của bạn",
          description: "",
          color: "gray",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800",
        };
    }
  };

  const statusInfo = application ? getStatusInfo(application.status) : getStatusInfo("pending");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛍️</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Abbyumy Shop Seller</h1>
              <p className="text-sm text-gray-600">Trung tâm người bán</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className={`${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-lg p-8`}>
          <div className="text-center">
            <div className="text-6xl mb-4">{statusInfo.icon}</div>
            <h2 className={`text-2xl font-bold ${statusInfo.textColor} mb-2`}>
              {statusInfo.title}
            </h2>
            <p className="text-gray-600 mb-8">{statusInfo.description}</p>

            {application && (
              <div className="bg-white rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Thông tin đơn đăng ký</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên cửa hàng:</span>
                    <span className="font-medium text-gray-900">{application.shopName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loại hình:</span>
                    <span className="font-medium text-gray-900">
                      {application.businessType === "business"
                        ? "Doanh nghiệp"
                        : application.businessType === "individual"
                        ? "Cá nhân"
                        : "Hộ kinh doanh"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày đăng ký:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(application.submittedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        application.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : application.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {application.status === "pending"
                        ? "Chờ duyệt"
                        : application.status === "approved"
                        ? "Đã duyệt"
                        : "Đã từ chối"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {application?.status === "pending" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-left">
                    <p className="font-medium text-blue-900 mb-1">
                      Thời gian xét duyệt trung bình: 1-3 ngày làm việc
                    </p>
                    <p className="text-blue-700">
                      Chúng tôi sẽ gửi thông báo qua email khi đơn của bạn được xét duyệt. Vui lòng kiểm tra
                      email thường xuyên.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {application?.status === "rejected" && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 text-left">
                  <p className="text-sm text-gray-600">
                    Nếu bạn muốn biết lý do từ chối hoặc đăng ký lại, vui lòng liên hệ bộ phận hỗ trợ.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/seller/register")}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Đăng ký lại
                </button>
              </div>
            )}

            {!application && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Không tìm thấy đơn đăng ký. Vui lòng đăng ký để trở thành người bán hàng.
                </p>
                <button
                  onClick={() => router.push("/seller/register")}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Đăng ký ngay
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">Cần hỗ trợ?</p>
          <a href="#" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
            Liên hệ bộ phận hỗ trợ
          </a>
        </div>
      </div>
    </div>
  );
}
