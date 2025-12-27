import { getDatabase } from "./mongodb";
import { AuditLog, AuditLogType, AuditAction } from "@/types/audit";
import { ObjectId } from "mongodb";

interface CreateAuditLogParams {
  type: AuditLogType;
  actorId: string | ObjectId;
  action: AuditAction;
  description: string;
  targetUserId?: string | ObjectId;
  targetId?: string | ObjectId;
  field?: string;
  before?: any;
  after?: any;
  metadata?: {
    ip?: string;
    userAgent?: string;
    [key: string]: any;
  };
}

export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    const db = await getDatabase();

    const log: AuditLog = {
      type: params.type,
      actorId: typeof params.actorId === "string" ? new ObjectId(params.actorId) : params.actorId,
      action: params.action,
      description: params.description,
      createdAt: new Date(),
    };

    if (params.targetUserId) {
      log.targetUserId =
        typeof params.targetUserId === "string"
          ? new ObjectId(params.targetUserId)
          : params.targetUserId;
    }

    if (params.targetId) {
      log.targetId =
        typeof params.targetId === "string"
          ? new ObjectId(params.targetId)
          : params.targetId;
    }

    if (params.field) log.field = params.field;
    if (params.before !== undefined) log.before = params.before;
    if (params.after !== undefined) log.after = params.after;
    if (params.metadata) log.metadata = params.metadata;

    await db.collection("audit_logs").insertOne(log);
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw error to avoid breaking the main operation
  }
}

export async function getAuditLogs(filters: {
  type?: AuditLogType;
  actorId?: string;
  targetUserId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const db = await getDatabase();
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.type) query.type = filters.type;
    if (filters.actorId) query.actorId = new ObjectId(filters.actorId);
    if (filters.targetUserId) query.targetUserId = new ObjectId(filters.targetUserId);

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    if (filters.search) {
      query.description = { $regex: filters.search, $options: "i" };
    }

    const [logs, total] = await Promise.all([
      db
        .collection("audit_logs")
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("audit_logs").countDocuments(query),
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  } catch (error) {
    console.error("Failed to get audit logs:", error);
    throw error;
  }
}

export async function getUserAuditLogs(userId: string, limit = 20) {
  try {
    const db = await getDatabase();

    const logs = await db
      .collection("audit_logs")
      .find({
        $or: [{ actorId: new ObjectId(userId) }, { targetUserId: new ObjectId(userId) }],
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return logs;
  } catch (error) {
    console.error("Failed to get user audit logs:", error);
    throw error;
  }
}

// Rollback helper - returns data needed for rollback
export async function getAuditLogForRollback(logId: string) {
  try {
    const db = await getDatabase();

    const log = await db
      .collection("audit_logs")
      .findOne({ _id: new ObjectId(logId) });

    if (!log) throw new Error("Audit log not found");

    return log;
  } catch (error) {
    console.error("Failed to get audit log for rollback:", error);
    throw error;
  }
}
