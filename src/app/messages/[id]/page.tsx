"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import { MessageWithSender } from "@/types/chat";
import { useSocket } from "@/contexts/SocketContext";
import Link from "next/link";
import { authFetch } from "@/lib/authFetch";

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const conversationId = params?.id as string;
  const { socket } = useSocket();

  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState<{ userId: string; userName: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && conversationId) {
      fetchMessages();
      markAsRead();
    }
  }, [user, conversationId]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join conversation room
    socket.emit("conversation:join", conversationId);

    // Listen for new messages
    socket.on("message:new", (message: MessageWithSender) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
        markAsRead();
      }
    });

    // Listen for typing indicators
    socket.on("user:typing", (data: any) => {
      if (data.conversationId === conversationId && data.userId !== user?.id) {
        if (data.isTyping) {
          setTyping({ userId: data.userId, userName: data.userName });
        } else {
          setTyping(null);
        }
      }
    });

    return () => {
      socket.emit("conversation:leave", conversationId);
      socket.off("message:new");
      socket.off("user:typing");
    };
  }, [socket, conversationId, user]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const res = await authFetch(`/api/chat/messages/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const markAsRead = async () => {
    try {
      await authFetch(`/api/chat/messages/${conversationId}/read`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    setSending(true);
    const text = messageText.trim();
    setMessageText("");

    // Stop typing indicator
    if (socket) {
      socket.emit("typing:stop", {
        conversationId,
        userId: user?.id,
      });
    }

    try {
      const res = await authFetch(`/api/chat/messages/${conversationId}`, {
        method: "POST",
        body: JSON.stringify({
          type: "text",
          content: { text },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Socket sẽ emit message mới cho tất cả participants
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessageText(text); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!socket) return;

    // Emit typing start
    socket.emit("typing:start", {
      conversationId,
      userId: user?.id,
      userName: user?.name,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", {
        conversationId,
        userId: user?.id,
      });
    }, 2000);
  };

  const formatTime = (date: Date) => {
    const messageDate = new Date(date);
    const hours = messageDate.getHours().toString().padStart(2, "0");
    const minutes = messageDate.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDate = (date: Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    } else {
      return messageDate.toLocaleDateString("vi-VN");
    }
  };

  const shouldShowDateSeparator = (index: number) => {
    if (index === 0) return true;
    const currentDate = new Date(messages[index].createdAt).toDateString();
    const previousDate = new Date(messages[index - 1].createdAt).toDateString();
    return currentDate !== previousDate;
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/messages"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Người dùng</h2>
              <p className="text-sm text-gray-500">
                {typing ? `${typing.userName} đang nhập...` : "Online"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải tin nhắn...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Chưa có tin nhắn nào
              </h3>
              <p className="text-gray-500">Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <div key={message._id}>
                {/* Date Separator */}
                {shouldShowDateSeparator(index) && (
                  <div className="flex items-center justify-center my-6">
                    <div className="px-4 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                      {formatDate(message.createdAt)}
                    </div>
                  </div>
                )}

                {/* Message */}
                {message.senderType === "system" ? (
                  <div className="flex justify-center">
                    <div className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
                      {message.content.text}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex items-end gap-2 ${
                      message.senderId === user.id || message.senderId === user._id
                        ? "justify-end"
                        : ""
                    }`}
                  >
                    {message.senderId !== user.id && message.senderId !== user._id && (
                      <div className="flex-shrink-0">
                        {message.sender?.avatar ? (
                          <img
                            src={message.sender.avatar}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {message.sender?.name?.charAt(0) || "?"}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`max-w-md ${
                        message.senderId === user.id || message.senderId === user._id
                          ? "order-first"
                          : ""
                      }`}
                    >
                      <div
                        className={`px-4 py-2.5 rounded-2xl ${
                          message.senderId === user.id || message.senderId === user._id
                            ? "bg-orange-500 text-white rounded-br-sm"
                            : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content.text}
                        </p>
                      </div>
                      <div
                        className={`mt-1 text-xs text-gray-500 ${
                          message.senderId === user.id || message.senderId === user._id
                            ? "text-right"
                            : ""
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={sendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1">
            <textarea
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
              placeholder="Nhập tin nhắn..."
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
          </div>

          <button
            type="submit"
            disabled={!messageText.trim() || sending}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
