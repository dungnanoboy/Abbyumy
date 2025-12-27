# 🔧 Fix: Header không cập nhật sau khi đăng nhập

## ❌ Vấn đề ban đầu

Sau khi đăng nhập thành công:
- localStorage được cập nhật
- User được redirect về trang chủ
- **NHƯNG**: Header vẫn hiển thị nút "Đăng ký" và "Đăng nhập"
- Chỉ sau khi F5 hoặc reload page thì mới hiển thị tên user và nút "+ Đăng công thức"

## 🔍 Nguyên nhân

`useAuth` hook chỉ đọc localStorage **một lần** khi component mount:
```typescript
useEffect(() => {
  const userStr = localStorage.getItem("currentUser");
  setUser(JSON.parse(userStr));
}, []); // Chỉ chạy 1 lần khi mount
```

Khi login page cập nhật localStorage, Header component **không biết** để re-render.

## ✅ Giải pháp

### 1. Cập nhật `useAuth` hook

Thêm event listener để lắng nghe thay đổi của localStorage:

```typescript
useEffect(() => {
  // Initial check
  checkUser();
  
  // Listen for storage changes (cross-tab)
  window.addEventListener("storage", handleStorageChange);
  
  // Listen for custom event (same-tab)
  window.addEventListener("authChange", handleAuthChange);
  
  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("authChange", handleAuthChange);
  };
}, []);
```

### 2. Dispatch event sau khi đăng nhập

Trong `login/page.tsx` và `register/page.tsx`:

```typescript
// Sau khi lưu vào localStorage
localStorage.setItem("currentUser", JSON.stringify(user));

// Dispatch event để notify Header
window.dispatchEvent(new Event("authChange"));

// Redirect
router.push("/");
```

## 🎯 Kết quả

Bây giờ khi đăng nhập:
1. ✅ localStorage được cập nhật
2. ✅ Event "authChange" được dispatch
3. ✅ Header component catch event và re-render ngay lập tức
4. ✅ Hiển thị tên user, avatar và nút "+ Đăng công thức" **mà không cần F5**

## 📋 Files đã sửa

1. `src/hooks/useAuth.ts` - Thêm event listeners
2. `src/app/login/page.tsx` - Dispatch authChange event
3. `src/app/register/page.tsx` - Dispatch authChange event

## 🧪 Test

1. Mở http://localhost:3000
2. Click "Đăng nhập"
3. Nhập: `admin@example.com` / `123456`
4. Submit form
5. **Kết quả**: Trang chủ hiển thị ngay tên "Quản trị viên" và nút "+ Đăng công thức" **không cần reload**

## 🎓 Kiến thức bổ sung

### Storage Event vs Custom Event

- **Storage Event**: Chỉ trigger khi localStorage thay đổi từ **tab/window khác**
- **Custom Event** (`authChange`): Trigger trong **cùng tab** khi localStorage thay đổi

Vì vậy cần dùng **cả hai** để cover mọi trường hợp!

### Alternative Solutions

1. **React Context**: Dùng Context API để share auth state
2. **State Management**: Zustand, Redux để global state
3. **Server State**: Next.js Server Components với cookies/sessions

Nhưng với localStorage, cách dùng event listener là đơn giản và hiệu quả nhất.
