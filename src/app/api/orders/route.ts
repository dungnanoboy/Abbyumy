import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// POST - Create new order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items, shippingAddress, note, paymentMethod, totalAmount } = body;

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "User ID không hợp lệ" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Giỏ hàng trống" },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin địa chỉ nhận hàng" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Create order
    const order = {
      userId: new ObjectId(userId),
      orderNumber: `ORD${Date.now()}`,
      items: items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      shippingAddress: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
      },
      note: note || "",
      paymentMethod: paymentMethod || "COD",
      totalAmount,
      status: "pending", // pending, confirmed, shipping, delivered, cancelled
      paymentStatus: "unpaid", // unpaid, paid
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(order);

    return NextResponse.json({
      success: true,
      message: "Đặt hàng thành công",
      orderId: result.insertedId.toString(),
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tạo đơn hàng" },
      { status: 500 }
    );
  }
}

// GET - Get orders (user's orders or all orders for admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const db = await getDatabase();

    let query: any = {};
    if (userId && ObjectId.isValid(userId)) {
      query.userId = new ObjectId(userId);
    }

    const [orders, total] = await Promise.all([
      db
        .collection("orders")
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("orders").countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tải danh sách đơn hàng" },
      { status: 500 }
    );
  }
}
