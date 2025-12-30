import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();

    // Find the most recent application for this user
    const application = await db
      .collection("seller_applications")
      .findOne({ userId: new ObjectId(userId) }, { sort: { submittedAt: -1 } });

    if (!application) {
      return NextResponse.json({
        success: false,
        message: "No application found",
      });
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error fetching application status:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
