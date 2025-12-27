# 💬 Hệ Thống Chat Realtime - Abbyumy

## 🎯 Tổng quan

Hệ thống chat realtime được xây dựng theo kiến trúc của các platform lớn như **Facebook Messenger**, **TikTok**, và **Shopee**. Hỗ trợ:

- ✅ Chat 1-1 (direct message)
- ✅ Chat với Shop (buyer ↔ seller)
- ✅ Chat với Support
- ✅ Chat với AI Bot (sẵn sàng tích hợp)
- ✅ Realtime với Socket.IO
- ✅ Typing indicator
- ✅ Online status
- ✅ Unread count
- ✅ Message pagination

## 🗄️ Cấu trúc Database

### Collections MongoDB:

#### 1. `conversations`
```javascript
{
  _id: ObjectId(),
  type: "direct" | "group" | "support" | "shop" | "ai",
  context: {
    orderId?: ObjectId(),
    productId?: ObjectId(),
    shopId?: ObjectId()
  },
  createdBy: "userId",
  createdAt: ISODate(),
  updatedAt: ISODate(),
  lastMessage: {
    messageId: "messageId",
    text: "Nội dung tin nhắn",
    senderId: "userId",
    createdAt: ISODate()
  },
  settings: {
    allowAI: false,
    archived: false
  }
}
```

#### 2. `conversation_participants`
```javascript
{
  _id: ObjectId(),
  conversationId: "conversationId",
  userId: "userId",
  role: "member" | "admin" | "support" | "bot",
  joinedAt: ISODate(),
  lastReadAt: ISODate(),  // Dùng để tính unread count
  muted: false,
  blocked: false
}
```

#### 3. `messages`
```javascript
{
  _id: ObjectId(),
  conversationId: "conversationId",
  senderId: "userId",
  senderType: "user" | "system" | "bot" | "ai",
  type: "text" | "image" | "video" | "product" | "order" | "coupon",
  content: {
    text?: "Nội dung",
    mediaUrl?: "url",
    productId?: "productId",
    orderId?: "orderId"
  },
  replyTo?: "messageId",
  mentions?: ["userId1", "userId2"],
  status: "sent" | "delivered" | "read",
  createdAt: ISODate(),
  updatedAt: ISODate()
}
```

#### 4. `message_reports`
```javascript
{
  _id: ObjectId(),
  messageId: "messageId",
  conversationId: "conversationId",
  reportedBy: "userId",
  reason: "spam" | "harassment" | "inappropriate" | "scam",
  description: "Mô tả",
  status: "pending" | "reviewed" | "resolved",
  createdAt: ISODate()
}
```

## 🚀 Chạy ứng dụng

### Development (với Socket.IO):
```bash
npm run dev
```

### Development (Next.js only - không có realtime):
```bash
npm run dev:next
```

### Production:
```bash
npm run build
npm start
```

## 📡 API Routes

### 1. Get Conversations
```
GET /api/chat/conversations
Headers: x-user-id: <userId>
```

Response:
```json
{
  "conversations": [
    {
      "_id": "conv123",
      "type": "direct",
      "participants": [...],
      "lastMessage": {...},
      "unreadCount": 3
    }
  ]
}
```

### 2. Create Conversation
```
POST /api/chat/conversations
Headers: x-user-id: <userId>
Body: {
  "type": "direct" | "shop" | "support" | "ai",
  "participantIds": ["userId1", "userId2"],
  "context": { ... }
}
```

### 3. Get Messages
```
GET /api/chat/messages/{conversationId}?limit=50&before=messageId
Headers: x-user-id: <userId>
```

### 4. Send Message
```
POST /api/chat/messages/{conversationId}
Headers: x-user-id: <userId>
Body: {
  "type": "text",
  "content": {
    "text": "Hello"
  }
}
```

### 5. Mark as Read
```
POST /api/chat/messages/{conversationId}/read
Headers: x-user-id: <userId>
```

## 🔌 Socket.IO Events

### Client → Server

#### Join user room:
```javascript
socket.emit('user:join', userId);
```

#### Join conversation:
```javascript
socket.emit('conversation:join', conversationId);
```

#### Leave conversation:
```javascript
socket.emit('conversation:leave', conversationId);
```

#### Typing indicators:
```javascript
socket.emit('typing:start', {
  conversationId,
  userId,
  userName
});

socket.emit('typing:stop', {
  conversationId,
  userId
});
```

### Server → Client

#### New message:
```javascript
socket.on('message:new', (message) => {
  // Handle new message
});
```

#### Message read:
```javascript
socket.on('message:read', (data) => {
  // Update UI
});
```

#### User typing:
```javascript
socket.on('user:typing', (data) => {
  // Show/hide typing indicator
});
```

#### User status:
```javascript
socket.on('user:status', (data) => {
  // Update online/offline status
});
```

## 🎨 UI Pages

### 1. Inbox (`/messages`)
- Danh sách cuộc trò chuyện
- Tìm kiếm conversation
- Hiển thị unread count
- Thời gian tin nhắn cuối

### 2. Chat Window (`/messages/[id]`)
- Gửi/nhận tin nhắn realtime
- Typing indicator
- Date separator
- Scroll tự động
- Enter để gửi tin nhắn

### 3. Dropdown Menu
Link "Tin nhắn" đã được thêm vào menu dropdown ở header

## 📋 Index cần tạo (Performance)

```javascript
// MongoDB Indexes
db.messages.createIndex({ conversationId: 1, createdAt: 1 })
db.conversation_participants.createIndex({ userId: 1 })
db.conversations.createIndex({ updatedAt: -1 })
```

## 🔐 Authentication

Hệ thống sử dụng header `x-user-id` để xác thực. Client tự động gửi userId từ localStorage qua helper `authFetch()`.

```typescript
// src/lib/authFetch.ts
import { authFetch } from '@/lib/authFetch';

// Sử dụng:
const res = await authFetch('/api/chat/conversations');
```

## 🎯 Các tính năng có thể mở rộng

### 1. Gửi hình ảnh/video
Thêm xử lý upload file trong API:
```javascript
type: "image",
content: {
  mediaUrl: "https://..."
}
```

### 2. Chat với AI
```javascript
// Tạo conversation với type "ai"
{
  type: "ai",
  settings: {
    allowAI: true
  }
}

// Gửi tin nhắn → AI tự động trả lời
```

### 3. Chat Shop (order-based)
```javascript
// Tạo conversation từ đơn hàng
{
  type: "shop",
  context: {
    orderId: "order123",
    shopId: "shop456"
  }
}
```

### 4. Group Chat
```javascript
{
  type: "group",
  participants: [user1, user2, user3, ...]
}
```

### 5. Message Reactions
Thêm field vào message:
```javascript
{
  reactions: {
    "👍": ["userId1", "userId2"],
    "❤️": ["userId3"]
  }
}
```

### 6. Voice/Video Call
Tích hợp WebRTC cho voice/video call

## 🐛 Troubleshooting

### Socket không kết nối:
1. Kiểm tra server đang chạy với `npm run dev` (không phải `npm run dev:next`)
2. Kiểm tra console log: "Socket connected"
3. Kiểm tra port 3000 không bị block

### Không nhận được tin nhắn realtime:
1. Kiểm tra Socket.IO đã connect chưa
2. Kiểm tra đã join conversation room chưa
3. Check console log có error không

### Unread count không chính xác:
1. Đảm bảo gọi `markAsRead()` khi mở chat
2. Check `lastReadAt` trong participant

## 📚 Tham khảo

- [Socket.IO Documentation](https://socket.io/docs/)
- [MongoDB Indexes](https://www.mongodb.com/docs/manual/indexes/)
- [Next.js Custom Server](https://nextjs.org/docs/advanced-features/custom-server)

## 🎉 Hoàn thành!

Hệ thống chat realtime đã sẵn sàng sử dụng. Happy coding! 🚀
