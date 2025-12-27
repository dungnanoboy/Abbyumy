import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * Manual payment status update for testing
 * This simulates IPN callback when testing on localhost
 * DELETE THIS IN PRODUCTION!
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status = "paid" } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Update order payment status
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          paymentStatus: status,
          // Keep status as pending - seller needs to confirm order separately
          // Payment success doesn't mean order is automatically confirmed
          paymentDetails: {
            manual: true,
            updatedAt: new Date(),
          },
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Log to audit
    await db.collection("audit_logs").insertOne({
      action: "manual_payment_update",
      orderId: orderId,
      details: {
        status,
        method: "VNPAY",
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Payment status updated",
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}
