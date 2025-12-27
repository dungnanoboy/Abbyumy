import { RuleContext } from "@/types/coupon";
import { getDatabase } from "./mongodb";
import { ObjectId } from "mongodb";

// Rule handler type
type RuleHandler = (context: RuleContext, value: any) => Promise<boolean>;

// Get user statistics for rule evaluation
async function getUserStats(userId: string) {
  const db = await getDatabase();

  // Get completed orders count and total spent
  const orders = await db
    .collection("orders")
    .find({
      userId: new ObjectId(userId),
      status: "delivered",
    })
    .toArray();

  const completedOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  // Get user details
  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

  // Check if user is new (registered within 30 days)
  const isNewUser = user?.createdAt
    ? new Date().getTime() - new Date(user.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
    : false;

  return {
    completedOrders,
    totalSpent,
    level: user?.level || "bronze",
    isNewUser,
    followedAt: user?.followedAt,
  };
}

// Rule handlers
const ruleHandlers: Record<string, RuleHandler> = {
  // User must follow seller
  follow_seller: async (context, value) => {
    if (!value) return true;
    if (!context.coupon.scope.sellerId) return true;

    const db = await getDatabase();

    const follow = await db.collection("follows").findOne({
      userId: new ObjectId(context.userId),
      sellerId: new ObjectId(context.coupon.scope.sellerId),
    });

    return !!follow;
  },

  // Minimum completed orders
  min_completed_orders: async (context, value) => {
    const stats = context.userStats || (await getUserStats(context.userId));
    return (stats.completedOrders || 0) >= value;
  },

  // Follow duration in days
  follow_duration_days: async (context, value) => {
    if (!context.coupon.scope.sellerId) return true;

    const db = await getDatabase();

    const follow = await db.collection("follows").findOne({
      userId: new ObjectId(context.userId),
      sellerId: new ObjectId(context.coupon.scope.sellerId),
    });

    if (!follow || !follow.followedAt) return false;

    const daysSinceFollow =
      (new Date().getTime() - new Date(follow.followedAt).getTime()) / (24 * 60 * 60 * 1000);

    return daysSinceFollow >= value;
  },

  // Minimum total spent
  min_total_spent: async (context, value) => {
    const stats = context.userStats || (await getUserStats(context.userId));
    return (stats.totalSpent || 0) >= value;
  },

  // New user only
  new_user_only: async (context, value) => {
    if (!value) return true;
    const stats = context.userStats || (await getUserStats(context.userId));
    return stats.isNewUser || false;
  },

  // User level requirement
  level: async (context, value) => {
    const stats = context.userStats || (await getUserStats(context.userId));
    const levels = ["bronze", "silver", "gold", "platinum"];
    const requiredLevel = levels.indexOf(value);
    const userLevel = levels.indexOf(stats.level);
    return userLevel >= requiredLevel;
  },

  // Livestream only (placeholder - requires livestream system)
  livestream_only: async (context, value) => {
    if (!value) return true;
    // TODO: Implement livestream check
    // For now, return true to allow testing
    return true;
  },

  // Birthday month user
  birthday_month_user: async (context, value) => {
    if (!value) return true;

    const db = await getDatabase();

    const user = await db.collection("users").findOne({ _id: new ObjectId(context.userId) });

    if (!user?.birthday) return false;

    const currentMonth = new Date().getMonth();
    const birthdayMonth = new Date(user.birthday).getMonth();

    return currentMonth === birthdayMonth;
  },
};

// Main rule evaluation function
export async function evaluateRules(context: RuleContext): Promise<boolean> {
  // Get user stats once for all rules
  context.userStats = await getUserStats(context.userId);

  // Evaluate all conditions
  for (const condition of context.coupon.conditions) {
    const handler = ruleHandlers[condition.rule];

    if (!handler) {
      console.warn(`Unknown rule: ${condition.rule}`);
      continue;
    }

    const result = await handler(context, condition.value);

    if (!result) {
      return false;
    }
  }

  return true;
}

// Export for adding custom rules
export function registerRule(ruleName: string, handler: RuleHandler) {
  ruleHandlers[ruleName] = handler;
}
