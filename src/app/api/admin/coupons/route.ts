import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

// GET /api/admin/coupons - List all coupons (admin only)
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();

    const coupons = await db
      .collection("coupons")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: "Lỗi khi tải mã giảm giá" }, { status: 500 });
  }
}
