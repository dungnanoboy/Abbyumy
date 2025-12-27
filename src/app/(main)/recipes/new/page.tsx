"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import FileUploader from "@/components/FileUploader";
import { authFetch } from "@/lib/authFetch";

export default function NewRecipePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Form state
  const [strMeal, setStrMeal] = useState("");
  const [strCategory, setStrCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [strArea, setStrArea] = useState("Vietnamese");
  const [strInstructions, setStrInstructions] = useState("");
  const [strMealThumb, setStrMealThumb] = useState("");
  const [strYoutube, setStrYoutube] = useState("");
  const [strTags, setStrTags] = useState("");
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(30);
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState("medium");
  
  const [ingredientCount, setIngredientCount] = useState(5);
  const [ingredients, setIngredients] = useState<Array<{ name: string; measure: string }>>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Fetch categories
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories.map((cat: any) => cat.name));
        }
      });

    // Initialize ingredients array
    const initialIngredients = Array.from({ length: 20 }, () => ({
      name: "",
      measure: "",
    }));
    setIngredients(initialIngredients);
  }, []);

  const handleIngredientChange = (
    index: number,
    field: "name" | "measure",
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError("Bạn cần đăng nhập để đăng công thức");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const finalCategory = showNewCategory ? newCategory : strCategory;

      // Build recipe data
      const recipeData: any = {
        strMeal,
        strCategory: finalCategory,
        strArea,
        strInstructions,
        strMealThumb,
        strYoutube,
        strTags,
        authorId: user.id,
        prepTime: Number(prepTime),
        cookTime: Number(cookTime),
        servings: Number(servings),
        difficulty,
      };

      // Add ingredients
      ingredients.forEach((ingredient, index) => {
        const num = index + 1;
        recipeData[`strIngredient${num}`] = ingredient.name;
        recipeData[`strMeasure${num}`] = ingredient.measure;
      });

      const response = await authFetch("/api/recipes", {
        method: "POST",
        body: JSON.stringify(recipeData),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/recipes/${data.recipeId}`);
      } else {
        setError(data.message || "Có lỗi xảy ra khi đăng công thức");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
      setError("Có lỗi xảy ra. Vui lòng thử lại!");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Đăng công thức mới
          </h1>
          <p className="text-gray-600">
            Chia sẻ món ăn yêu thích của bạn với cộng đồng 🍳
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Thông tin cơ bản
            </h2>

            <div className="space-y-4">
              {/* Recipe Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên món ăn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={strMeal}
                  onChange={(e) => setStrMeal(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="VD: Phở bò Hà Nội"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                {!showNewCategory ? (
                  <div className="flex gap-2">
                    <select
                      required
                      value={strCategory}
                      onChange={(e) => setStrCategory(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategory(true)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      + Tạo mới
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Nhập tên danh mục mới"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCategory(false);
                        setNewCategory("");
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>

              {/* Area & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vùng miền
                  </label>
                  <select
                    value={strArea}
                    onChange={(e) => setStrArea(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  >
                    <option value="Vietnamese">Việt Nam</option>
                    <option value="American">Mỹ</option>
                    <option value="British">Anh</option>
                    <option value="Canadian">Canada</option>
                    <option value="Chinese">Trung Quốc</option>
                    <option value="French">Pháp</option>
                    <option value="Indian">Ấn Độ</option>
                    <option value="Italian">Ý</option>
                    <option value="Japanese">Nhật Bản</option>
                    <option value="Korean">Hàn Quốc</option>
                    <option value="Mexican">Mexico</option>
                    <option value="Thai">Thái Lan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (cách nhau bởi dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={strTags}
                    onChange={(e) => setStrTags(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    placeholder="VD: healthy, quick, vegetarian"
                  />
                </div>
              </div>

              {/* Recipe Details */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian chuẩn bị (phút)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={prepTime}
                    onChange={(e) => setPrepTime(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian nấu (phút)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cookTime}
                    onChange={(e) => setCookTime(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khẩu phần (người)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Độ khó
                </label>
                <div className="flex gap-4">
                  {[
                    { value: "easy", label: "Dễ", emoji: "😊" },
                    { value: "medium", label: "Trung bình", emoji: "🤔" },
                    { value: "hard", label: "Khó", emoji: "😰" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                        difficulty === option.value
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="difficulty"
                        value={option.value}
                        checked={difficulty === option.value}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="font-medium text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Ảnh món ăn
            </h2>
            <FileUploader
              folder="recipes"
              userId={user.id}
              currentUrl={strMealThumb}
              onUploadComplete={(url) => setStrMealThumb(url)}
            />
            <p className="text-sm text-gray-500 mt-2">
              Hoặc nhập URL ảnh:
            </p>
            <input
              type="text"
              value={strMealThumb}
              onChange={(e) => setStrMealThumb(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 mt-2"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Nguyên liệu ({ingredientCount}/20)
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setIngredientCount(Math.max(1, ingredientCount - 1))
                  }
                  disabled={ingredientCount <= 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setIngredientCount(Math.min(20, ingredientCount + 1))
                  }
                  disabled={ingredientCount >= 20}
                  className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {Array.from({ length: ingredientCount }).map((_, index) => (
                <div key={index} className="grid grid-cols-12 gap-3">
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">
                      {index + 1}.
                    </span>
                  </div>
                  <div className="col-span-7">
                    <input
                      type="text"
                      value={ingredients[index]?.name || ""}
                      onChange={(e) =>
                        handleIngredientChange(index, "name", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                      placeholder="Tên nguyên liệu"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={ingredients[index]?.measure || ""}
                      onChange={(e) =>
                        handleIngredientChange(index, "measure", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                      placeholder="Định lượng"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Cách làm <span className="text-red-500">*</span>
            </h2>
            <textarea
              required
              value={strInstructions}
              onChange={(e) => setStrInstructions(e.target.value)}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="Hướng dẫn chi tiết từng bước..."
            />
            <p className="text-sm text-gray-500 mt-2">
              Mỗi bước trên một dòng riêng
            </p>
          </div>

          {/* YouTube Link */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Video hướng dẫn (tùy chọn)
            </h2>
            <input
              type="text"
              value={strYoutube}
              onChange={(e) => setStrYoutube(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? "Đang đăng..." : "Đăng công thức"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
