import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { emitNewMessage } from "@/lib/socket";

// GET /api/chat/messages/[conversationId] - Lấy messages của một conversation
export async function GET(
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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before"); // Message ID để load tin nhắn cũ hơn (pagination)

    const { db } = await connectToDatabase();

    // Kiểm tra user có quyền xem conversation không
    const participant = await db
      .collection("conversation_participants")
      .findOne({
        conversationId,
        userId,
      });

    if (!participant) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Build query
    const query: any = { conversationId };
    
    if (before) {
      const beforeMessage = await db
        .collection("messages")
        .findOne({ _id: new ObjectId(before) });
      
      if (beforeMessage) {
        query.createdAt = { $lt: beforeMessage.createdAt };
      }
    }

    // Lấy messages
    const messages = await db
      .collection("messages")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Lấy thông tin sender cho mỗi message
    const messagesWithSender = await Promise.all(
      messages.map(async (msg: any) => {
        let sender = null;
        
        if (msg.senderId) {
          const user = await db
            .collection("users")
            .findOne({ _id: new ObjectId(msg.senderId) });
          
          if (user) {
            sender = {
              _id: user._id.toString(),
              name: user.name,
              avatar: user.avatar,
            };
          }
        }

        return {
          ...msg,
          _id: msg._id.toString(),
          sender,
        };
      })
    );

    // Reverse để có thứ tự từ cũ đến mới
    messagesWithSender.reverse();

    return NextResponse.json({ messages: messagesWithSender });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/chat/messages/[conversationId] - Gửi message mới
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
    const body = await request.json();
    const { type, content, replyTo, mentions } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Kiểm tra user có quyền gửi message không
    const participant = await db
      .collection("conversation_participants")
      .findOne({
        conversationId,
        userId,
      });

    if (!participant || participant.blocked) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Tạo message mới
    const newMessage = {
      conversationId,
      senderId: userId,
      senderType: "user",
      type,
      content,
      replyTo: replyTo || null,
      mentions: mentions || [],
      status: "sent",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("messages").insertOne(newMessage);

    // Cập nhật lastMessage trong conversation
    await db.collection("conversations").updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $set: {
          lastMessage: {
            messageId: result.insertedId.toString(),
            text: content.text || "[Media]",
            senderId: userId,
            createdAt: new Date(),
          },
          updatedAt: new Date(),
        },
      }
    );

    // Lấy thông tin sender
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    const messageWithSender = {
      ...newMessage,
      _id: result.insertedId.toString(),
      sender: user
        ? {
            _id: user._id.toString(),
            name: user.name,
            avatar: user.avatar,
          }
        : null,
    };

    console.log("[API] About to emit message via socket");
    console.log("[API] ConversationId:", conversationId);
    console.log("[API] Message:", messageWithSender);
    
    // Emit socket event để gửi realtime
    emitNewMessage(conversationId, messageWithSender);

    return NextResponse.json({ message: messageWithSender });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
