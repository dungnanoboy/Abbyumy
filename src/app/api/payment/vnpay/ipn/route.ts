import { NextResponse } from "next/server";
import { getVNPayInstance } from "@/lib/vnpay";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * IPN (Instant Payment Notification) URL
 * VNPAY will call this endpoint to notify payment result
 * This is a server-to-server call
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params: Record<string, string> = {};

    // Extract all query parameters
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const vnpay = getVNPayInstance();

    // Verify the callback data
    const verify = vnpay.verifyIpnCall(params as any);

    if (!verify.isVerified) {
      console.error("IPN verification failed:", verify.message);
      return NextResponse.json({
        RspCode: "97",
        Message: "Invalid signature",
      });
    }

    // Extract payment info
    const orderId = params.vnp_TxnRef;
    const amount = parseInt(params.vnp_Amount) / 100; // VNPAY sends amount * 100
    const responseCode = params.vnp_ResponseCode;
    const transactionNo = params.vnp_TransactionNo;
    const bankCode = params.vnp_BankCode;
    const payDate = params.vnp_PayDate;

    // Update order in database
    const db = await getDatabase();
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });

    if (!order) {
      return NextResponse.json({
        RspCode: "01",
        Message: "Order not found",
      });
    }

    // Check if order was already processed
    if (order.paymentStatus === "paid") {
      console.log("[IPN] Order already paid:", orderId);
      return NextResponse.json({
        RspCode: "02",
        Message: "Order already confirmed",
      });
    }

    // Check amount matches
    console.log("[IPN] Comparing amounts - Order:", order.totalAmount, "VNPAY:", amount);
    if (order.totalAmount !== amount) {
      console.error("[IPN] Amount mismatch!");
      return NextResponse.json({
        RspCode: "04",
        Message: "Invalid amount",
      });
    }

    // Update order based on payment result
    if (responseCode === "00") {
      // Payment successful - but order still needs seller confirmation
      await db.collection("orders").updateOne(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            paymentStatus: "paid",
            paymentDetails: {
              transactionNo,
              bankCode,
              payDate,
              responseCode,
            },
            // Keep status as pending - seller needs to confirm
            updatedAt: new Date(),
          },
        }
      );

      // Log successful payment to audit
      await db.collection("audit_logs").insertOne({
        action: "payment_success",
        userId: order.userId,
        orderId: orderId,
        details: {
          method: "vnpay",
          amount,
          transactionNo,
          bankCode,
        },
        timestamp: new Date(),
      });

      return NextResponse.json({
        RspCode: "00",
        Message: "Success",
      });
    } else {
      // Payment failed
      await db.collection("orders").updateOne(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            paymentStatus: "failed",
            paymentMethod: "vnpay",
            paymentDetails: {
              responseCode,
              failureReason: getPaymentErrorMessage(responseCode),
            },
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        RspCode: "00",
        Message: "Success",
      });
    }
  } catch (error) {
    console.error("Error processing IPN:", error);
    return NextResponse.json({
      RspCode: "99",
      Message: "Unknown error",
    });
  }
}

// Helper function to get user-friendly error messages
function getPaymentErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "07": "Giao dịch bị nghi ngờ gian lận",
    "09": "Thẻ chưa đăng ký dịch vụ Internet Banking",
    "10": "Xác thực thông tin thẻ không đúng quá 3 lần",
    "11": "Hết hạn chờ thanh toán",
    "12": "Thẻ bị khóa",
    "13": "Nhập sai mật khẩu OTP",
    "24": "Khách hàng hủy giao dịch",
    "51": "Tài khoản không đủ số dư",
    "65": "Vượt quá hạn mức giao dịch trong ngày",
    "75": "Ngân hàng đang bảo trì",
    "79": "Nhập sai mật khẩu quá số lần quy định",
  };
  return messages[code] || "Giao dịch thất bại";
}
