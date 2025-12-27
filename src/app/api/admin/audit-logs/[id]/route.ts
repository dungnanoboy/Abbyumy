import { NextResponse } from "next/server";
import { getAuditLogForRollback } from "@/lib/auditLog";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const log = await getAuditLogForRollback(id);

    return NextResponse.json(log);
  } catch (error) {
    console.error("Error fetching audit log:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit log" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { actorId } = body;

    if (!actorId) {
      return NextResponse.json(
        { error: "Actor ID is required" },
        { status: 400 }
      );
    }

    const log = await getAuditLogForRollback(id);

    if (!log.before || !log.targetUserId) {
      return NextResponse.json(
        { error: "Cannot rollback this action" },
        { status: 400 }
      );
    }

    // Check if already rolled back
    if (log.isRolledBack) {
      return NextResponse.json(
        { error: "This action has already been rolled back" },
        { status: 400 }
      );
    }

    // Check if log is too old (> 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    if (log.createdAt < sevenDaysAgo) {
      return NextResponse.json(
        { error: "Cannot rollback actions older than 7 days" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Perform rollback based on log type
    switch (log.type) {
      case "permission_change":
        await db
          .collection("users")
          .updateOne(
            { _id: new ObjectId(log.targetUserId) },
            { $set: { customPermissions: log.before } }
          );
        break;

      case "role_change":
        await db
          .collection("users")
          .updateOne(
            { _id: new ObjectId(log.targetUserId) },
            { $set: { role: log.before } }
          );
        break;

      default:
        return NextResponse.json(
          { error: `Rollback not supported for type: ${log.type}` },
          { status: 400 }
        );
    }

    // Mark the original log as rolled back
    await db
      .collection("audit_logs")
      .updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            isRolledBack: true,
            rolledBackBy: new ObjectId(actorId),
            rolledBackAt: new Date(),
          },
        }
      );

    return NextResponse.json({
      success: true,
      message: "Rollback successful",
    });
  } catch (error) {
    console.error("Error rolling back:", error);
    return NextResponse.json(
      { error: "Failed to rollback" },
      { status: 500 }
    );
  }
}
