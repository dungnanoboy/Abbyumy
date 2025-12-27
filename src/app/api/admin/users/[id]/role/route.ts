import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { createAuditLog } from '@/lib/auditLog';

// PATCH - Update user's role
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { role, actorId } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'ID không hợp lệ' },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin role' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if role exists in roles_permissions
    const roleExists = await db
      .collection('roles_permissions')
      .findOne({ role: role.toLowerCase() });

    if (!roleExists) {
      return NextResponse.json(
        { success: false, message: 'Role không tồn tại trong hệ thống' },
        { status: 400 }
      );
    }

    // Get current user data for audit log
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    const oldRole = currentUser.role || 'user';

    // Update user's role
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          role: role.toLowerCase(),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Create audit log
    if (actorId) {
      await createAuditLog({
        type: 'role_change',
        actorId,
        targetUserId: id,
        action: 'CHANGE_ROLE',
        field: 'role',
        before: oldRole,
        after: role.toLowerCase(),
        description: `Thay đổi vai trò của ${currentUser.name || currentUser.email} từ "${oldRole}" sang "${role.toLowerCase()}"`,
        metadata: {
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật role thành công',
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật role' },
      { status: 500 }
    );
  }
}
