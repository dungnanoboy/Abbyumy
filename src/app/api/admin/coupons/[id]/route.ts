import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/admin/coupons/[id] - Get coupon detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const coupon = await db.collection("coupons").findOne({
      _id: new ObjectId(id),
    });

    if (!coupon) {
      return NextResponse.json({ error: "Không tìm thấy mã giảm giá" }, { status: 404 });
    }

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json({ error: "Lỗi khi tải mã giảm giá" }, { status: 500 });
  }
}

// PATCH /api/admin/coupons/[id] - Update coupon
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const db = await getDatabase();

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.code) updateData.code = data.code.toUpperCase();
    if (data.description) updateData.description = data.description;
    if (data.type) updateData.type = data.type;
    if (data.discount) updateData.discount = data.discount;
    if (data.scope) updateData.scope = data.scope;
    if (data.conditions) updateData.conditions = data.conditions;
    if (data.limits) updateData.limits = data.limits;
    if (data.eligibleUsers) updateData.eligibleUsers = data.eligibleUsers;
    if (data.excludedUsers) updateData.excludedUsers = data.excludedUsers;
    if (data.startAt) updateData.startAt = new Date(data.startAt);
    if (data.endAt) updateData.endAt = new Date(data.endAt);
    if (typeof data.isActive === "boolean") updateData.isActive = data.isActive;
    if (data.banner) updateData.banner = data.banner;
    if (data.tags) updateData.tags = data.tags;

    const result = await db.collection("coupons").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Không tìm thấy mã giảm giá" }, { status: 404 });
    }

    return NextResponse.json({ message: "Cập nhật mã giảm giá thành công" });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật mã giảm giá" }, { status: 500 });
  }
}

// DELETE /api/admin/coupons/[id] - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const result = await db.collection("coupons").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Không tìm thấy mã giảm giá" }, { status: 404 });
    }

    return NextResponse.json({ message: "Đã xóa mã giảm giá" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json({ error: "Lỗi khi xóa mã giảm giá" }, { status: 500 });
  }
}
