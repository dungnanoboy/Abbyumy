import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single role
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
    const role = await db
      .collection('roles_permissions')
      .findOne({ _id: new ObjectId(id) });

    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy role' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      role: {
        ...role,
        _id: role._id?.toString(),
      },
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải role' },
      { status: 500 }
    );
  }
}

// PATCH update role
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'ID không hợp lệ' },
        { status: 400 }
      );
    }

    const { description, permissions } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (description !== undefined) updateData.description = description;
    if (permissions !== undefined) updateData.permissions = permissions;

    const db = await getDatabase();
    const result = await db
      .collection('roles_permissions')
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy role' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật role thành công',
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật role' },
      { status: 500 }
    );
  }
}

// DELETE role
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

    // Check if role is assigned to any users
    const role = await db
      .collection('roles_permissions')
      .findOne({ _id: new ObjectId(id) });

    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy role' },
        { status: 404 }
      );
    }

    // Prevent deleting system roles
    const systemRoles = ['admin', 'user', 'seller'];
    if (systemRoles.includes(role.role)) {
      return NextResponse.json(
        { success: false, message: 'Không thể xóa role hệ thống' },
        { status: 400 }
      );
    }

    const usersWithRole = await db
      .collection('users')
      .countDocuments({ role: role.role });

    if (usersWithRole > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Không thể xóa role. Có ${usersWithRole} người dùng đang sử dụng role này.`,
        },
        { status: 400 }
      );
    }

    const result = await db
      .collection('roles_permissions')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy role' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa role thành công',
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa role' },
      { status: 500 }
    );
  }
}
