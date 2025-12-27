# Hệ thống Nhật ký Hoạt động (Audit Logs)

## Tổng quan
Hệ thống audit log ghi lại toàn bộ các hoạt động quan trọng trong hệ thống, đặc biệt là các thay đổi về quyền và vai trò người dùng.

## Các file đã tạo/chỉnh sửa

### 1. Types & Interfaces
**File:** `/types/audit.ts`
- Định nghĩa interface `AuditLog` với các trường:
  - `type`: Loại hoạt động (permission_change, role_change, user_*, product_*, etc.)
  - `actorId`: ID người thực hiện
  - `targetUserId`: ID người bị tác động
  - `targetId`: ID đối tượng khác (product, recipe, etc.)
  - `action`: Hành động cụ thể (CREATE, UPDATE, DELETE, ADD_PERMISSION, etc.)
  - `field`: Trường dữ liệu bị thay đổi
  - `before`: Giá trị trước khi thay đổi
  - `after`: Giá trị sau khi thay đổi
  - `description`: Mô tả chi tiết bằng tiếng Việt
  - `metadata`: Thông tin bổ sung (IP, userAgent, etc.)
  - `createdAt`: Thời gian

- 20 loại AuditLogType
- 12 loại AuditAction
- Labels tiếng Việt cho UI

### 2. Helper Functions
**File:** `/lib/auditLog.ts`

#### `createAuditLog(params)`
Tạo một bản ghi audit log mới
```typescript
await createAuditLog({
  type: 'permission_change',
  actorId: '...',
  targetUserId: '...',
  action: 'UPDATE',
  field: 'customPermissions',
  before: [...],
  after: [...],
  description: 'Thay đổi quyền của user...',
  metadata: { ip: '...', userAgent: '...' }
});
```

#### `getAuditLogs(filters)`
Lấy danh sách logs với filter và pagination
- Filters: type, actorId, targetUserId, startDate, endDate, search
- Pagination: page, limit
- Returns: { logs, total, page, totalPages, hasNext, hasPrev }

#### `getUserAuditLogs(userId, limit)`
Lấy logs liên quan đến một user cụ thể

#### `getAuditLogForRollback(logId)`
Lấy thông tin log để thực hiện rollback

### 3. API Routes

#### `/api/admin/audit-logs` (GET)
Lấy danh sách audit logs với filters
- Query params: type, actorId, targetUserId, startDate, endDate, search, page, limit
- Response: { logs[], total, page, totalPages, hasNext, hasPrev }

#### `/api/admin/audit-logs/[id]` (GET, POST)
- GET: Lấy chi tiết một log
- POST: Thực hiện rollback (khôi phục trạng thái cũ)
  - Chỉ cho phép rollback logs < 7 ngày
  - Chỉ hỗ trợ permission_change và role_change

### 4. Integration

#### `/api/admin/users/[id]/permissions` (PATCH)
Đã tích hợp audit logging:
- Ghi log khi thay đổi customPermissions
- So sánh before/after để hiển thị quyền được thêm/xóa
- Lưu IP và User Agent

#### `/api/admin/users/[id]/role` (PATCH)
Đã tích hợp audit logging:
- Ghi log khi thay đổi role
- Lưu role cũ và role mới
- Lưu IP và User Agent

**Lưu ý:** Frontend hiện tại chưa có authentication, nên actorId đang dùng placeholder `"000000000000000000000000"`. Cần cập nhật khi có auth system.

### 5. Admin UI

#### `/admin/audit-logs/page.tsx`
Trang quản lý nhật ký hoạt động với các tính năng:

**Filters:**
- Dropdown chọn loại hoạt động
- Tìm kiếm trong mô tả
- Hiển thị tổng số bản ghi

**Table hiển thị:**
- Thời gian
- Loại (với badge màu xanh)
- Người thực hiện
- Hành động (với badge màu xanh lá)
- Đối tượng
- Mô tả
- Nút "Chi tiết"

**Pagination:**
- Hỗ trợ nhiều trang
- Hiển thị số trang hiện tại
- Nút prev/next và page numbers

**Modal Chi tiết:**
- Hiển thị đầy đủ thông tin log
- Before/After với syntax highlighting (đỏ/xanh lá)
- Metadata (IP, User Agent)
- Nút "Khôi phục" nếu có thể rollback
- Conditions for rollback:
  - Có dữ liệu `before`
  - Log < 7 ngày
  - Type phải là permission_change hoặc role_change

**Features:**
- Auto-enrich logs với tên người dùng (actor và target)
- Format ngày giờ theo locale Việt Nam
- Responsive design

#### `/admin/layout.tsx`
Đã thêm menu item "Nhật ký hoạt động" vào sidebar admin

## Cách sử dụng

### 1. Xem nhật ký
1. Truy cập `/admin/audit-logs`
2. Sử dụng filters để lọc logs theo loại hoạt động
3. Tìm kiếm theo từ khóa trong mô tả
4. Click vào row để xem chi tiết

### 2. Khôi phục thay đổi (Rollback)
1. Mở chi tiết log
2. Nếu log hỗ trợ rollback (có nút 🔄 Khôi phục):
   - Click nút
   - Xác nhận
   - Hệ thống sẽ restore giá trị cũ

### 3. Tích hợp vào features khác
Khi tạo API mới cần ghi log, sử dụng:

```typescript
import { createAuditLog } from '@/lib/auditLog';

// Trong API route
await createAuditLog({
  type: 'user_create', // hoặc type phù hợp
  actorId: currentUserId,
  targetUserId: newUserId, // nếu có
  action: 'CREATE',
  description: 'Tạo người dùng mới...',
  before: null,
  after: { ...userData },
  metadata: {
    ip: request.headers.get('x-forwarded-for') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  }
});
```

## Các loại log được hỗ trợ

### User-related
- `user_create`: Tạo người dùng mới
- `user_update`: Cập nhật thông tin người dùng
- `user_delete`: Xóa người dùng
- `role_change`: Thay đổi vai trò
- `permission_change`: Thay đổi quyền cá nhân

### Content-related
- `product_delete`: Xóa sản phẩm
- `recipe_delete`: Xóa công thức
- `comment_delete`: Xóa bình luận
- `short_delete`: Xóa short video

### Profile updates
- `profile_update`: Cập nhật profile
- `password_change`: Đổi mật khẩu
- `email_change`: Đổi email
- `avatar_change`: Đổi avatar

### Orders
- `order_create`, `order_update`, `order_cancel`, `order_complete`

### System
- `system_config`: Thay đổi cấu hình hệ thống

## Rollback Support

Hiện tại hỗ trợ rollback cho:
- ✅ `permission_change`: Khôi phục customPermissions
- ✅ `role_change`: Khôi phục role cũ

Sẽ mở rộng thêm cho các types khác trong tương lai.

## TODO

1. **Authentication**: Cập nhật actorId từ session thay vì placeholder
2. **More log types**: Tích hợp logging vào các API khác (products, recipes, etc.)
3. **Advanced filters**: Thêm filter theo date range, actor name
4. **Export**: Cho phép export logs ra CSV/Excel
5. **Notifications**: Gửi thông báo khi có hoạt động quan trọng
6. **Analytics**: Dashboard thống kê các hoạt động
7. **Rollback extension**: Hỗ trợ rollback cho nhiều types hơn

## Security Notes

- Chỉ admin mới có quyền xem audit logs
- IP và User Agent được lưu để tracking
- Rollback chỉ cho phép trong 7 ngày
- Không thể xóa audit logs (immutable)
- Audit log operation không tạo audit log mới (tránh infinite loop)

## Database Schema

Collection: `audit_logs`
```javascript
{
  _id: ObjectId,
  type: String,
  actorId: ObjectId,
  targetUserId: ObjectId (optional),
  targetId: ObjectId (optional),
  action: String,
  field: String (optional),
  before: Mixed (optional),
  after: Mixed (optional),
  description: String,
  metadata: {
    ip: String,
    userAgent: String,
    ...custom fields
  },
  createdAt: Date
}
```

### Indexes (Recommended)
```javascript
db.audit_logs.createIndex({ type: 1, createdAt: -1 });
db.audit_logs.createIndex({ actorId: 1, createdAt: -1 });
db.audit_logs.createIndex({ targetUserId: 1, createdAt: -1 });
db.audit_logs.createIndex({ createdAt: -1 });
```
