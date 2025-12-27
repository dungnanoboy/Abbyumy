export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  author: User;
  prepTime: number; // phút
  cookTime: number; // phút
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Ingredient[];
  steps: Step[];
  category: string[];
  tags: string[];
  likes: number;
  views: number;
  cooksnaps: number; // Số người đã làm theo
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit?: string;
}

export interface Step {
  id: string;
  order: number;
  instruction: string;
  image?: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  recipeCount?: number;
  role?: 'admin' | 'user' | 'seller' | 'creator';
  followers?: string[];
  following?: string[];
  shop?: {
    isActive?: boolean;
    shopName?: string | null;
    description?: string | null;
    products?: any[];
  };
  stats?: {
    totalFollowers?: number;
    totalFollowing?: number;
    totalLikes?: number;
    totalViews?: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}
