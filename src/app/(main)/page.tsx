import RecipeCard from "@/components/shared/RecipeCard";

async function getRecipes() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/recipes?limit=8&sort=views`, {
      cache: 'no-store', // Always get fresh data
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

export default async function Home() {
  const recipes = await getRecipes();
  const trendingKeywords = ["phở", "bánh", "thịt", "cơm", "bún", "gỏi"];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-12 text-white mb-8">
          <h1 className="text-4xl font-bold mb-4">Chào mừng đến với Abbyumy!</h1>
          <p className="text-xl mb-6">
            Khám phá hàng ngàn công thức nấu ăn ngon từ cộng đồng
          </p>
          <button className="bg-white text-orange-500 px-8 py-3 rounded-full font-semibold hover:bg-orange-50 transition-colors">
            Khám phá ngay
          </button>
        </section>

        {/* Trending Keywords */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🔥 Từ Khóa Thịnh Hành
          </h2>
          <div className="flex flex-wrap gap-3">
            {trendingKeywords.map((keyword) => (
              <a
                key={keyword}
                href={`/search?q=${keyword}`}
                className="bg-white px-6 py-2 rounded-full text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-colors shadow-sm"
              >
                {keyword}
              </a>
            ))}
          </div>
        </section>

        {/* Featured Recipes */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              ⭐ Công Thức Nổi Bật
            </h2>
            <a
              href="/recipes"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Xem tất cả →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </section>
      </div>
    </div>
  );
}
