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

    // Fetch recipes by this user
    const recipes = await db
      .collection("recipes")
      .find({ authorId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    // Format recipes
    const formattedRecipes = recipes.map((recipe) => ({
      _id: recipe._id.toString(),
      strMeal: recipe.strMeal,
      strMealThumb: recipe.strMealThumb,
      strCategory: recipe.strCategory,
      strArea: recipe.strArea,
      likes: recipe.likes || 0,
      views: recipe.views || 0,
      cooksnaps: recipe.cooksnaps || 0,
      createdAt: recipe.createdAt,
      authorId: recipe.authorId?.toString(),
      authorName: recipe.authorName,
    }));

    return NextResponse.json({
      success: true,
      recipes: formattedRecipes,
    });
  } catch (error) {
    console.error("Error fetching user recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}
