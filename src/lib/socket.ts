import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiRequest } from "next";

export type NextApiResponseWithSocket = {
  socket: {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
};

let io: SocketIOServer | null = null;

export function initSocket(server: HTTPServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    path: "/api/socket",
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join user's personal room
    socket.on("user:join", (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined personal room`);
    });

    // Join conversation room
    socket.on("conversation:join", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`[Socket] Socket ${socket.id} joined conversation: ${conversationId}`);
      
      // Confirm join to client
      socket.emit("conversation:joined", { conversationId });
    });

    // Leave conversation room
    socket.on("conversation:leave", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`Socket ${socket.id} left conversation: ${conversationId}`);
    });

    // Typing indicator
    socket.on("typing:start", (data: { conversationId: string; userId: string; userName: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit("user:typing", {
        conversationId: data.conversationId,
        userId: data.userId,
        userName: data.userName,
        isTyping: true,
      });
    });

    socket.on("typing:stop", (data: { conversationId: string; userId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit("user:typing", {
        conversationId: data.conversationId,
        userId: data.userId,
        isTyping: false,
      });
    });

    // Online status
    socket.on("user:online", (userId: string) => {
      io?.emit("user:status", {
        userId,
        isOnline: true,
        lastSeen: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

// Helper function để emit message mới
export function emitNewMessage(conversationId: string, message: any) {
  console.log("[Socket] Emitting message:new to conversation:", conversationId);
  console.log("[Socket] Message data:", message);
  console.log("[Socket] IO available:", !!io);
  
  if (io) {
    io.to(`conversation:${conversationId}`).emit("message:new", message);
    console.log("[Socket] Message emitted successfully");
  } else {
    console.error("[Socket] IO not initialized!");
  }
}

// Helper function để emit message đã đọc
export function emitMessageRead(conversationId: string, userId: string) {
  if (io) {
    io.to(`conversation:${conversationId}`).emit("message:read", {
      conversationId,
      userId,
      readAt: new Date(),
    });
  }
}
