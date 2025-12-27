import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();

    // Get total comments count
    const totalComments = await db.collection("comments").countDocuments({
      status: "active",
    });

    // Get total active users (users who have created recipes or comments)
    const activeUsersWithRecipes = await db
      .collection("recipes")
      .distinct("authorId");
    const activeUsersWithComments = await db
      .collection("comments")
      .distinct("userId");

    const activeUsersSet = new Set([
      ...activeUsersWithRecipes.map((id: any) => id.toString()),
      ...activeUsersWithComments.map((id: any) => id.toString()),
    ]);

    return NextResponse.json({
      totalComments,
      activeUsers: activeUsersSet.size,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
