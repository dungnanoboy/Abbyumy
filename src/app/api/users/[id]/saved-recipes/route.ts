import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Get user with saved recipes
    const user = await db.collection('users').findOne({
      _id: new ObjectId(id),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const savedRecipeIds = (user as any).savedRecipes || [];

    if (savedRecipeIds.length === 0) {
      return NextResponse.json({
        success: true,
        recipes: [],
      });
    }

    // Fetch all saved recipes
    const recipes = await db.collection('recipes')
      .find({
        _id: { $in: savedRecipeIds.map((id: any) => new ObjectId(id)) }
      })
      .toArray();

    return NextResponse.json({
      success: true,
      recipes: recipes.map(recipe => ({
        _id: recipe._id?.toString(),
        strMeal: (recipe as any).strMeal,
        strMealThumb: (recipe as any).strMealThumb,
        strCategory: (recipe as any).strCategory,
        likes: (recipe as any).likes || 0,
        views: (recipe as any).views || 0,
        cooksnaps: (recipe as any).cooksnaps || 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch saved recipes',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
