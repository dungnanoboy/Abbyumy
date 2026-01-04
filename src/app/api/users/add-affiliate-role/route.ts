import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    let userId = request.headers.get('x-user-id')?.trim();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Không có thông tin người dùng' },
        { status: 401 }
      );
    }

    // Log for debugging
    console.log('Received userId:', userId, 'Type:', typeof userId);

    // Sometimes userId might be JSON stringified, try to parse
    let finalUserId = userId;
    try {
      const parsed = JSON.parse(userId);
      if (typeof parsed === 'object' && parsed._id) {
        finalUserId = parsed._id;
      }
    } catch {
      // Not JSON, use as is
    }

    console.log('Final userId:', finalUserId, 'Length:', finalUserId.length);

    // MongoDB ObjectId is exactly 24 hex characters
    if (finalUserId.length !== 24 || !ObjectId.isValid(finalUserId)) {
      console.error('Invalid ObjectId:', { userId: finalUserId, length: finalUserId.length, isValid: ObjectId.isValid(finalUserId) });
      return NextResponse.json(
        { success: false, message: 'ID người dùng không hợp lệ' },
        { status: 400 }
      );
    }

    // Use finalUserId for the rest of the function
    userId = finalUserId;

    const db = await getDatabase();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Get current roles
    const currentRoles = user.role ? user.role.split(',').map((r: string) => r.trim()) : [];
    
    // Check if already has affiliate role
    if (currentRoles.includes('affiliate')) {
      return NextResponse.json({
        success: true,
        message: 'Tài khoản đã có role affiliate',
        user: {
          ...user,
          _id: user._id.toString(),
        },
      });
    }

    // Add affiliate role
    const newRoles = [...currentRoles, 'affiliate'].join(', ');

    // Update user
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role: newRoles } }
    );

    // Get updated user
    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    return NextResponse.json({
      success: true,
      message: 'Đã cấp quyền affiliate thành công',
      user: {
        ...updatedUser,
        _id: updatedUser?._id.toString(),
      },
    });
  } catch (error) {
    console.error('Error adding affiliate role:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Có lỗi xảy ra khi cấp quyền affiliate',
      },
      { status: 500 }
    );
  }
}
