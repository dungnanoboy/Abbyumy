import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDatabase();
    const { id: userId } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Fetch products by this seller
    const products = await db
      .collection("products")
      .find({ sellerId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    // Format products
    const formattedProducts = products.map((product) => ({
      _id: product._id.toString(),
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency || "VND",
      images: product.images || [],
      stock: product.stock,
      status: product.status,
      category: product.category,
      tags: product.tags || [],
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      sku: product.sku,
      createdAt: product.createdAt,
    }));

    return NextResponse.json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Error fetching user products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
