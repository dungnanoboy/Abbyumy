import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/chat/conversations - Lấy danh sách conversation của user
export async function GET(request: NextRequest) {
  try {
    // Get userId from header (sent from client)
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Tìm tất cả conversation mà user tham gia
    const participants = await db
      .collection("conversation_participants")
      .find({ userId: userId })
      .toArray();

    if (participants.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    const conversationIds = participants.map((p: any) => new ObjectId(p.conversationId));

    // Lấy thông tin conversations
    const conversations = await db
      .collection("conversations")
      .find({ _id: { $in: conversationIds } })
      .sort({ updatedAt: -1 })
      .toArray();

    // Lấy thông tin participants cho mỗi conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv: any) => {
        // Lấy participants
        const convParticipants = await db
          .collection("conversation_participants")
          .find({ conversationId: conv._id.toString() })
          .toArray();

        // Lấy thông tin user cho mỗi participant
        const participantDetails = await Promise.all(
          convParticipants.map(async (p: any) => {
            const user = await db
              .collection("users")
              .findOne({ _id: new ObjectId(p.userId) });

            return {
              userId: p.userId,
              name: user?.name || "Unknown",
              avatar: user?.avatar,
              role: p.role,
              isOnline: false, // TODO: Implement real online status
            };
          })
        );

        // Tính unread count
        const userParticipant = convParticipants.find(
          (p: any) => p.userId === userId
        );
        
        let unreadCount = 0;
        if (userParticipant?.lastReadAt) {
          unreadCount = await db
            .collection("messages")
            .countDocuments({
              conversationId: conv._id.toString(),
              createdAt: { $gt: new Date(userParticipant.lastReadAt) },
              senderId: { $ne: userId },
            });
        } else {
          unreadCount = await db
            .collection("messages")
            .countDocuments({
              conversationId: conv._id.toString(),
              senderId: { $ne: userId },
            });
        }

        return {
          ...conv,
          _id: conv._id.toString(),
          participants: participantDetails,
          unreadCount,
        };
      })
    );

    return NextResponse.json({ conversations: conversationsWithDetails });
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/chat/conversations - Tạo conversation mới hoặc lấy conversation đã tồn tại
export async function POST(request: NextRequest) {
  try {
    // Get userId from header
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, participantIds, context } = body;

    if (!type || !participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Thêm userId vào danh sách participants nếu chưa có
    const allParticipantIds = [...new Set([userId, ...participantIds])];

    // Kiểm tra xem đã có conversation giữa những người này chưa (chỉ áp dụng cho direct chat)
    if (type === "direct" && allParticipantIds.length === 2) {
      const existingParticipants = await db
        .collection("conversation_participants")
        .find({ userId: { $in: allParticipantIds } })
        .toArray();

      // Group by conversationId
      const conversationGroups = existingParticipants.reduce((acc: any, p: any) => {
        if (!acc[p.conversationId]) acc[p.conversationId] = [];
        acc[p.conversationId].push(p.userId);
        return acc;
      }, {});

      // Tìm conversation có đúng 2 participants này
      for (const [convId, participants] of Object.entries(conversationGroups)) {
        if (
          (participants as string[]).length === 2 &&
          allParticipantIds.every((id) => (participants as string[]).includes(id))
        ) {
          // Đã tồn tại conversation
          const existingConv = await db
            .collection("conversations")
            .findOne({ _id: new ObjectId(convId) });

          if (existingConv && existingConv.type === "direct") {
            return NextResponse.json({
              conversation: {
                ...existingConv,
                _id: existingConv._id.toString(),
              },
              isNew: false,
            });
          }
        }
      }
    }

    // Tạo conversation mới
    const newConversation = {
      type,
      context: context || {},
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        allowAI: type === "ai",
        archived: false,
      },
    };

    const convResult = await db
      .collection("conversations")
      .insertOne(newConversation);

    const conversationId = convResult.insertedId.toString();

    // Thêm participants
    const participants = allParticipantIds.map((pId) => ({
      conversationId,
      userId: pId,
      role: pId === userId ? "admin" : "member",
      joinedAt: new Date(),
      muted: false,
      blocked: false,
    }));

    await db.collection("conversation_participants").insertMany(participants);

    // Tạo system message
    const systemMessage = {
      conversationId,
      senderId: null,
      senderType: "system",
      type: "system",
      content: {
        text: `Cuộc trò chuyện đã được tạo`,
      },
      status: "sent",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("messages").insertOne(systemMessage);

    return NextResponse.json({
      conversation: {
        ...newConversation,
        _id: conversationId,
      },
      isNew: true,
    });
  } catch (error: any) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
