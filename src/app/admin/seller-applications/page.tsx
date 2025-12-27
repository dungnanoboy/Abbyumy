"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface Application {
  _id: string;
  userId: string;
  businessType: "business" | "individual" | "household";
  shopName: string;
  description: string;
  phoneNumber: string;
  email: string;
  businessInfo: any;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

export default function AdminSellerApplicationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchApplications();
    }
  }, [user, statusFilter]);

  const fetchApplications = async () => {
    setFetchingData(true);
    try {
      const response = await fetch(`/api/admin/seller-applications?status=${statusFilter}`, {
        headers: {
          "x-user-id": user?._id || user?.id || "",
        },
      });

      const data = await response.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setFetchingData(false);
    }
  };

  const handleReview = async (applicationId: string, action: "approve" | "reject") => {
    if (!confirm(`Bạn có chắc muốn ${action === "approve" ? "phê duyệt" : "từ chối"} đơn này?`)) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch("/api/admin/seller-applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?._id || user?.id || "",
        },
        body: JSON.stringify({
          applicationId,
          action,
          note: reviewNote,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setSelectedApp(null);
        setReviewNote("");
        fetchApplications();
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error reviewing application:", error);
      alert("Có lỗi xảy ra khi xét duyệt đơn");
    } finally {
      setProcessing(false);
    }
  };

  if (loading || fetchingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const getBusinessTypeLabel = (type: string) => {
    switch (type) {
      case "business":
        return "Doanh nghiệp";
      case "individual":
        return "Cá nhân";
      case "household":
        return "Hộ kinh doanh";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Chờ duyệt</span>;
      case "approved":
        return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Đã duyệt</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Đã từ chối</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý đơn đăng ký bán hàng</h1>
          <p className="text-gray-600">Xét duyệt các đơn đăng ký trở thành người bán hàng</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            {[
              { value: "pending", label: "Chờ duyệt", count: applications.filter(a => a.status === "pending").length },
              { value: "approved", label: "Đã duyệt", count: applications.filter(a => a.status === "approved").length },
              { value: "rejected", label: "Đã từ chối", count: applications.filter(a => a.status === "rejected").length },
              { value: "all", label: "Tất cả", count: applications.length },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value as any)}
                className={`px-6 py-4 font-medium transition-colors ${
                  statusFilter === tab.value
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {statusFilter === tab.value && (
                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">Không có đơn đăng ký nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người đăng ký
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên cửa hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại hình
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đăng ký
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {app.user?.avatar ? (
                              <img className="h-10 w-10 rounded-full object-cover" src={app.user.avatar} alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-600 font-semibold">
                                  {app.user?.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{app.user?.name}</div>
                            <div className="text-sm text-gray-500">{app.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{app.shopName}</div>
                        <div className="text-sm text-gray-500">{app.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{getBusinessTypeLabel(app.businessType)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.submittedAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(app.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="text-purple-600 hover:text-purple-900 font-medium"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Chi tiết đơn đăng ký</h2>
                <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin người đăng ký</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-gray-900"><span className="font-medium">Tên:</span> {selectedApp.user?.name}</p>
                    <p className="text-gray-900"><span className="font-medium">Email:</span> {selectedApp.user?.email}</p>
                  </div>
                </div>

                {/* Shop Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin cửa hàng</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-gray-900"><span className="font-medium">Tên cửa hàng:</span> {selectedApp.shopName}</p>
                    <p className="text-gray-900"><span className="font-medium">Mô tả:</span> {selectedApp.description || "Không có"}</p>
                    <p className="text-gray-900"><span className="font-medium">Số điện thoại:</span> {selectedApp.phoneNumber}</p>
                    <p className="text-gray-900"><span className="font-medium">Email:</span> {selectedApp.email}</p>
                    <p className="text-gray-900"><span className="font-medium">Loại hình:</span> {getBusinessTypeLabel(selectedApp.businessType)}</p>
                  </div>
                </div>

                {/* Business Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin kinh doanh</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {Object.entries(selectedApp.businessInfo).map(([key, value]) => (
                      <p key={key} className="text-gray-900">
                        <span className="font-medium capitalize">{key}:</span> {value as string}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Trạng thái</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-gray-900"><span className="font-medium">Trạng thái:</span> {getStatusBadge(selectedApp.status)}</p>
                    <p className="text-gray-900"><span className="font-medium">Ngày đăng ký:</span> {new Date(selectedApp.submittedAt).toLocaleString("vi-VN")}</p>
                    {selectedApp.reviewedAt && (
                      <p className="text-gray-900"><span className="font-medium">Ngày xét duyệt:</span> {new Date(selectedApp.reviewedAt).toLocaleString("vi-VN")}</p>
                    )}
                    {selectedApp.reviewNote && (
                      <p className="text-gray-900"><span className="font-medium">Ghi chú:</span> {selectedApp.reviewNote}</p>
                    )}
                  </div>
                </div>

                {/* Review Actions (only for pending) */}
                {selectedApp.status === "pending" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Xét duyệt</h3>
                    <textarea
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Ghi chú (tùy chọn)"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReview(selectedApp._id, "approve")}
                        disabled={processing}
                        className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors font-medium"
                      >
                        {processing ? "Đang xử lý..." : "Phê duyệt"}
                      </button>
                      <button
                        onClick={() => handleReview(selectedApp._id, "reject")}
                        disabled={processing}
                        className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors font-medium"
                      >
                        {processing ? "Đang xử lý..." : "Từ chối"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
