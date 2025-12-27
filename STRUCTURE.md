# Abbyumy - Web Nấu Ăn 🍳

Website chia sẻ công thức nấu ăn giống Cookpad, được xây dựng với Next.js 15 và React.

## 🏗️ Cấu Trúc Dự Án

```
abbyumy/
├── public/                    # Tài sản tĩnh (ảnh, fonts, icons)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Trang chủ
│   │   └── recipes/           # Routes cho công thức
│   │       ├── page.tsx       # Danh sách công thức
│   │       └── [id]/
│   │           └── page.tsx   # Chi tiết công thức
│   │
│   ├── components/            # React Components
│   │   ├── ui/                # UI components cơ bản (Button, Input...)
│   │   ├── layout/            # Layout components (Header, Footer...)
│   │   │   └── Navigation.tsx
│   │   └── shared/            # Shared components
│   │       └── RecipeCard.tsx
│   │
│   ├── lib/                   # Utilities & helpers
│   │   └── mockData.ts        # Dữ liệu mẫu
│   │
│   ├── hooks/                 # Custom React hooks
│   │
│   ├── types/                 # TypeScript type definitions
│   │   └── recipe.ts
│   │
│   └── styles/                # CSS files
│       └── globals.css
│
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── package.json
└── README.md
```

## ✨ Tính Năng

- ✅ **Trang chủ** - Hero section, từ khóa thịnh hành, công thức nổi bật
- ✅ **Danh sách công thức** - Grid responsive với filter
- ✅ **Chi tiết công thức** - Hiển thị đầy đủ nguyên liệu và các bước làm
- ✅ **Navigation** - Header màu cam với search bar
- ✅ **RecipeCard** - Component hiển thị công thức với stats

## 🚀 Chạy Dự Án

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build

# Chạy production server
npm start
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** React 19

## 📝 Routes

- `/` - Trang chủ
- `/recipes` - Danh sách công thức
- `/recipes/[id]` - Chi tiết công thức

## 🎨 Design

Giao diện lấy cảm hứng từ Cookpad với màu cam chủ đạo, thiết kế sạch sẽ và dễ sử dụng.

## 📦 Dữ Liệu

Hiện tại sử dụng mock data trong `src/lib/mockData.ts`. Trong tương lai sẽ tích hợp với API/Database.
