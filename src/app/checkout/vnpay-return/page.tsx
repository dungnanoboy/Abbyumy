"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VNPayReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");
  const [orderInfo, setOrderInfo] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Convert searchParams to object
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Call API to verify return URL (server-side verification)
        const response = await fetch("/api/payment/vnpay/verify-return", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ params }),
        });

        const verify = await response.json();

        if (!verify.isVerified) {
          setStatus("failed");
          setMessage("Xác thực thanh toán thất bại. Chữ ký không hợp lệ.");
          return;
        }

        const responseCode = params.vnp_ResponseCode;
        const orderId = params.vnp_TxnRef;
        const amount = parseInt(params.vnp_Amount) / 100;

        // Set order info
        setOrderInfo({
          orderId,
          amount,
          transactionNo: params.vnp_TransactionNo,
          bankCode: params.vnp_BankCode,
          responseCode,
        });

        if (responseCode === "00") {
          // Payment successful - update order status
          try {
            await fetch("/api/payment/vnpay/manual-update", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId, status: "paid" }),
            });
          } catch (err) {
            console.error("Failed to update order status:", err);
          }
          
          setStatus("success");
          setMessage("Thanh toán thành công!");
        } else {
          setStatus("failed");
          setMessage(getErrorMessage(responseCode));
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("failed");
        setMessage("Có lỗi xảy ra khi xác thực thanh toán");
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleBackToOrders = () => {
    router.push("/profile/orders");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xác thực thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Icon */}
          <div className="text-center mb-6">
            {status === "success" ? (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}

            <h1
              className={`text-2xl font-bold ${
                status === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {status === "success" ? "Thanh toán thành công!" : "Thanh toán thất bại"}
            </h1>
            <p className="text-gray-600 mt-2">{message}</p>
          </div>

          {/* Order Info */}
          {orderInfo && (
            <div className="border-t border-b border-gray-200 py-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium">{orderInfo.orderId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-medium text-orange-600">
                  {orderInfo.amount.toLocaleString("vi-VN")}₫
                </span>
              </div>
              {orderInfo.transactionNo && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mã giao dịch:</span>
                  <span className="font-medium">{orderInfo.transactionNo}</span>
                </div>
              )}
              {orderInfo.bankCode && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-medium">{orderInfo.bankCode}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleBackToOrders}
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Xem đơn hàng của tôi
            </button>
            <button
              onClick={handleBackToHome}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for error messages
function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "07": "Giao dịch bị nghi ngờ gian lận",
    "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking",
    "10": "Xác thực thông tin thẻ không đúng quá 3 lần",
    "11": "Đã hết hạn chờ thanh toán",
    "12": "Thẻ/Tài khoản bị khóa",
    "13": "Nhập sai mật khẩu OTP",
    "24": "Khách hàng hủy giao dịch",
    "51": "Tài khoản không đủ số dư",
    "65": "Vượt quá hạn mức giao dịch trong ngày",
    "75": "Ngân hàng đang bảo trì",
    "79": "Nhập sai mật khẩu thanh toán quá số lần quy định",
    "99": "Giao dịch thất bại",
  };
  return messages[code] || "Giao dịch không thành công";
}
