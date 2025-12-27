import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST to follow/unfollow a user
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ID của người được follow
    const { userId } = await request.json(); // ID của người thực hiện follow

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid target user ID' },
        { status: 400 }
      );
    }

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Không thể follow chính mình
    if (id === userId) {
      return NextResponse.json(
        { success: false, message: 'Không thể theo dõi chính mình' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Get current user (người thực hiện follow)
    const currentUser = await db.collection('users').findOne({
      _id: new ObjectId(userId),
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get target user (người được follow)
    const targetUser = await db.collection('users').findOne({
      _id: new ObjectId(id),
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'Target user not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const following = ((currentUser as any).following || []).map((id: ObjectId) => id.toString());
    const isFollowing = following.includes(id);

    if (isFollowing) {
      // Unfollow
      // Xóa targetId khỏi following của currentUser
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { following: new ObjectId(id) } as any }
      );

      // Xóa currentUserId khỏi followers của targetUser
      await db.collection('users').updateOne(
        { _id: new ObjectId(id) },
        { 
          $pull: { followers: new ObjectId(userId) } as any,
          $inc: { 'stats.totalFollowers': -1 }
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Đã bỏ theo dõi',
        isFollowing: false,
      });
    } else {
      // Follow
      // Thêm targetId vào following của currentUser
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { following: new ObjectId(id) } as any }
      );

      // Thêm currentUserId vào followers của targetUser
      await db.collection('users').updateOne(
        { _id: new ObjectId(id) },
        { 
          $addToSet: { followers: new ObjectId(userId) } as any,
          $inc: { 'stats.totalFollowers': 1 }
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Đã theo dõi',
        isFollowing: true,
      });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to toggle follow',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
