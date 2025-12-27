import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST to like/unlike a comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const { userId } = await request.json();

    if (!ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid comment ID' },
        { status: 400 }
      );
    }

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Get comment
    const comment = await db.collection('comments').findOne({
      _id: new ObjectId(commentId),
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }

    const likes = (comment.likes || []).map((id: ObjectId) => id.toString());
    const hasLiked = likes.includes(userId);

    let updateResult;
    if (hasLiked) {
      // Unlike
      updateResult = await db.collection('comments').updateOne(
        { _id: new ObjectId(commentId) },
        {
          $pull: { likes: new ObjectId(userId) } as any,
        }
      );
    } else {
      // Like
      updateResult = await db.collection('comments').updateOne(
        { _id: new ObjectId(commentId) },
        {
          $addToSet: { likes: new ObjectId(userId) } as any,
        }
      );
    }

    // Get updated comment
    const updatedComment = await db.collection('comments').findOne({
      _id: new ObjectId(commentId),
    });

    return NextResponse.json({
      success: true,
      message: hasLiked ? 'Unliked comment' : 'Liked comment',
      isLiked: !hasLiked,
      likesCount: (updatedComment?.likes || []).length,
    });
  } catch (error) {
    console.error('Error toggling comment like:', error);
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
