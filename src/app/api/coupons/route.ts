import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/coupons - List available coupons
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const sellerId = searchParams.get("sellerId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const db = await getDatabase();

    const filter: any = {
      isActive: true,
      startAt: { $lte: new Date() },
      endAt: { $gte: new Date() },
    };

    if (type) {
      filter.type = type;
    }

    if (sellerId) {
      filter["scope.sellerId"] = new ObjectId(sellerId);
    }

    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      db
        .collection("coupons")
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("coupons").countDocuments(filter),
    ]);

    return NextResponse.json({
      coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: "Lỗi khi tải mã giảm giá" }, { status: 500 });
  }
}

// POST /api/coupons - Create new coupon (admin/seller only)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const {
      type,
      code,
      description,
      discount,
      scope,
      conditions,
      limits,
      eligibleUsers,
      excludedUsers,
      startAt,
      endAt,
      banner,
      tags,
      createdBy,
    } = data;

    // Validate required fields
    if (!code || !description || !discount || !createdBy) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const db = await getDatabase();

    // Check if code already exists
    const existing = await db.collection("coupons").findOne({ code });
    if (existing) {
      return NextResponse.json({ error: "Mã giảm giá đã tồn tại" }, { status: 400 });
    }

    const coupon = {
      type: type || "voucher",
      code: code.toUpperCase(),
      description,
      discount,
      scope: scope || {},
      conditions: conditions || [],
      limits: limits || {},
      eligibleUsers: eligibleUsers || [],
      excludedUsers: excludedUsers || [],
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      isActive: true,
      banner,
      tags: tags || [],
      createdBy: new ObjectId(createdBy),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("coupons").insertOne(coupon);

    return NextResponse.json(
      {
        message: "Tạo mã giảm giá thành công",
        couponId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json({ error: "Lỗi khi tạo mã giảm giá" }, { status: 500 });
  }
}
