// Permission definitions grouped by domain
export interface PermissionGroup {
  domain: string;
  label: string;
  icon: string;
  permissions: {
    key: string;
    label: string;
    description: string;
  }[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    domain: "product",
    label: "Sản phẩm",
    icon: "📦",
    permissions: [
      { key: "product.view", label: "Xem sản phẩm", description: "Xem danh sách và chi tiết sản phẩm" },
      { key: "product.create", label: "Tạo sản phẩm", description: "Đăng sản phẩm mới" },
      { key: "product.update", label: "Sửa sản phẩm", description: "Chỉnh sửa sản phẩm" },
      { key: "product.delete", label: "Xóa sản phẩm", description: "Xóa sản phẩm khỏi hệ thống" },
      { key: "product.moderate", label: "Kiểm duyệt sản phẩm", description: "Duyệt/từ chối sản phẩm" },
    ],
  },
  {
    domain: "recipe",
    label: "Công thức",
    icon: "📖",
    permissions: [
      { key: "recipe.view", label: "Xem công thức", description: "Xem danh sách công thức" },
      { key: "recipe.create", label: "Tạo công thức", description: "Đăng công thức mới" },
      { key: "recipe.update", label: "Sửa công thức", description: "Chỉnh sửa công thức" },
      { key: "recipe.delete", label: "Xóa công thức", description: "Xóa công thức" },
      { key: "recipe.moderate", label: "Kiểm duyệt công thức", description: "Duyệt/từ chối công thức" },
    ],
  },
  {
    domain: "short",
    label: "Video Shorts",
    icon: "🎬",
    permissions: [
      { key: "short.view", label: "Xem shorts", description: "Xem video shorts" },
      { key: "short.upload", label: "Đăng shorts", description: "Đăng video shorts" },
      { key: "short.delete", label: "Xóa shorts", description: "Xóa video shorts" },
      { key: "short.moderate", label: "Kiểm duyệt shorts", description: "Duyệt/từ chối shorts" },
      { key: "short.feature", label: "Đề xuất shorts", description: "Đánh dấu shorts nổi bật" },
    ],
  },
  {
    domain: "comment",
    label: "Bình luận",
    icon: "💬",
    permissions: [
      { key: "comment.view", label: "Xem bình luận", description: "Xem bình luận" },
      { key: "comment.create", label: "Tạo bình luận", description: "Viết bình luận" },
      { key: "comment.reply", label: "Trả lời bình luận", description: "Trả lời bình luận" },
      { key: "comment.like", label: "Thích bình luận", description: "Like/unlike bình luận" },
      { key: "comment.moderate", label: "Kiểm duyệt bình luận", description: "Duyệt/ẩn bình luận" },
      { key: "comment.delete", label: "Xóa bình luận", description: "Xóa bình luận" },
      { key: "comment.auto-moderate", label: "Tự động kiểm duyệt", description: "Bot tự động kiểm duyệt" },
    ],
  },
  {
    domain: "order",
    label: "Đơn hàng",
    icon: "🛒",
    permissions: [
      { key: "order.view", label: "Xem đơn hàng", description: "Xem danh sách đơn hàng" },
      { key: "order.manage", label: "Quản lý đơn hàng", description: "Xử lý và cập nhật đơn hàng" },
      { key: "order.refund", label: "Hoàn tiền", description: "Xử lý hoàn tiền" },
    ],
  },
  {
    domain: "shop",
    label: "Cửa hàng",
    icon: "🏪",
    permissions: [
      { key: "shop.manage", label: "Quản lý shop", description: "Quản lý thông tin shop" },
    ],
  },
  {
    domain: "user",
    label: "Người dùng",
    icon: "👤",
    permissions: [
      { key: "user.view", label: "Xem người dùng", description: "Xem thông tin người dùng" },
      { key: "user.manage", label: "Quản lý người dùng", description: "Sửa thông tin người dùng" },
      { key: "user.follow", label: "Follow người dùng", description: "Theo dõi người dùng" },
      { key: "user.unfollow", label: "Unfollow người dùng", description: "Bỏ theo dõi" },
      { key: "user.warn", label: "Cảnh báo người dùng", description: "Gửi cảnh báo" },
      { key: "user.limit", label: "Hạn chế người dùng", description: "Giới hạn tính năng" },
      { key: "user.ban", label: "Khóa tài khoản", description: "Khóa tài khoản vĩnh viễn" },
      { key: "user.unban", label: "Mở khóa tài khoản", description: "Mở khóa tài khoản" },
    ],
  },
  {
    domain: "affiliate",
    label: "Affiliate",
    icon: "🔗",
    permissions: [
      { key: "affiliate.link.create", label: "Tạo link affiliate", description: "Tạo link tiếp thị" },
      { key: "affiliate.analytics.view", label: "Xem analytics affiliate", description: "Xem thống kê hoa hồng" },
    ],
  },
  {
    domain: "analytics",
    label: "Thống kê",
    icon: "📊",
    permissions: [
      { key: "analytics.view", label: "Xem thống kê tổng", description: "Xem toàn bộ thống kê" },
      { key: "analytics.view.personal", label: "Xem thống kê cá nhân", description: "Xem thống kê riêng" },
      { key: "analytics.collect", label: "Thu thập dữ liệu", description: "Bot thu thập analytics" },
    ],
  },
  {
    domain: "ticket",
    label: "Hỗ trợ",
    icon: "🎫",
    permissions: [
      { key: "ticket.manage", label: "Quản lý ticket", description: "Xử lý yêu cầu hỗ trợ" },
    ],
  },
  {
    domain: "role",
    label: "Vai trò",
    icon: "🛡️",
    permissions: [
      { key: "role.manage", label: "Quản lý vai trò", description: "Thêm/sửa/xóa vai trò" },
    ],
  },
  {
    domain: "permission",
    label: "Quyền hạn",
    icon: "🔐",
    permissions: [
      { key: "permission.manage", label: "Quản lý quyền", description: "Cấu hình quyền hạn" },
    ],
  },
  {
    domain: "system",
    label: "Hệ thống",
    icon: "⚙️",
    permissions: [
      { key: "system.config", label: "Cấu hình hệ thống", description: "Thay đổi cấu hình" },
      { key: "system.cron", label: "CRON jobs", description: "Chạy tác vụ định kỳ" },
      { key: "system.ai", label: "AI bot", description: "Bot AI tự động" },
      { key: "system.maintenance", label: "Bảo trì", description: "Chế độ bảo trì" },
    ],
  },
  {
    domain: "special",
    label: "Đặc biệt",
    icon: "⭐",
    permissions: [
      { key: "*", label: "Toàn quyền", description: "Quyền cao nhất - Admin only" },
    ],
  },
];

// Get all permissions as flat array
export const getAllPermissions = (): string[] => {
  return PERMISSION_GROUPS.flatMap((group) =>
    group.permissions.map((p) => p.key)
  );
};

// Get permission label by key
export const getPermissionLabel = (key: string): string => {
  for (const group of PERMISSION_GROUPS) {
    const perm = group.permissions.find((p) => p.key === key);
    if (perm) return perm.label;
  }
  return key;
};

// Get effective permissions from roles
export const getEffectivePermissions = (roles: string[]): string[] => {
  // This would query the database for role permissions
  // For now, return empty array as placeholder
  return [];
};
