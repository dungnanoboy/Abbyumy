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

    if (!userId) {
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

    // Check if user already liked this recipe
    const likedBy = (recipe as any).likedBy || [];
    const hasLiked = likedBy.includes(userId);

    let updateResult;
    if (hasLiked) {
      // Unlike: remove user from likedBy and decrement likes
      updateResult = await db.collection('recipes').updateOne(
        { _id: new ObjectId(id) },
        {
          $pull: { likedBy: userId },
          $inc: { likes: -1 },
        }
      );
    } else {
      // Like: add user to likedBy and increment likes
      updateResult = await db.collection('recipes').updateOne(
        { _id: new ObjectId(id) },
        {
          $addToSet: { likedBy: userId },
          $inc: { likes: 1 },
        }
      );
    }

    // Get updated recipe
    const updatedRecipe = await db.collection('recipes').findOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({
      success: true,
      message: hasLiked ? 'Đã bỏ thích' : 'Đã thích',
      isLiked: !hasLiked,
      likes: (updatedRecipe as any).likes || 0,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to toggle like',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
