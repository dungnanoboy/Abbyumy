import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

// POST /api/chat/messages/[conversationId]/read - Đánh dấu đã đọc
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    // Get userId from header
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    const { db } = await connectToDatabase();

    // Cập nhật lastReadAt cho participant
    await db.collection("conversation_participants").updateOne(
      {
        conversationId,
        userId,
      },
      {
        $set: {
          lastReadAt: new Date(),
        },
      }
    );

    // TODO: Emit socket event để notify người gửi

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error marking as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
