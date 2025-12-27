import Link from "next/link";
import Image from "next/image";
import { Recipe } from "@/types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden cursor-pointer">
        {/* Recipe Image */}
        <div className="relative h-48 w-full bg-gray-200">
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Recipe Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 mb-2">
            {recipe.title}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {recipe.description}
          </p>

          {/* Author */}
          <div className="flex items-center gap-2 mb-3">
            {recipe.author.avatar ? (
              <Image
                src={recipe.author.avatar}
                alt={recipe.author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center">
                <span className="text-xs text-orange-600">
                  {recipe.author.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-600">{recipe.author.name}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              ❤️ {recipe.likes}
            </span>
            <span className="flex items-center gap-1">
              👁️ {recipe.views}
            </span>
            <span className="flex items-center gap-1">
              📸 {recipe.cooksnaps}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
