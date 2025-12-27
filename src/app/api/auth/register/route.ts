import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { UserDocument } from '@/types/database';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Tên, email và mật khẩu là bắt buộc',
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'Mật khẩu phải có ít nhất 6 ký tự!',
        },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDatabase();
    
    // Check if email already exists
    const existingUser = await db
      .collection<UserDocument>('users')
      .findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email này đã được đăng ký!',
        },
        { status: 409 }
      );
    }

    // Create new user
    const newUser: UserDocument = {
      name,
      email: email.toLowerCase(),
      password, // In production, hash with bcrypt
      avatar: '',
      bio: '',
      recipeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<UserDocument>('users').insertOne(newUser);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công!',
      user: {
        ...userWithoutPassword,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
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
