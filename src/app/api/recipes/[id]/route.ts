import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { RecipeDocument } from '@/types/database';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid recipe ID' },
        { status: 400 }
      );
    }

    const recipe = await db
      .collection<RecipeDocument>('recipes')
      .findOne({ _id: new ObjectId(id) });

    if (!recipe) {
      return NextResponse.json(
        { success: false, message: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Increment views
    await db
      .collection<RecipeDocument>('recipes')
      .updateOne({ _id: new ObjectId(id) }, { $inc: { views: 1 } });

    // Get author info
    const author = await db.collection('users').findOne(
      { _id: recipe.authorId },
      { projection: { password: 0 } }
    );

    // Extract ingredients from strIngredient1-20 and strMeasure1-20
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = (recipe as any)[`strIngredient${i}`];
      const measure = (recipe as any)[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          id: i.toString(),
          name: ingredient,
          amount: measure || '',
          unit: '',
        });
      }
    }

    // Split instructions into steps
    const strInstructions = (recipe as any).strInstructions;
    const steps = strInstructions
      ?.split(/\r?\n/)
      .filter((step: string) => step.trim())
      .map((instruction: string, index: number) => ({
        id: index.toString(),
        order: index + 1,
        instruction,
        image: undefined,
      })) || [];

    const formattedRecipe = {
      id: recipe._id?.toString(),
      _id: recipe._id?.toString(),
      title: (recipe as any).strMeal || 'Untitled Recipe',
      description: (recipe as any).strCategory || '',
      image: (recipe as any).strMealThumb || '',
      strYoutube: (recipe as any).strYoutube || '',
      author: {
        id: author?._id?.toString() || recipe.authorId?.toString() || '',
        name: author?.name || 'Unknown',
        avatar: author?.avatar || '',
        bio: author?.bio,
        recipeCount: author?.recipeCount,
        followers: ((author as any)?.followers || []).map((id: ObjectId) => id.toString()),
        stats: (author as any)?.stats || { totalFollowers: 0 },
      },
      prepTime: recipe.prepTime || 0,
      cookTime: recipe.cookTime || 0,
      servings: recipe.servings || 4,
      difficulty: recipe.difficulty || 'medium',
      ingredients,
      steps,
      category: [(recipe as any).strCategory || 'Uncategorized'],
      tags: (recipe as any).strTags?.split(',').map((tag: string) => tag.trim()) || [],
      likes: recipe.likes || 0,
      views: recipe.views + 1, // Include the incremented view
      cooksnaps: recipe.cooksnaps || 0,
      likedBy: (recipe as any).likedBy || [],
      savedBy: (recipe as any).savedBy || [],
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    };

    return NextResponse.json({
      success: true,
      recipe: formattedRecipe,
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch recipe',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updateData = await request.json();

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'ID không hợp lệ' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Prepare update object
    const updateFields: any = {
      updatedAt: new Date(),
    };

    // Map fields
    if (updateData.strMeal) updateFields.strMeal = updateData.strMeal;
    if (updateData.strCategory) updateFields.strCategory = updateData.strCategory;
    if (updateData.strArea) updateFields.strArea = updateData.strArea;
    if (updateData.strInstructions) updateFields.strInstructions = updateData.strInstructions;
    if (updateData.strMealThumb) updateFields.strMealThumb = updateData.strMealThumb;
    if (updateData.strYoutube) updateFields.strYoutube = updateData.strYoutube;
    
    // Handle ingredients (strIngredient1-20 and strMeasure1-20)
    for (let i = 1; i <= 20; i++) {
      const ingredientKey = `strIngredient${i}`;
      const measureKey = `strMeasure${i}`;
      
      if (updateData[ingredientKey] !== undefined) {
        updateFields[ingredientKey] = updateData[ingredientKey];
      }
      if (updateData[measureKey] !== undefined) {
        updateFields[measureKey] = updateData[measureKey];
      }
    }

    const result = await db.collection('recipes').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy công thức' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật công thức thành công',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update recipe',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'ID không hợp lệ' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Get recipe data before deleting to clean up image
    const recipe = await db.collection('recipes').findOne({
      _id: new ObjectId(id),
    });

    if (!recipe) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy công thức' },
        { status: 404 }
      );
    }

    // Delete recipe from database
    const result = await db.collection('recipes').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy công thức' },
        { status: 404 }
      );
    }

    // Try to delete associated image file if it's from uploads directory
    const imageUrl = (recipe as any).strMealThumb;
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
      try {
        const { unlink } = await import('fs/promises');
        const { existsSync } = await import('fs');
        const path = await import('path');
        
        const absolutePath = path.join(process.cwd(), 'public', imageUrl);
        if (existsSync(absolutePath)) {
          await unlink(absolutePath);
        }
      } catch (fileError) {
        console.warn('Failed to delete recipe image:', fileError);
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa công thức thành công',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete recipe',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
