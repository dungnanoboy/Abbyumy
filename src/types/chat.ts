import { ObjectId } from "mongodb";

// Conversation Types
export type ConversationType = "direct" | "group" | "support" | "shop" | "ai";

export interface ConversationContext {
  orderId?: string;
  productId?: string;
  shopId?: string;
  livestreamId?: string;
}

export interface ConversationSettings {
  allowAI?: boolean;
  archived?: boolean;
}

export interface LastMessage {
  messageId: string;
  text: string;
  senderId: string;
  createdAt: Date;
}

export interface Conversation {
  _id: string;
  type: ConversationType;
  context?: ConversationContext;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: LastMessage;
  settings?: ConversationSettings;
}

// Participant Types
export type ParticipantRole = "member" | "admin" | "support" | "bot";

export interface ConversationParticipant {
  _id: string;
  conversationId: string;
  userId: string;
  role: ParticipantRole;
  joinedAt: Date;
  lastReadAt?: Date;
  muted: boolean;
  blocked: boolean;
}

// Message Types
export type MessageType = "text" | "image" | "video" | "product" | "order" | "coupon" | "system";
export type SenderType = "user" | "system" | "bot" | "ai";
export type MessageStatus = "sent" | "delivered" | "read" | "recalled";

export interface MessageContent {
  text?: string;
  mediaUrl?: string;
  productId?: string;
  orderId?: string;
  couponId?: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId?: string;
  senderType: SenderType;
  type: MessageType;
  content: MessageContent;
  replyTo?: string;
  mentions?: string[];
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Message Report Types
export type ReportReason = "spam" | "harassment" | "inappropriate" | "scam" | "other";
export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export interface MessageReport {
  _id: string;
  messageId: string;
  conversationId: string;
  reportedBy: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

// API Response Types
export interface ConversationWithParticipants extends Conversation {
  participants: Array<{
    userId: string;
    name: string;
    avatar?: string;
    role: ParticipantRole;
    isOnline?: boolean;
  }>;
  unreadCount?: number;
}

export interface MessageWithSender extends Message {
  sender?: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

// Socket Event Types
export interface SocketMessage {
  event: "message:new" | "message:read" | "user:typing" | "user:online" | "user:offline";
  data: any;
}

// Typing Indicator
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

// Online Status
export interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
}
