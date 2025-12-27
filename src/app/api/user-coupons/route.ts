import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/user-coupons - Get user's saved coupons
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    if (!userId) {
      return NextResponse.json({ error: "Thiếu userId" }, { status: 400 });
    }

    const db = await getDatabase();

    const filter: any = { userId: new ObjectId(userId) };
    if (status) {
      filter.status = status;
    }

    // Get user coupons and populate coupon details
    const userCoupons = await db
      .collection("user_coupons")
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "coupons",
            localField: "couponId",
            foreignField: "_id",
            as: "coupon",
          },
        },
        { $unwind: "$coupon" },
        { $sort: { savedAt: -1 } },
      ])
      .toArray();

    // Update expired coupons
    const now = new Date();
    for (const userCoupon of userCoupons) {
      if (
        userCoupon.status === "saved" &&
        (new Date(userCoupon.expiresAt) < now || new Date(userCoupon.coupon.endAt) < now)
      ) {
        await db.collection("user_coupons").updateOne(
          { _id: userCoupon._id },
          { $set: { status: "expired" } }
        );
        userCoupon.status = "expired";
      }
    }

    return NextResponse.json({ userCoupons });
  } catch (error) {
    console.error("Error fetching user coupons:", error);
    return NextResponse.json({ error: "Lỗi khi tải voucher" }, { status: 500 });
  }
}

// POST /api/user-coupons - Save a coupon for later use
export async function POST(request: NextRequest) {
  try {
    const { userId, couponId } = await request.json();

    if (!userId || !couponId) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const db = await getDatabase();

    // Check if coupon exists and is active
    const coupon = await db.collection("coupons").findOne({
      _id: new ObjectId(couponId),
      isActive: true,
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Mã giảm giá không tồn tại hoặc đã hết hạn" },
        { status: 404 }
      );
    }

    // Check if already saved
    const existing = await db.collection("user_coupons").findOne({
      userId: new ObjectId(userId),
      couponId: new ObjectId(couponId),
      status: { $in: ["saved", "used"] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bạn đã lưu mã giảm giá này rồi" },
        { status: 400 }
      );
    }

    // Save coupon
    const userCoupon = {
      userId: new ObjectId(userId),
      couponId: new ObjectId(couponId),
      savedAt: new Date(),
      usedAt: null,
      expiresAt: new Date(coupon.endAt),
      status: "saved",
    };

    const result = await db.collection("user_coupons").insertOne(userCoupon);

    return NextResponse.json(
      {
        message: "Đã lưu mã giảm giá",
        userCouponId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving user coupon:", error);
    return NextResponse.json({ error: "Lỗi khi lưu mã giảm giá" }, { status: 500 });
  }
}

// DELETE /api/user-coupons - Remove saved coupon
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userCouponId = searchParams.get("id");

    if (!userCouponId) {
      return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
    }

    const db = await getDatabase();

    const result = await db.collection("user_coupons").deleteOne({
      _id: new ObjectId(userCouponId),
      status: "saved", // Only allow deleting unused coupons
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Không thể xóa mã giảm giá này" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Đã xóa mã giảm giá" });
  } catch (error) {
    console.error("Error deleting user coupon:", error);
    return NextResponse.json({ error: "Lỗi khi xóa mã giảm giá" }, { status: 500 });
  }
}
