import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Get all seller applications (for admin)
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();

    // Check if user is admin
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";

    const query = status === "all" ? {} : { status };

    const applications = await db
      .collection("seller_applications")
      .find(query)
      .sort({ submittedAt: -1 })
      .toArray();

    // Populate user information
    const applicationsWithUsers = await Promise.all(
      applications.map(async (app) => {
        const applicant = await db.collection("users").findOne({ _id: app.userId });
        return {
          ...app,
          user: applicant
            ? {
                _id: applicant._id,
                name: applicant.name,
                email: applicant.email,
                avatar: applicant.avatar,
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      applications: applicationsWithUsers,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Approve or reject application
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();

    // Check if user is admin
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { applicationId, action, note } = body; // action: 'approve' or 'reject'

    if (!applicationId || !action) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const application = await db
      .collection("seller_applications")
      .findOne({ _id: new ObjectId(applicationId) });

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    if (application.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "Application already reviewed" },
        { status: 400 }
      );
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    // Update application
    await db.collection("seller_applications").updateOne(
      { _id: new ObjectId(applicationId) },
      {
        $set: {
          status: newStatus,
          reviewedAt: new Date(),
          reviewedBy: new ObjectId(userId),
          reviewNote: note || null,
        },
      }
    );

    // If approved, activate the shop
    if (action === "approve") {
      await db.collection("users").updateOne(
        { _id: application.userId },
        {
          $set: {
            "shop.isActive": true,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // If rejected, remove seller role and shop info
      await db.collection("users").updateOne(
        { _id: application.userId },
        {
          $set: {
            role: "user",
            "shop.isActive": false,
            "shop.shopName": null,
            "shop.description": null,
            updatedAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: action === "approve" ? "Đơn đăng ký đã được phê duyệt" : "Đơn đăng ký đã bị từ chối",
    });
  } catch (error) {
    console.error("Error reviewing application:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
