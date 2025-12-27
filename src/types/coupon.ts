import { ObjectId } from "mongodb";

// Discount configuration
export interface CouponDiscount {
  type: "percent" | "fixed" | "freeShip" | "cashback";
  value: number;
  maxDiscount?: number;
  minOrderValue?: number;
}

// Scope of coupon application
export interface CouponScope {
  sellerId?: string | ObjectId | null;
  products?: Array<string | ObjectId>;
  categories?: Array<string | ObjectId>;
}

// Dynamic rule condition
export interface CouponCondition {
  rule: string;
  value: string | number | boolean;
}

// Usage limits
export interface CouponLimits {
  usageLimit?: number;
  perUserLimit?: number;
}

// Main coupon interface
export interface Coupon {
  _id?: string | ObjectId;
  type: "voucher" | "shop_voucher" | "free_ship" | "combo" | "event";
  code: string;
  description: string;
  discount: CouponDiscount;
  scope: CouponScope;
  conditions: CouponCondition[];
  limits: CouponLimits;
  eligibleUsers?: Array<string | ObjectId>;
  excludedUsers?: Array<string | ObjectId>;
  startAt: Date;
  endAt: Date;
  isActive: boolean;
  banner?: string;
  tags?: string[];
  createdBy: string | ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// User saved coupon
export interface UserCoupon {
  _id?: string | ObjectId;
  userId: string | ObjectId;
  couponId: string | ObjectId;
  savedAt: Date;
  usedAt?: Date | null;
  expiresAt: Date;
  status: "saved" | "used" | "expired" | "invalid";
}

// Coupon validation result
export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  discount?: number;
  finalPrice?: number;
}

// Available rule types
export type CouponRuleType =
  | "follow_seller"
  | "min_completed_orders"
  | "follow_duration_days"
  | "min_total_spent"
  | "new_user_only"
  | "level"
  | "livestream_only"
  | "view_livestream_minutes"
  | "completed_missions"
  | "in_friend_list"
  | "used_coupon_before"
  | "birthday_month_user";

// Context for rule evaluation
export interface RuleContext {
  userId: string;
  orderValue?: number;
  coupon: Coupon;
  userStats?: {
    completedOrders?: number;
    totalSpent?: number;
    followedAt?: Date;
    level?: string;
    isNewUser?: boolean;
  };
}
