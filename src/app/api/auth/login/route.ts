import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { UserDocument } from '@/types/database';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email và mật khẩu là bắt buộc',
        },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDatabase();
    const user = await db
      .collection<UserDocument>('users')
      .findOne({ email: email.toLowerCase() });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email hoặc mật khẩu không đúng!',
        },
        { status: 401 }
      );
    }

    // Check password (in production, use bcrypt.compare)
    if (user.password !== password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email hoặc mật khẩu không đúng!',
        },
        { status: 401 }
      );
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: {
        ...userWithoutPassword,
        _id: user._id?.toString(),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
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
