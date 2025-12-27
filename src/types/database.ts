import { ObjectId } from 'mongodb';

export interface UserDocument {
  _id?: ObjectId;
  id?: string; // For legacy data
  name: string;
  email: string;
  password: string; // Should be hashed in production
  avatar?: string;
  bio?: string;
  recipeCount?: number;
  role?: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeDocument {
  _id?: ObjectId;
  title: string;
  description: string;
  image: string;
  authorId: ObjectId;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Array<{
    name: string;
    amount: string;
    unit?: string;
  }>;
  steps: Array<{
    order: number;
    instruction: string;
    image?: string;
  }>;
  category: string[];
  tags: string[];
  likes: number;
  views: number;
  cooksnaps: number;
  createdAt: Date;
  updatedAt: Date;
}
