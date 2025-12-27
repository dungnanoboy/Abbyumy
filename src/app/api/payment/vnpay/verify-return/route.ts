import { NextResponse } from "next/server";
import { getVNPayInstance } from "@/lib/vnpay";

/**
 * Verify VNPAY return URL
 * Called by client to verify payment callback
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { params } = body;

    if (!params) {
      return NextResponse.json(
        { error: "Missing params" },
        { status: 400 }
      );
    }

    const vnpay = getVNPayInstance();
    const verify = vnpay.verifyReturnUrl(params as any);

    return NextResponse.json({
      isVerified: verify.isVerified,
      isSuccess: verify.isSuccess,
      message: verify.message,
    });
  } catch (error) {
    console.error("Error verifying return URL:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
