"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccessDenied() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Truy cập bị từ chối
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Bạn không có quyền truy cập vào trang quản trị. 
          Chỉ người dùng có quyền quản trị viên mới có thể truy cập khu vực này.
        </p>

        {/* Countdown */}
        <div className="bg-orange-50 text-orange-600 px-4 py-3 rounded-lg mb-6">
          <p className="text-sm">
            🔄 Đang chuyển về trang chủ...
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => router.push("/")}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Về trang chủ ngay
          </button>
          <button
            onClick={() => router.back()}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Quay lại trang trước
          </button>
        </div>
      </div>
    </div>
  );
}
