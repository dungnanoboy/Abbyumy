import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

interface RouteParams {
  params: Promise<{
    name: string;
  }>;
}

export async function PUT(request: Request, context: RouteParams) {
  try {
    const { name } = await context.params;
    const { newName } = await request.json();
    
    if (!newName || !newName.trim()) {
      return NextResponse.json(
        { success: false, message: 'Tên danh mục mới không được để trống!' },
        { status: 400 }
      );
    }
    
    const oldName = decodeURIComponent(name);
    const db = await getDatabase();
    
    // Check if new category name already exists
    if (oldName !== newName.trim()) {
      const existing = await db.collection('recipes').findOne({
        strCategory: newName.trim(),
      });
      
      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Tên danh mục mới đã tồn tại!' },
          { status: 400 }
        );
      }
    }
    
    // Update all recipes with this category
    const result = await db.collection('recipes').updateMany(
      { strCategory: oldName },
      { 
        $set: { 
          strCategory: newName.trim(),
          updatedAt: new Date(),
        } 
      }
    );
    
    return NextResponse.json({
      success: true,
      message: `Đã cập nhật ${result.modifiedCount} công thức`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update category',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteParams) {
  try {
    const { name } = await context.params;
    const categoryName = decodeURIComponent(name);
    const db = await getDatabase();
    
    // Option 1: Set to "Uncategorized" instead of deleting recipes
    const result = await db.collection('recipes').updateMany(
      { strCategory: categoryName },
      { 
        $set: { 
          strCategory: 'Uncategorized',
          updatedAt: new Date(),
        } 
      }
    );
    
    // Option 2: Delete all recipes with this category (commented out)
    // const result = await db.collection('recipes').deleteMany({
    //   strCategory: categoryName,
    // });
    
    return NextResponse.json({
      success: true,
      message: `Đã chuyển ${result.modifiedCount} công thức sang danh mục "Uncategorized"`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete category',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
