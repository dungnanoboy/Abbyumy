import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      businessType,
      shopName,
      description,
      phoneNumber,
      email,
      businessName,
      taxCode,
      businessAddress,
      fullName,
      idNumber,
      householdName,
      householdLicense,
      householdAddress,
    } = body;

    if (!businessType || !shopName || !phoneNumber) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if user exists
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Check if user already has an active shop or pending application
    if (user.shop?.isActive) {
      return NextResponse.json(
        { success: false, message: "Bạn đã có cửa hàng đang hoạt động" },
        { status: 400 }
      );
    }

    // Check for existing pending application
    const existingApplication = await db
      .collection("seller_applications")
      .findOne({ userId: new ObjectId(userId), status: "pending" });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: "Bạn đã có đơn đăng ký đang chờ xét duyệt" },
        { status: 400 }
      );
    }

    // Create seller application
    const application = {
      userId: new ObjectId(userId),
      businessType,
      shopName,
      description,
      phoneNumber,
      email,
      businessInfo:
        businessType === "business"
          ? { businessName, taxCode, businessAddress }
          : businessType === "individual"
          ? { fullName, idNumber }
          : { householdName, householdLicense, householdAddress },
      status: "pending", // pending, approved, rejected
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      reviewNote: null,
    };

    const result = await db.collection("seller_applications").insertOne(application);

    // Update user to add seller role (but shop is not active yet)
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          role: "seller",
          "shop.shopName": shopName,
          "shop.description": description,
          "shop.isActive": false, // Will be set to true after admin approval
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Đăng ký thành công! Đơn của bạn đang chờ xét duyệt.",
      applicationId: result.insertedId,
    });
  } catch (error) {
    console.error("Error in seller registration:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
