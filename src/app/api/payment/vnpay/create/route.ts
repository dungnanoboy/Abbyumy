import { NextResponse } from "next/server";
import { getVNPayInstance, ProductCode } from "@/lib/vnpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, orderInfo, orderId, bankCode } = body;

    // Validate required fields
    if (!amount || !orderInfo || !orderId) {
      return NextResponse.json(
        { error: "Missing required fields: amount, orderInfo, orderId" },
        { status: 400 }
      );
    }

    const vnpay = getVNPayInstance();

    // Get client IP (in production, use proper IP detection)
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";

    // Build payment URL
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: ip,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL!,
      vnp_Locale: "vn",
      // Optional: specify bank code if user selected specific bank
      ...(bankCode && { vnp_BankCode: bankCode }),
    });

    return NextResponse.json({
      success: true,
      paymentUrl,
    });
  } catch (error) {
    console.error("Error creating VNPAY payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment URL" },
      { status: 500 }
    );
  }
}
