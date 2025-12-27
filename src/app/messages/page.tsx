"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ConversationWithParticipants, MessageWithSender } from "@/types/chat";
import { useSocket } from "@/contexts/SocketContext";
import { authFetch } from "@/lib/authFetch";

export default function MessengerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  
  // Conversations state
  const [conversations, setConversations] = useState<ConversationWithParticipants[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithParticipants | null>(null);
  
  // Following users state
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"conversations" | "following">("conversations");
  
  // Messages state
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
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
    if (user) {
      fetchConversations();
      fetchFollowingUsers();
    }
  }, [user]);

  // Socket listeners
  useEffect(() => {
    if (!socket) {
      console.log("Socket not available");
      return;
    }

    console.log("Setting up socket listeners");

    const handleNewMessage = (message: MessageWithSender) => {
      console.log("Received new message:", message);
      
      // If message is for current conversation, add it to messages
      if (selectedConversation && message.conversationId === selectedConversation._id) {
        setMessages((prev) => [...prev, message]);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        
        // Mark as read
        authFetch(`/api/chat/messages/${selectedConversation._id}/read`, {
          method: "POST",
        }).catch(err => console.error("Error marking as read:", err));
      }
      
      // Always update conversations list to show new last message
      authFetch("/api/chat/conversations")
        .then(res => res.json())
        .then(data => {
          if (data.conversations) {
            setConversations(data.conversations);
          }
        })
        .catch(err => console.error("Error fetching conversations:", err));
    };

    const handleTyping = (data: any) => {
      if (user && selectedConversation && data.conversationId === selectedConversation._id && data.userId !== user.id && data.userId !== user._id) {
        if (data.isTyping) {
          setTyping({ userId: data.userId, userName: data.userName });
        } else {
          setTyping(null);
        }
      }
    };

    const handleConversationJoined = (data: any) => {
      console.log("Conversation joined confirmed:", data);
    };

    socket.on("message:new", handleNewMessage);
    socket.on("user:typing", handleTyping);
    socket.on("conversation:joined", handleConversationJoined);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("user:typing", handleTyping);
      socket.off("conversation:joined", handleConversationJoined);
    };
  }, [socket, selectedConversation, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const res = await authFetch("/api/chat/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchFollowingUsers = async () => {
    setLoadingFollowing(true);
    try {
      const res = await authFetch("/api/chat/following");
      if (res.ok) {
        const data = await res.json();
        setFollowingUsers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching following users:", error);
    } finally {
      setLoadingFollowing(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setLoadingMessages(true);
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

  const markAsRead = async (conversationId: string) => {
    try {
      await authFetch(`/api/chat/messages/${conversationId}/read`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleSelectConversation = (conv: ConversationWithParticipants) => {
    setSelectedConversation(conv);
    setMessages([]);
    fetchMessages(conv._id);
    markAsRead(conv._id);
    
    if (socket) {
      console.log("Joining conversation:", conv._id);
      socket.emit("conversation:join", conv._id);
    } else {
      console.log("Socket not available when joining conversation");
    }
  };

  const startChatWithUser = async (targetUser: any) => {
    try {
      // Check if conversation already exists
      const existingConv = conversations.find(conv => {
        if (conv.type !== "direct") return false;
        return conv.participants.some(p => p.userId === targetUser._id);
      });

      if (existingConv) {
        handleSelectConversation(existingConv);
        setActiveTab("conversations");
        return;
      }

      // Create new conversation
      const res = await authFetch("/api/chat/conversations", {
        method: "POST",
        body: JSON.stringify({
          type: "direct",
          participantIds: [targetUser._id],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Fetch updated conversations list
        const convRes = await authFetch("/api/chat/conversations");
        if (convRes.ok) {
          const convData = await convRes.json();
          setConversations(convData.conversations || []);
          
          // Find the new conversation and select it
          const newConv = (convData.conversations || []).find((c: ConversationWithParticipants) => c._id === data.conversation._id);
          if (newConv) {
            handleSelectConversation(newConv);
          }
        }
        setActiveTab("conversations");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sending || !selectedConversation || !user) return;

    setSending(true);
    const text = messageText.trim();
    setMessageText("");

    if (socket) {
      socket.emit("typing:stop", {
        conversationId: selectedConversation._id,
        userId: user.id || user._id,
      });
    }

    try {
      const res = await authFetch(`/api/chat/messages/${selectedConversation._id}`, {
        method: "POST",
        body: JSON.stringify({
          type: "text",
          content: { text },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error sending message:", errorData);
        alert(`Không thể gửi tin nhắn: ${errorData.error || errorData.message || 'Lỗi không xác định'}`);
        setMessageText(text);
      } else {
        // Successfully sent, fetch messages to update UI
        fetchMessages(selectedConversation._id);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
      setMessageText(text);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!socket || !selectedConversation || !user) return;

    socket.emit("typing:start", {
      conversationId: selectedConversation._id,
      userId: user.id || user._id,
      userName: user.name,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", {
        conversationId: selectedConversation._id,
        userId: user.id || user._id,
      });
    }, 2000);
  };

  const getConversationTitle = (conv: ConversationWithParticipants) => {
    if (conv.type === "support") return "Hỗ trợ khách hàng";
    if (conv.type === "ai") return "AI Chat Bot";
    if (conv.type === "shop") return "Chat với Shop";

    const otherParticipant = conv.participants.find(
      (p) => p.userId !== user?.id && p.userId !== user?._id
    );
    return otherParticipant?.name || "Người dùng";
  };

  const getConversationAvatar = (conv: ConversationWithParticipants) => {
    if (conv.type === "support") return "👨‍💼";
    if (conv.type === "ai") return "🤖";
    if (conv.type === "shop") return "🏪";

    const otherParticipant = conv.participants.find(
      (p) => p.userId !== user?.id && p.userId !== user?._id
    );
    return otherParticipant?.avatar;
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

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now.getTime() - messageDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}ng`;
    if (hours > 0) return `${hours}g`;
    if (minutes > 0) return `${minutes}ph`;
    return "Vừa xong";
  };

  const filteredConversations = conversations.filter((conv) => {
    const title = getConversationTitle(conv).toLowerCase();
    const lastMessage = conv.lastMessage?.text?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return title.includes(query) || lastMessage.includes(query);
  });

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-[360px] border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Tin nhắn</h1>
            <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
              {isConnected ? '● Online' : '○ Offline'}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("conversations")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "conversations"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Trò chuyện
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "following"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Đang theo dõi
            </button>
          </div>

          <div className="relative">
            <input
              type="search"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "conversations" ? (
            // Conversations list
            loadingConversations ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-600">Chưa có cuộc trò chuyện</p>
                <p className="text-xs text-gray-400 mt-2">Nhấn vào tab "Đang theo dõi" để bắt đầu trò chuyện</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-3 hover:bg-gray-50 flex items-center gap-3 ${selectedConversation?._id === conv._id ? 'bg-gray-100' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    {getConversationAvatar(conv) && getConversationAvatar(conv)!.startsWith("http") ? (
                      <img src={getConversationAvatar(conv)!} alt="" className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-xl font-bold text-orange-600">
                        {getConversationTitle(conv).charAt(0).toUpperCase()}
                      </div>
                    )}
                    {conv.unreadCount! > 0 && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {conv.unreadCount! > 9 ? "9+" : conv.unreadCount}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm truncate text-gray-900 ${conv.unreadCount! > 0 ? 'font-semibold' : 'font-medium'}`}>
                        {getConversationTitle(conv)}
                      </h3>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-500 ml-2">
                          {formatLastMessageTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${conv.unreadCount! > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {conv.lastMessage?.text || "Chưa có tin nhắn"}
                    </p>
                  </div>
                </button>
              ))
            )
          ) : (
            // Following users list
            loadingFollowing ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              </div>
            ) : followingUsers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-600">Bạn chưa theo dõi ai</p>
                <p className="text-xs text-gray-400 mt-2">Hãy theo dõi người khác để bắt đầu trò chuyện</p>
              </div>
            ) : (
              followingUsers
                .filter(u => 
                  u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.username?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((followingUser) => (
                  <button
                    key={followingUser._id}
                    onClick={() => startChatWithUser(followingUser)}
                    className="w-full p-3 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <div className="relative flex-shrink-0">
                      {followingUser.avatar && followingUser.avatar.startsWith("http") ? (
                        <img src={followingUser.avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-xl font-bold text-orange-600">
                          {(followingUser.name?.charAt(0) || "?").toUpperCase()}
                        </div>
                      )}
                      {followingUser.isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="text-sm font-medium truncate text-gray-900">
                        {followingUser.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        @{followingUser.username}
                      </p>
                    </div>

                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                ))
            )
          )}
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getConversationAvatar(selectedConversation) && getConversationAvatar(selectedConversation)!.startsWith("http") ? (
                  <img src={getConversationAvatar(selectedConversation)!} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg font-bold text-orange-600">
                    {getConversationTitle(selectedConversation).charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-gray-900">{getConversationTitle(selectedConversation)}</h2>
                  <p className="text-xs text-gray-600">
                    {typing ? `${typing.userName} đang nhập...` : 'Đang hoạt động'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-600">Gửi tin nhắn đầu tiên</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message, index) => (
                    <div key={message._id}>
                      {shouldShowDateSeparator(index) && (
                        <div className="flex justify-center my-4">
                          <div className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                            {formatDate(message.createdAt)}
                          </div>
                        </div>
                      )}

                      {message.senderType === "system" ? (
                        <div className="flex justify-center">
                          <div className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                            {message.content.text}
                          </div>
                        </div>
                      ) : (
                        <div className={`flex items-end gap-2 ${user && (message.senderId === user.id || message.senderId === user._id) ? "justify-end" : ""}`}>
                          {user && message.senderId !== user.id && message.senderId !== user._id && (
                            <div className="w-7 h-7">
                              {message.sender?.avatar ? (
                                <img src={message.sender.avatar} alt="" className="w-7 h-7 rounded-full" />
                              ) : (
                                <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">
                                  {message.sender?.name?.charAt(0) || "?"}
                                </div>
                              )}
                            </div>
                          )}

                          <div className={`max-w-[70%] ${user && (message.senderId === user.id || message.senderId === user._id) ? "order-first" : ""}`}>
                            <div className={`px-4 py-2 rounded-2xl ${user && (message.senderId === user.id || message.senderId === user._id) ? "bg-orange-500 text-white" : "bg-gray-100 border border-gray-200 text-gray-900"}`}>
                              <p className="text-sm whitespace-pre-wrap break-words">{message.content.text}</p>
                            </div>
                            <div className={`mt-1 text-xs text-gray-500 px-1 ${user && (message.senderId === user.id || message.senderId === user._id) ? "text-right" : ""}`}>
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

            <div className="border-t border-gray-200 p-4">
              <form onSubmit={sendMessage} className="flex items-center gap-3">
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
                  placeholder="Aa"
                  rows={1}
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  style={{ minHeight: "40px", maxHeight: "120px" }}
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  className="w-10 h-10 flex items-center justify-center bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Tin nhắn của bạn</h3>
              <p className="text-gray-500 text-sm">Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
