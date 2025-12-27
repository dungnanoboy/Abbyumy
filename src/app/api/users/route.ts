import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { UserDocument } from '@/types/database';

export async function GET() {
  try {
    const db = await getDatabase();
    const users = await db
      .collection<UserDocument>('users')
      .find({})
      .project({ password: 0 }) // Don't return passwords
      .toArray();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
