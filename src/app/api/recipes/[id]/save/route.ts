import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await request.json();

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid recipe ID' },
        { status: 400 }
      );
    }

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if recipe exists
    const recipe = await db.collection('recipes').findOne({
      _id: new ObjectId(id),
    });

    if (!recipe) {
      return NextResponse.json(
        { success: false, message: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Check if user exists
    const user = await db.collection('users').findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already saved this recipe
    const savedRecipes = (user as any).savedRecipes || [];
    const hasSaved = savedRecipes.some((recipeId: ObjectId) => recipeId.toString() === id);

    let updateResult;
    if (hasSaved) {
      // Unsave: remove recipe from savedRecipes
      updateResult = await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $pull: { savedRecipes: new ObjectId(id) } as any,
        }
      );
    } else {
      // Save: add recipe to savedRecipes
      updateResult = await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $addToSet: { savedRecipes: new ObjectId(id) } as any,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: hasSaved ? 'Đã bỏ lưu công thức' : 'Đã lưu công thức',
      isSaved: !hasSaved,
    });
  } catch (error) {
    console.error('Error toggling save:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to toggle save',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
