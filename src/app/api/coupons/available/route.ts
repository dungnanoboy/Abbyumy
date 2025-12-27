import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { userId, orderValue, items } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Get all active coupons
    const now = new Date();
    const coupons = await db
      .collection("coupons")
      .find({
        startAt: { $lte: now },
        endAt: { $gte: now },
      })
      .toArray();

    // Get user's saved coupons
    const userCoupons = await db
      .collection("user_coupons")
      .find({
        userId: new ObjectId(userId),
        status: "saved",
      })
      .toArray();

    const savedCouponIds = userCoupons.map((uc: any) => uc.couponId.toString());

    // Check eligibility for each coupon
    const couponsWithEligibility = coupons.map((coupon: any) => {
      let eligible = true;
      let reason = "";
      const isSaved = savedCouponIds.includes(coupon._id.toString());

      // Check if coupon is saved by user
      if (!isSaved) {
        eligible = false;
        reason = "Chưa lưu voucher này";
      }

      // Check minimum order value
      if (eligible && coupon.discount.minOrderValue && orderValue < coupon.discount.minOrderValue) {
        eligible = false;
        reason = `Đơn hàng tối thiểu ${coupon.discount.minOrderValue.toLocaleString("vi-VN")}₫`;
      }

      // Check max uses per user
      if (eligible && coupon.conditions?.maxUsesPerUser) {
        const usedCount = userCoupons.filter(
          (uc: any) => uc.couponId.toString() === coupon._id.toString() && uc.status === "used"
        ).length;

        if (usedCount >= coupon.conditions.maxUsesPerUser) {
          eligible = false;
          reason = "Đã hết lượt sử dụng";
        }
      }

      // Check product category conditions
      if (eligible && coupon.conditions?.categories && coupon.conditions.categories.length > 0) {
        const hasEligibleProduct = items.some((item: any) =>
          coupon.conditions.categories.includes(item.category)
        );

        if (!hasEligibleProduct) {
          eligible = false;
          reason = "Sản phẩm không áp dụng";
        }
      }

      // Check user tier conditions
      if (eligible && coupon.conditions?.userTiers && coupon.conditions.userTiers.length > 0) {
        // This would check user tier - for now we'll skip
      }

      return {
        ...coupon,
        _id: coupon._id.toString(),
        eligible,
        reason: eligible ? "" : reason,
        isSaved,
      };
    });

    // Sort: eligible first, then by discount value
    couponsWithEligibility.sort((a: any, b: any) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      if (a.discount.type === "fixed" && b.discount.type === "fixed") {
        return b.discount.value - a.discount.value;
      }
      if (a.discount.type === "percent" && b.discount.type === "percent") {
        return b.discount.value - a.discount.value;
      }
      return 0;
    });

    return NextResponse.json({
      success: true,
      coupons: couponsWithEligibility,
    });
  } catch (error) {
    console.error("Error fetching available coupons:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
