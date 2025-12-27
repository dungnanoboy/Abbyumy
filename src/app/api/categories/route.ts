import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Fetch all recipes to extract unique categories
    const recipes = await db.collection('recipes').find({}).toArray();
    
    // Extract unique categories with counts
    const categoryMap = new Map<string, { name: string; count: number }>();
    
    recipes.forEach((recipe: any) => {
      const categoryName = recipe.strCategory;
      
      if (categoryName && categoryName !== 'Uncategorized' && categoryName.trim()) {
        if (categoryMap.has(categoryName)) {
          const existing = categoryMap.get(categoryName)!;
          categoryMap.set(categoryName, {
            ...existing,
            count: existing.count + 1,
          });
        } else {
          categoryMap.set(categoryName, {
            name: categoryName,
            count: 1,
          });
        }
      }
    });
    
    // Convert to array format
    const categories = Array.from(categoryMap.entries()).map(([name, data]) => ({
      name: data.name,
      recipeCount: data.count,
    }));
    
    return NextResponse.json({
      success: true,
      categories: categories.sort((a, b) => a.name.localeCompare(b.name)),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch categories',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Tên danh mục không được để trống!' },
        { status: 400 }
      );
    }
    
    const db = await getDatabase();
    
    // Check if category already exists
    const existingRecipe = await db.collection('recipes').findOne({
      strCategory: name.trim(),
    });
    
    if (existingRecipe) {
      return NextResponse.json(
        { success: false, message: 'Danh mục này đã tồn tại!' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Danh mục mới đã được tạo. Bạn có thể gán cho các công thức.',
      category: { name: name.trim() },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create category',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
