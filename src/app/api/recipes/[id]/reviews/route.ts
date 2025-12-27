import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all reviews for a recipe
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid recipe ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Get all comments for this recipe
    const reviews = await db
      .collection('comments')
      .find({ 
        targetType: 'recipe',
        targetId: new ObjectId(id),
        parentId: null, // Only get top-level comments
        status: 'active'
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Get user info for each review
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await db.collection('users').findOne(
          { _id: review.userId },
          { projection: { password: 0 } }
        );

        // Get replies for this comment
        const replies = await db
          .collection('comments')
          .find({ 
            parentId: review._id,
            status: 'active'
          })
          .sort({ createdAt: 1 })
          .toArray();

        // Get user info for each reply
        const repliesWithUsers = await Promise.all(
          replies.map(async (reply) => {
            const replyUser = await db.collection('users').findOne(
              { _id: reply.userId },
              { projection: { password: 0 } }
            );

            return {
              _id: reply._id?.toString(),
              content: reply.content,
              likes: (reply.likes || []).map((id: ObjectId) => id.toString()),
              createdAt: reply.createdAt,
              updatedAt: reply.updatedAt,
              author: {
                id: replyUser?._id?.toString() || '',
                name: replyUser?.name || 'Unknown',
                avatar: replyUser?.avatar || '',
              },
            };
          })
        );

        return {
          _id: review._id?.toString(),
          content: review.content,
          likes: (review.likes || []).map((id: ObjectId) => id.toString()),
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          author: {
            id: user?._id?.toString() || '',
            name: user?.name || 'Unknown',
            avatar: user?.avatar || '',
          },
          replies: repliesWithUsers,
        };
      })
    );

    return NextResponse.json({
      success: true,
      reviews: reviewsWithUsers,
      total: reviewsWithUsers.length,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch reviews',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST a new review
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, content, parentId } = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid recipe ID' },
        { status: 400 }
      );
    }

    if (!userId || !content) {
      return NextResponse.json(
        { success: false, message: 'User ID and content are required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Create new comment
    const newComment = {
      targetType: 'recipe',
      targetId: new ObjectId(id),
      userId: new ObjectId(userId),
      parentId: parentId ? new ObjectId(parentId) : null,
      content,
      likes: [],
      mentions: [],
      repliesCount: 0,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('comments').insertOne(newComment);

    // If this is a reply, increment parent's repliesCount
    if (parentId && ObjectId.isValid(parentId)) {
      await db.collection('comments').updateOne(
        { _id: new ObjectId(parentId) },
        { $inc: { repliesCount: 1 } }
      );
    }

    // Get user info
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    return NextResponse.json({
      success: true,
      message: 'Comment posted successfully',
      review: {
        _id: result.insertedId.toString(),
        content: newComment.content,
        likes: [],
        createdAt: newComment.createdAt,
        updatedAt: newComment.updatedAt,
        author: {
          id: user?._id?.toString() || '',
          name: user?.name || 'Unknown',
          avatar: user?.avatar || '',
        },
        replies: [],
      },
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to post comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
