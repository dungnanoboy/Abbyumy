import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// PATCH /api/user-coupons/[id] - Mark coupon as used
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { orderId } = await request.json();

    const db = await getDatabase();

    const userCoupon = await db.collection("user_coupons").findOne({
      _id: new ObjectId(id),
    });

    if (!userCoupon) {
      return NextResponse.json({ error: "Không tìm thấy mã giảm giá" }, { status: 404 });
    }

    if (userCoupon.status !== "saved") {
      return NextResponse.json(
        { error: "Mã giảm giá đã được sử dụng hoặc hết hạn" },
        { status: 400 }
      );
    }

    await db.collection("user_coupons").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "used",
          usedAt: new Date(),
          orderId: orderId ? new ObjectId(orderId) : null,
        },
      }
    );

    return NextResponse.json({ message: "Đã sử dụng mã giảm giá" });
  } catch (error) {
    console.error("Error updating user coupon:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật mã giảm giá" }, { status: 500 });
  }
}
