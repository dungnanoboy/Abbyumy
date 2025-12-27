import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all roles
export async function GET(request: Request) {
  try {
    const db = await getDatabase();
    const roles = await db
      .collection('roles_permissions')
      .find({})
      .sort({ role: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      roles: roles.map(r => ({
        ...r,
        _id: r._id?.toString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải danh sách roles' },
      { status: 500 }
    );
  }
}

// POST create new role
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, description, permissions } = body;

    // Validate
    if (!role || !description || !Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if role already exists
    const existingRole = await db
      .collection('roles_permissions')
      .findOne({ role: role.toLowerCase() });

    if (existingRole) {
      return NextResponse.json(
        { success: false, message: 'Role đã tồn tại' },
        { status: 400 }
      );
    }

    // Create new role
    const newRole = {
      role: role.toLowerCase(),
      description,
      permissions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('roles_permissions').insertOne(newRole);

    return NextResponse.json({
      success: true,
      message: 'Tạo role thành công',
      role: {
        ...newRole,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tạo role' },
      { status: 500 }
    );
  }
}
