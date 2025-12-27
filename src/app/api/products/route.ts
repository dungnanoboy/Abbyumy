import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;
    const showAll = searchParams.get("showAll") === "true"; // For admin

    // Build query
    const query: any = {};
    
    // Only filter by active status if not admin view
    if (!showAll) {
      query.status = "active";
    }
    
    if (category && category !== "all") {
      query.category = category;
    }

    // Fetch products
    const products = await db
      .collection("products")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count
    const totalCount = await db.collection("products").countDocuments(query);

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
      variants: product.variants || [],
      recipeId: product.recipeId?.toString() || null,
      sellerId: product.sellerId?.toString(),
      sku: product.sku,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDatabase();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["title", "price", "stock", "category", "sku"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Prepare product data
    const productData = {
      title: body.title,
      description: body.description || "",
      price: parseFloat(body.price),
      currency: body.currency || "VND",
      images: body.images || [],
      stock: parseInt(body.stock),
      status: body.status || "active",
      category: body.category,
      tags: body.tags || [],
      sku: body.sku,
      variants: body.variants || [],
      rating: 0,
      reviewCount: 0,
      sellerId: body.sellerId ? new ObjectId(body.sellerId) : new ObjectId(),
      recipeId: body.recipeId ? new ObjectId(body.recipeId) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert product
    const result = await db.collection("products").insertOne(productData);

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      productId: result.insertedId.toString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
