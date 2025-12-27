# Hướng Dẫn Kết Nối MongoDB Atlas với Abbyumy

## 📋 Các Bước Đã Hoàn Thành

✅ 1. Cài đặt MongoDB driver
✅ 2. Tạo file `.env.local` 
✅ 3. Tạo MongoDB connection utility
✅ 4. Tạo database models (TypeScript types)
✅ 5. Tạo API routes để test và sử dụng database

---

## 🔧 Cấu Hình MongoDB Atlas

### Bước 1: Lấy Connection String từ MongoDB Atlas

1. Đăng nhập vào [MongoDB Atlas](https://cloud.mongodb.com)
2. Chọn cluster của bạn
3. Click nút **"Connect"**
4. Chọn **"Connect your application"**
5. Copy **Connection String** (dạng: `mongodb+srv://...`)

### Bước 2: Cập Nhật File `.env.local`

Mở file `.env.local` và thay thế các giá trị:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/abbyumy?retryWrites=true&w=majority
MONGODB_DB=abbyumy
```

**Thay thế:**
- `<username>` → Username MongoDB của bạn
- `<password>` → Password của bạn (URL encoded nếu có ký tự đặc biệt)
- `cluster0.xxxxx.mongodb.net` → URL cluster của bạn
- `abbyumy` → Tên database (có thể đổi)

**Ví dụ:**
```env
MONGODB_URI=mongodb+srv://myuser:MyPassword123@cluster0.abc123.mongodb.net/abbyumy?retryWrites=true&w=majority
MONGODB_DB=abbyumy
```

### Bước 3: Whitelist IP Address

1. Trong MongoDB Atlas, vào **Network Access**
2. Click **"Add IP Address"**
3. Chọn **"Allow Access from Anywhere"** (cho development)
   - Hoặc thêm IP cụ thể của bạn

---

## 🧪 Test Kết Nối

### 1. Khởi động lại server

```bash
npm run dev
```

### 2. Test API endpoints

**Test connection:**
```
http://localhost:3000/api/test-db
```

**Get users:**
```
http://localhost:3000/api/users
```

**Get recipes:**
```
http://localhost:3000/api/recipes
```

---

## 📁 Cấu Trúc Database

### Collections

#### **users**
```javascript
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string,  // Should be hashed
  avatar: string,
  bio: string,
  recipeCount: number,
  createdAt: Date,
  updatedAt: Date
}
```

#### **recipes**
```javascript
{
  _id: ObjectId,
  title: string,
  description: string,
  image: string,
  authorId: ObjectId,
  prepTime: number,
  cookTime: number,
  servings: number,
  difficulty: "easy" | "medium" | "hard",
  ingredients: [{
    name: string,
    amount: string,
    unit: string
  }],
  steps: [{
    order: number,
    instruction: string,
    image: string
  }],
  category: string[],
  tags: string[],
  likes: number,
  views: number,
  cooksnaps: number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Sử Dụng MongoDB trong Code

### Lấy database instance

```typescript
import { getDatabase } from '@/lib/mongodb';

const db = await getDatabase();
```

### Query dữ liệu

```typescript
// Find all
const users = await db.collection('users').find({}).toArray();

// Find one
const user = await db.collection('users').findOne({ email: 'test@example.com' });

// Insert
const result = await db.collection('users').insertOne(newUser);

// Update
await db.collection('users').updateOne(
  { _id: userId },
  { $set: { name: 'New Name' } }
);

// Delete
await db.collection('users').deleteOne({ _id: userId });
```

---

## 📝 Sử Dụng với NoSQL Booster

### Kết nối từ NoSQL Booster

1. Mở NoSQL Booster
2. Click **"Connect"**
3. Chọn **"From URI"**
4. Paste connection string từ `.env.local`
5. Click **"Test"** để kiểm tra
6. Click **"Save & Connect"**

### Query từ NoSQL Booster

```javascript
// View all users
db.users.find()

// View all recipes
db.recipes.find()

// Insert sample user
db.users.insertOne({
  name: "Test User",
  email: "test@example.com",
  password: "123456",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Bảo mật `.env.local`**: Không commit file này lên Git
2. **Password hashing**: Trong production, phải hash password (dùng bcrypt)
3. **Connection pooling**: MongoDB driver tự động quản lý connection pool
4. **Error handling**: Luôn wrap database operations trong try-catch

---

## 🔄 Migration từ Mock Data sang MongoDB

Để chuyển từ mock data sang MongoDB, bạn cần:

1. Update các trang `/login`, `/register` để gọi API thay vì dùng localStorage
2. Update trang recipes để fetch từ API
3. Tạo API routes cho authentication
4. Implement session management (JWT hoặc cookies)

---

## 📚 Tài Liệu Tham Khảo

- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
