import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { UserDocument } from '@/types/database';
import { ObjectId } from 'mongodb';

// GET single user
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'ID không hợp lệ' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const user = await db
      .collection<UserDocument>('users')
      .findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Convert savedRecipes ObjectIds to strings
    const formattedUser = {
      ...user,
      _id: user._id?.toString(),
      savedRecipes: ((user as any).savedRecipes || []).map((id: ObjectId) => id.toString()),
      followers: ((user as any).followers || []).map((id: ObjectId) => id.toString()),
      following: ((user as any).following || []).map((id: ObjectId) => id.toString()),
    };

    return NextResponse.json({
      success: true,
      user: formattedUser,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi máy chủ',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'ID không hợp lệ' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const db = await getDatabase();

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email.toLowerCase();
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.role) updateData.role = data.role;
    if (data.password) updateData.password = data.password; // TODO: Hash password

    const result = await db
      .collection<UserDocument>('users')
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật người dùng thành công',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi máy chủ',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'ID không hợp lệ' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Get user data before deleting to clean up avatar
    const user = await db.collection<UserDocument>('users').findOne({
      _id: new ObjectId(id),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Delete user from database
    const result = await db
      .collection<UserDocument>('users')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Try to delete associated avatar file if it's from uploads directory
    const avatarUrl = user.avatar;
    if (avatarUrl && avatarUrl.startsWith('/uploads/')) {
      try {
        const { unlink } = await import('fs/promises');
        const { existsSync } = await import('fs');
        const path = await import('path');
        
        const absolutePath = path.join(process.cwd(), 'public', avatarUrl);
        if (existsSync(absolutePath)) {
          await unlink(absolutePath);
        }
      } catch (fileError) {
        console.warn('Failed to delete user avatar:', fileError);
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa người dùng thành công',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi máy chủ',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
