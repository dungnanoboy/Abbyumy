import RecipeCard from "@/components/shared/RecipeCard";

async function getRecipes() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/recipes`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch recipes');
    }
    
    const data = await res.json();
    return data.recipes || [];
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
}

export default async function RecipesPage() {
  const recipes = await getRecipes();
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Tất Cả Công Thức
        </h1>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option>Tất cả danh mục</option>
              <option>Món chính</option>
              <option>Khai vị</option>
              <option>Tráng miệng</option>
            </select>
            
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option>Độ khó</option>
              <option>Dễ</option>
              <option>Trung bình</option>
              <option>Khó</option>
            </select>

            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option>Sắp xếp: Mới nhất</option>
              <option>Phổ biến nhất</option>
              <option>Nhiều lượt xem</option>
            </select>
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <div className="col-span-4 text-center py-12">
              <p className="text-gray-500 text-lg">
                Chưa có công thức nào. Hãy đăng công thức đầu tiên! 🍳
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
