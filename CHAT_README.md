# 💬 Chat System - Quick Start

## Đã tạo xong!

Hệ thống chat realtime giống **Facebook Messenger / TikTok** đã được tích hợp vào Abbyumy.

## 🚀 Chạy ngay

```bash
# 1. Cài đặt dependencies (nếu chưa)
npm install

# 2. Chạy server với Socket.IO
npm run dev

# 3. Tạo indexes cho MongoDB (chỉ cần chạy 1 lần)
node create-chat-indexes.js
```

## 📍 Truy cập

1. Đăng nhập vào website
2. Click vào avatar ở header
3. Chọn **"Tin nhắn"** trong dropdown menu
4. Hoặc truy cập trực tiếp: `http://localhost:3000/messages`

## ✨ Tính năng

- ✅ Chat realtime với Socket.IO
- ✅ Typing indicator (đang nhập...)
- ✅ Unread count (số tin nhắn chưa đọc)
- ✅ Online status
- ✅ Tìm kiếm cuộc trò chuyện
- ✅ Date separator tự động
- ✅ Hỗ trợ chat 1-1, shop, support, AI bot

## 📁 Files quan trọng

### API Routes:
- `src/app/api/chat/conversations/route.ts` - Quản lý conversations
- `src/app/api/chat/messages/[id]/route.ts` - Gửi/nhận messages
- `src/app/api/chat/messages/[id]/read/route.ts` - Đánh dấu đã đọc

### Pages:
- `src/app/messages/page.tsx` - Trang inbox
- `src/app/messages/[id]/page.tsx` - Trang chat window

### Socket:
- `src/lib/socket.ts` - Socket.IO server
- `src/contexts/SocketContext.tsx` - Socket client
- `server.ts` - Custom Next.js server

### Types:
- `src/types/chat.ts` - TypeScript types cho chat

### Utils:
- `src/lib/authFetch.ts` - Helper gọi API với authentication

## 🗄️ Collections MongoDB

Đã tạo sẵn 4 collections:
1. `conversations` - Cuộc trò chuyện
2. `conversation_participants` - Người tham gia
3. `messages` - Tin nhắn
4. `message_reports` - Báo cáo tin nhắn

## 📚 Docs chi tiết

Xem file: `CHAT_SYSTEM.md`

## 🎯 Mở rộng

Dễ dàng thêm:
- Gửi hình ảnh/video
- Chat với AI bot
- Chat nhóm
- Voice/Video call
- Message reactions

---

**Hệ thống đã sẵn sàng! Hãy thử chat ngay! 🎉**
