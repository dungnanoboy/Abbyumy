import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { RecipeDocument } from '@/types/database';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '0');
    const sort = searchParams.get('sort') || 'createdAt';
    
    const db = await getDatabase();
    
    // Build sort object
    const sortObj: any = {};
    if (sort === 'views') {
      sortObj.views = -1;
    } else if (sort === 'likes') {
      sortObj.likes = -1;
    } else {
      sortObj.createdAt = -1;
    }
    
    let query = db
      .collection<RecipeDocument>('recipes')
      .find({})
      .sort(sortObj);
    
    // Apply limit if specified
    if (limit > 0) {
      query = query.limit(limit);
    }
    
    const recipesData = await query.toArray();

    // Transform MongoDB documents to frontend format
    const recipes = await Promise.all(
      recipesData.map(async (recipe) => {
        // Get author info
        const author = await db.collection('users').findOne(
          { _id: recipe.authorId },
          { projection: { password: 0 } }
        );

        // Count comments for this recipe
        const commentsCount = await db.collection('comments').countDocuments({
          targetType: 'recipe',
          targetId: recipe._id,
          status: 'active',
        });

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

        return {
          _id: recipe._id?.toString(),
          id: recipe._id?.toString(),
          title: (recipe as any).strMeal || 'Untitled Recipe',
          strMeal: (recipe as any).strMeal || 'Untitled Recipe',
          description: (recipe as any).strCategory || '',
          image: (recipe as any).strMealThumb || '',
          strMealThumb: (recipe as any).strMealThumb || '',
          strCategory: (recipe as any).strCategory || '', // Keep original field
          author: {
            id: author?._id?.toString() || recipe.authorId?.toString() || '',
            name: author?.name || 'Unknown',
            avatar: author?.avatar || '',
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
          views: recipe.views || 0,
          cooksnaps: recipe.cooksnaps || 0,
          commentsCount,
          createdAt: recipe.createdAt,
          updatedAt: recipe.updatedAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      recipes,
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch recipes',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDatabase();
    const data = await request.json();

    // Get userId from authentication header
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - User not logged in',
        },
        { status: 401 }
      );
    }

    // Validate userId is a valid ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid user ID',
        },
        { status: 400 }
      );
    }

    // Prepare recipe document
    const recipe: any = {
      strMeal: data.strMeal || data.title,
      strCategory: data.strCategory || 'Uncategorized',
      strArea: data.strArea || 'Vietnamese',
      strInstructions: data.strInstructions || '',
      strMealThumb: data.strMealThumb || data.image || '',
      strYoutube: data.strYoutube || '',
      authorId: new ObjectId(userId),
      prepTime: data.prepTime || 0,
      cookTime: data.cookTime || 0,
      servings: data.servings || 4,
      difficulty: data.difficulty || 'medium',
      likes: 0,
      views: 0,
      cooksnaps: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Handle ingredients (strIngredient1-20 and strMeasure1-20)
    for (let i = 1; i <= 20; i++) {
      const ingredientKey = `strIngredient${i}`;
      const measureKey = `strMeasure${i}`;
      
      recipe[ingredientKey] = data[ingredientKey] || '';
      recipe[measureKey] = data[measureKey] || '';
    }

    const result = await db.collection('recipes').insertOne(recipe);

    return NextResponse.json({
      success: true,
      recipeId: result.insertedId.toString(),
      message: 'Tạo công thức thành công',
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create recipe',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
