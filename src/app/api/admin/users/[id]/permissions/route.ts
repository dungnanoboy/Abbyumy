import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { createAuditLog } from '@/lib/auditLog';

// PATCH - Update user's custom permissions
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { customPermissions, actorId } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'ID không hợp lệ' },
        { status: 400 }
      );
    }

    if (!Array.isArray(customPermissions)) {
      return NextResponse.json(
        { success: false, message: 'customPermissions phải là array' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Get current user data for audit log
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    const oldPermissions = currentUser.customPermissions || [];

    // Update user's custom permissions
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          customPermissions,
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
      const addedPerms = customPermissions.filter((p: string) => !oldPermissions.includes(p));
      const removedPerms = oldPermissions.filter((p: string) => !customPermissions.includes(p));
      
      let description = `Cập nhật quyền cá nhân cho ${currentUser.name || currentUser.email}`;
      if (addedPerms.length > 0) {
        description += ` | Thêm: ${addedPerms.join(', ')}`;
      }
      if (removedPerms.length > 0) {
        description += ` | Xóa: ${removedPerms.join(', ')}`;
      }

      await createAuditLog({
        type: 'permission_change',
        actorId,
        targetUserId: id,
        action: 'UPDATE',
        field: 'customPermissions',
        before: oldPermissions,
        after: customPermissions,
        description,
        metadata: {
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật quyền cá nhân thành công',
    });
  } catch (error) {
    console.error('Error updating custom permissions:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật quyền' },
      { status: 500 }
    );
  }
}
