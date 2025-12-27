import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Lấy danh sách người dùng mà user hiện tại đã follow (để bắt đầu trò chuyện)
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();

    // Lấy thông tin user hiện tại với danh sách following
    const currentUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { following: 1 } }
    );

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const following = (currentUser as any).following || [];

    if (following.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Lấy thông tin chi tiết của những người đã follow
    const followingUsers = await db
      .collection('users')
      .find(
        { _id: { $in: following } },
        { 
          projection: { 
            _id: 1,
            username: 1,
            email: 1,
            name: 1,
            avatar: 1,
            role: 1,
            isOnline: 1,
            lastSeen: 1
          } 
        }
      )
      .toArray();

    // Format data
    const formattedUsers = followingUsers.map((user: any) => ({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      name: user.name || user.username,
      avatar: user.avatar || null,
      role: user.role,
      isOnline: user.isOnline || false,
      lastSeen: user.lastSeen || null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedUsers,
    });
  } catch (error) {
    console.error('Error fetching following users:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
