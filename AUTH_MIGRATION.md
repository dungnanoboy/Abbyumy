# 🍳 Abbyumy - Website Chia Sẻ Công Thức Nấu Ăn

## Thay đổi mới nhất

### ✅ Chuyển đổi Authentication sang MongoDB
- **Xóa mockUsers.ts**: Đã loại bỏ hoàn toàn dữ liệu giả lập
- **API Authentication mới**:
  - `POST /api/auth/login` - Đăng nhập với MongoDB
  - `POST /api/auth/register` - Đăng ký tài khoản mới
  - `GET /api/users` - Lấy danh sách users

### 🔐 Cách hoạt động

#### Đăng nhập (Login)
1. User nhập email và password
2. Frontend gọi `POST /api/auth/login`
3. Backend tìm user trong collection `users` của MongoDB
4. So sánh password (hiện tại plaintext, nên hash trong production)
5. Trả về thông tin user (không có password)
6. Frontend lưu user vào localStorage

#### Đăng ký (Register)
1. User nhập name, email, password
2. Frontend validate và gọi `POST /api/auth/register`
3. Backend kiểm tra email đã tồn tại chưa
4. Tạo user mới trong MongoDB collection `users`
5. Trả về thông tin user mới
6. Frontend lưu user vào localStorage và chuyển về trang chủ

### 📁 Cấu trúc Files mới

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts       ✅ API đăng nhập
│   │   │   └── register/
│   │   │       └── route.ts       ✅ API đăng ký
│   │   └── users/
│   │       └── route.ts           ✅ API lấy users
│   ├── login/
│   │   └── page.tsx               ✅ Updated - dùng API
│   └── register/
│       └── page.tsx               ✅ Updated - dùng API
├── lib/
│   └── mockUsers.ts               ❌ DELETED
└── types/
    └── database.ts                ✅ Updated - thêm role field
```

### 🗄️ MongoDB Schema

#### Collection: `users`
```json
{
  "_id": ObjectId,
  "id": "user1",              // Legacy field (optional)
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "123456",       // TODO: Hash với bcrypt
  "avatar": "",
  "bio": "Mô tả ngắn",
  "recipeCount": 0,
  "role": "user",             // "user" hoặc "admin"
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### 🧪 Test Authentication

#### 1. Test đăng nhập với tài khoản có sẵn:
```bash
# Tài khoản demo (đã có trong database):
Email: admin@example.com
Password: 123456

Email: nguyenvana@example.com
Password: 123456
```

#### 2. Test đăng ký tài khoản mới:
- Truy cập: http://localhost:3000/register
- Điền form và submit
- Kiểm tra MongoDB collection `users` để xem user mới

#### 3. Test API trực tiếp:
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'

# Get all users
curl http://localhost:3000/api/users
```

### ⚠️ TODO - Cần cải thiện

1. **Hash passwords**: Hiện tại password lưu dạng plaintext
   ```bash
   npm install bcrypt
   npm install --save-dev @types/bcrypt
   ```

2. **JWT/Session**: Thay localStorage bằng JWT tokens hoặc session cookies

3. **Email validation**: Thêm regex validate format email

4. **Rate limiting**: Giới hạn số lần login/register để tránh brute force

5. **Error handling**: Xử lý lỗi chi tiết hơn (network errors, timeout, etc.)

### 🚀 Chạy dự án

```bash
cd abbyumy
npm install
npm run dev
```

Server chạy tại: http://localhost:3000

### 📊 API Endpoints hiện có

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | /api/auth/login | Đăng nhập |
| POST | /api/auth/register | Đăng ký |
| GET | /api/users | Lấy danh sách users |
| GET | /api/recipes | Lấy danh sách recipes (limit, sort) |
| GET | /api/recipes/[id] | Lấy chi tiết recipe |
| POST | /api/recipes | Tạo recipe mới |

### 🔗 MongoDB Connection

File `.env.local`:
```env
MONGODB_URI=your_connection_string
MONGODB_DB=abbyumy
```

Collection trong database `abbyumy`:
- `users` - Thông tin người dùng
- `recipes` - Công thức nấu ăn
