# 🛍️ Abbyumy Shop - Hướng dẫn sử dụng

## 📦 Tính năng đã hoàn thành

### 1. Trang danh sách sản phẩm (`/shop`)
- ✅ Hiển thị tất cả sản phẩm từ database
- ✅ Filter theo danh mục (Food Ingredients, Kitchenware, Music, v.v.)
- ✅ Product card với hình ảnh, giá, rating
- ✅ Badges: "Sắp hết hàng", "Best Seller"
- ✅ Responsive grid layout
- ✅ Floating cart button

### 2. Trang chi tiết sản phẩm (`/shop/[id]`)
- ✅ Breadcrumb navigation
- ✅ Image gallery với thumbnail selector
- ✅ Thông tin sản phẩm đầy đủ (giá, rating, stock)
- ✅ Variant selector (Size, Color, v.v.)
- ✅ Quantity picker
- ✅ Nút "Thêm vào giỏ" và "Mua ngay"
- ✅ Hiển thị công thức liên quan (nếu có)
- ✅ Mô tả chi tiết + tags
- ✅ Bảng thông tin sản phẩm
- ✅ 3 icons policy: Giao hàng, Chính hãng, Đổi trả

### 3. API Routes
- ✅ `GET /api/products` - Lấy danh sách sản phẩm
- ✅ `GET /api/products/[id]` - Lấy chi tiết 1 sản phẩm
- ✅ Kết nối trực tiếp MongoDB
- ✅ Format dữ liệu chuẩn

### 4. Trang Test (`/test-products`)
- ✅ Hiển thị raw data từ API
- ✅ Debug info cho mỗi sản phẩm
- ✅ Link đến chi tiết sản phẩm
- ✅ Refresh button

## 🗄️ Database Schema

Collection: **products** trong database **abbyumy**

```javascript
{
  _id: ObjectId,
  title: String,              // Tên sản phẩm
  description: String,        // Mô tả
  price: Number,              // Giá (VND)
  currency: String,           // "VND"
  images: [String],           // Mảng URL hình ảnh
  sku: String,                // Mã SKU
  stock: Number,              // Số lượng tồn kho
  status: String,             // "active" | "inactive"
  sellerId: ObjectId,         // ID người bán
  recipeId: ObjectId | null,  // Link đến công thức (optional)
  category: String,           // Danh mục sản phẩm
  tags: [String],             // Tags
  variants: [{                // Phân loại hàng
    name: String,             // "Size", "Color"
    value: String,            // "Large", "Red"
    extraPrice: Number        // Giá thêm
  }],
  rating: Number,             // Đánh giá (0-5)
  reviewCount: Number,        // Số lượng đánh giá
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Cách test

### 1. Kiểm tra kết nối Database

Truy cập: `http://localhost:3000/test-products`

- Nếu hiển thị danh sách sản phẩm → ✅ Database đã kết nối
- Nếu hiển thị "Không có sản phẩm" → ⚠️ Collection "products" đang trống
- Nếu có lỗi → ❌ Kiểm tra MongoDB connection

### 2. Xem danh sách sản phẩm

Truy cập: `http://localhost:3000/shop`

- Xem tất cả sản phẩm
- Click vào category để filter
- Click vào product card để xem chi tiết

### 3. Xem chi tiết sản phẩm

Click vào bất kỳ sản phẩm nào hoặc truy cập trực tiếp:
`http://localhost:3000/shop/[product_id]`

Ví dụ: `http://localhost:3000/shop/69098622fdc5bdc3a13154d7`

## 📝 Dữ liệu mẫu có sẵn

Database đã có 3 sản phẩm mẫu:

1. **Gia vị sốt BBQ (Combo)** - 99,000₫
   - Category: Food Ingredients
   - Có công thức Yaki Udon liên quan
   - Có variants: Small, Large

2. **Sáo trúc Handmade** - 450,000₫
   - Category: Music
   - Không có công thức

3. **Bộ dụng cụ nấu ăn** - 299,000₫
   - Category: Kitchenware
   - Variant: Color (Black)

## 🔧 Troubleshooting

### Không thấy sản phẩm?

1. Kiểm tra MongoDB đang chạy:
   ```bash
   # Kiểm tra service
   net start MongoDB
   ```

2. Kiểm tra connection string trong `.env.local`:
   ```
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=abbyumy
   ```

3. Kiểm tra collection trong MongoDB Compass:
   - Database: `abbyumy`
   - Collection: `products`

### Hình ảnh không hiển thị?

Hình ảnh trong database chỉ là đường dẫn tương đối. Cần:
- Copy hình ảnh vào thư mục `public/`
- Hoặc sử dụng URL đầy đủ (https://...)

## 🎯 TODO - Tính năng tiếp theo

- [ ] Shopping cart (thêm/xóa sản phẩm)
- [ ] Checkout flow
- [ ] Payment integration
- [ ] Order management
- [ ] Product reviews
- [ ] Wishlist
- [ ] Search products
- [ ] Filter by price range
- [ ] Sort options
- [ ] Pagination

## 📱 Responsive Design

- ✅ Mobile (< 640px): 2 columns
- ✅ Tablet (640-1024px): 3 columns
- ✅ Desktop (> 1024px): 4-5 columns

## 🎨 Design System

**Colors:**
- Primary: Orange (#F97316)
- Secondary: Pink (#EC4899), Purple (#A855F7)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)

**Typography:**
- Title: Bold, 2xl-4xl
- Body: Regular, base-lg
- Small: text-sm

**Spacing:**
- Container: max-w-7xl mx-auto px-4
- Gap: 4, 6, 8 (1rem = 4)
