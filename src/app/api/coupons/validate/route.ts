import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { evaluateRules } from "@/lib/couponRules";

// POST /api/coupons/validate - Validate if user can use a coupon
export async function POST(request: NextRequest) {
  try {
    const { userId, couponCode, orderValue, items } = await request.json();

    if (!userId || !couponCode) {
      return NextResponse.json(
        { valid: false, message: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Find coupon by code
    const coupon = await db.collection("coupons").findOne({
      code: couponCode,
      isActive: true,
    });

    if (!coupon) {
      return NextResponse.json(
        { valid: false, message: "Mã giảm giá không tồn tại hoặc đã hết hạn" },
        { status: 404 }
      );
    }

    // Check time validity
    const now = new Date();
    if (now < new Date(coupon.startAt) || now > new Date(coupon.endAt)) {
      return NextResponse.json(
        { valid: false, message: "Mã giảm giá đã hết hạn hoặc chưa đến thời gian sử dụng" },
        { status: 400 }
      );
    }

    // Check minimum order value
    if (coupon.discount.minOrderValue && orderValue < coupon.discount.minOrderValue) {
      return NextResponse.json(
        {
          valid: false,
          message: `Đơn hàng phải có giá trị tối thiểu ${coupon.discount.minOrderValue.toLocaleString(
            "vi-VN"
          )}₫`,
        },
        { status: 400 }
      );
    }

    // Check usage limits
    if (coupon.limits.usageLimit) {
      const usageCount = await db
        .collection("user_coupons")
        .countDocuments({ couponId: coupon._id, status: "used" });

      if (usageCount >= coupon.limits.usageLimit) {
        return NextResponse.json(
          { valid: false, message: "Mã giảm giá đã hết lượt sử dụng" },
          { status: 400 }
        );
      }
    }

    // Check per-user limit
    if (coupon.limits.perUserLimit) {
      const userUsageCount = await db.collection("user_coupons").countDocuments({
        couponId: coupon._id,
        userId: new ObjectId(userId),
        status: "used",
      });

      if (userUsageCount >= coupon.limits.perUserLimit) {
        return NextResponse.json(
          { valid: false, message: "Bạn đã sử dụng hết số lần cho phép với mã này" },
          { status: 400 }
        );
      }
    }

    // Check eligible/excluded users
    if (coupon.eligibleUsers && coupon.eligibleUsers.length > 0) {
      const isEligible = coupon.eligibleUsers.some(
        (id: any) => id.toString() === userId
      );
      if (!isEligible) {
        return NextResponse.json(
          { valid: false, message: "Bạn không đủ điều kiện sử dụng mã này" },
          { status: 403 }
        );
      }
    }

    if (coupon.excludedUsers && coupon.excludedUsers.length > 0) {
      const isExcluded = coupon.excludedUsers.some(
        (id: any) => id.toString() === userId
      );
      if (isExcluded) {
        return NextResponse.json(
          { valid: false, message: "Bạn không được phép sử dụng mã này" },
          { status: 403 }
        );
      }
    }

    // Check scope (products/categories)
    if (coupon.scope.products && coupon.scope.products.length > 0) {
      const hasMatchingProduct = items?.some((item: any) =>
        coupon.scope.products?.some((pid: any) => pid.toString() === item.productId)
      );

      if (!hasMatchingProduct) {
        return NextResponse.json(
          { valid: false, message: "Mã giảm giá không áp dụng cho sản phẩm này" },
          { status: 400 }
        );
      }
    }

    // Evaluate dynamic conditions
    const rulesValid = await evaluateRules({
      userId,
      orderValue,
      coupon: coupon as any,
    });

    if (!rulesValid) {
      return NextResponse.json(
        { valid: false, message: "Bạn chưa đủ điều kiện sử dụng mã giảm giá này" },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount.type === "percent") {
      discountAmount = (orderValue * coupon.discount.value) / 100;
      if (coupon.discount.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.discount.maxDiscount);
      }
    } else if (coupon.discount.type === "fixed") {
      discountAmount = coupon.discount.value;
    } else if (coupon.discount.type === "freeShip") {
      // Return shipping fee as discount (handled in checkout)
      discountAmount = 0; // Will be calculated at checkout
    }

    const finalPrice = Math.max(0, orderValue - discountAmount);

    return NextResponse.json({
      valid: true,
      message: "Mã giảm giá hợp lệ",
      discount: discountAmount,
      finalPrice,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discount: coupon.discount,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { valid: false, message: "Lỗi khi xác thực mã giảm giá" },
      { status: 500 }
    );
  }
}
