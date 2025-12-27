import { ObjectId } from "mongodb";

export interface AuditLog {
  _id?: ObjectId;
  type: AuditLogType;
  actorId: ObjectId | string;
  targetUserId?: ObjectId | string;
  targetId?: ObjectId | string; // For non-user targets (product, recipe, etc)
  action: AuditAction;
  field?: string;
  before?: any;
  after?: any;
  description: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    [key: string]: any;
  };
  createdAt: Date;  isRolledBack?: boolean;
  rolledBackBy?: ObjectId | string;
  rolledBackAt?: Date;}

export type AuditLogType =
  | "permission_change"
  | "role_change"
  | "user_create"
  | "user_update"
  | "user_delete"
  | "product_create"
  | "product_update"
  | "product_delete"
  | "recipe_create"
  | "recipe_update"
  | "recipe_delete"
  | "comment_delete"
  | "short_delete"
  | "order_create"
  | "order_update"
  | "profile_update"
  | "password_change"
  | "email_change"
  | "avatar_change"
  | "system_config";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "ADD_PERMISSION"
  | "REMOVE_PERMISSION"
  | "CHANGE_ROLE"
  | "GRANT_ACCESS"
  | "REVOKE_ACCESS"
  | "LOGIN"
  | "LOGOUT"
  | "APPROVE"
  | "REJECT";

export const AUDIT_LOG_TYPE_LABELS: Record<AuditLogType, string> = {
  permission_change: "Thay đổi quyền",
  role_change: "Thay đổi vai trò",
  user_create: "Tạo người dùng",
  user_update: "Cập nhật người dùng",
  user_delete: "Xóa người dùng",
  product_create: "Tạo sản phẩm",
  product_update: "Cập nhật sản phẩm",
  product_delete: "Xóa sản phẩm",
  recipe_create: "Tạo công thức",
  recipe_update: "Cập nhật công thức",
  recipe_delete: "Xóa công thức",
  comment_delete: "Xóa bình luận",
  short_delete: "Xóa short",
  order_create: "Tạo đơn hàng",
  order_update: "Cập nhật đơn hàng",
  profile_update: "Cập nhật profile",
  password_change: "Đổi mật khẩu",
  email_change: "Đổi email",
  avatar_change: "Đổi avatar",
  system_config: "Cấu hình hệ thống",
};

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
  ADD_PERMISSION: "Thêm quyền",
  REMOVE_PERMISSION: "Xóa quyền",
  CHANGE_ROLE: "Đổi vai trò",
  GRANT_ACCESS: "Cấp quyền truy cập",
  REVOKE_ACCESS: "Thu hồi quyền",
  LOGIN: "Đăng nhập",
  LOGOUT: "Đăng xuất",
  APPROVE: "Phê duyệt",
  REJECT: "Từ chối",
};
