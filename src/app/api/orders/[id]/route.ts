import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Get order details
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Order ID không hợp lệ" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    // Get user info
    const user = await db.collection("users").findOne(
      { _id: order.userId },
      { projection: { name: 1, email: 1, avatar: 1 } }
    );

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        user,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tải thông tin đơn hàng" },
      { status: 500 }
    );
  }
}

// PATCH - Update order status
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Order ID không hợp lệ" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) {
      updateData.status = status;
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật đơn hàng thành công",
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi cập nhật đơn hàng" },
      { status: 500 }
    );
  }
}
