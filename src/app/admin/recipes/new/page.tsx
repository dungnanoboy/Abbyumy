"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FileUploader from "@/components/FileUploader";
import { authFetch } from "@/lib/authFetch";

interface Category {
  name: string;
  recipeCount: number;
}

export default function NewRecipePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [ingredientCount, setIngredientCount] = useState(5); // Start with 5 ingredients
  const [formData, setFormData] = useState({
    strMeal: "",
    strCategory: "",
    strArea: "Vietnamese",
    strInstructions: "",
    strMealThumb: "",
    strYoutube: "",
    strIngredient1: "",
    strMeasure1: "",
    strIngredient2: "",
    strMeasure2: "",
    strIngredient3: "",
    strMeasure3: "",
    strIngredient4: "",
    strMeasure4: "",
    strIngredient5: "",
    strMeasure5: "",
    strIngredient6: "",
    strMeasure6: "",
    strIngredient7: "",
    strMeasure7: "",
    strIngredient8: "",
    strMeasure8: "",
    strIngredient9: "",
    strMeasure9: "",
    strIngredient10: "",
    strMeasure10: "",
    strIngredient11: "",
    strMeasure11: "",
    strIngredient12: "",
    strMeasure12: "",
    strIngredient13: "",
    strMeasure13: "",
    strIngredient14: "",
    strMeasure14: "",
    strIngredient15: "",
    strMeasure15: "",
    strIngredient16: "",
    strMeasure16: "",
    strIngredient17: "",
    strMeasure17: "",
    strIngredient18: "",
    strMeasure18: "",
    strIngredient19: "",
    strMeasure19: "",
    strIngredient20: "",
    strMeasure20: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await authFetch("/api/recipes", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Thêm công thức thành công!");
        router.push("/admin/recipes");
      } else {
        alert(data.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
      alert("Có lỗi xảy ra khi tạo công thức!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Thêm công thức mới</h1>
        <nav className="text-sm text-gray-600">
          <Link href="/admin" className="hover:text-blue-600">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <Link href="/admin/recipes" className="hover:text-blue-600">
            Công thức
          </Link>
          <span className="mx-2">/</span>
          <span>Thêm mới</span>
        </nav>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên món ăn *
              </label>
              <input
                type="text"
                required
                value={formData.strMeal}
                onChange={(e) => setFormData({ ...formData, strMeal: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Phở bò Hà Nội"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục *
              </label>
              {showCategoryInput ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={formData.strCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, strCategory: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Nhập tên danh mục mới"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryInput(false);
                      setFormData({ ...formData, strCategory: "" });
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    ← Chọn từ danh mục có sẵn
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    required
                    value={formData.strCategory}
                    onChange={(e) => {
                      if (e.target.value === "__new__") {
                        setShowCategoryInput(true);
                        setFormData({ ...formData, strCategory: "" });
                      } else {
                        setFormData({ ...formData, strCategory: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="__new__" className="font-semibold text-blue-600">
                      + Tạo danh mục mới
                    </option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hình ảnh món ăn
              </label>
              <FileUploader
                onUploadComplete={(url) => setFormData({ ...formData, strMealThumb: url })}
                currentUrl={formData.strMealThumb}
                folder="recipes"
                userId={(() => {
                  const currentUserStr = localStorage.getItem("currentUser");
                  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
                  return currentUser?.id || "anonymous";
                })()}
                label="Chọn ảnh món ăn"
                className="mb-2"
              />
              <input
                type="text"
                value={formData.strMealThumb}
                onChange={(e) =>
                  setFormData({ ...formData, strMealThumb: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Hoặc nhập URL ảnh"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Youtube URL
              </label>
              <input
                type="url"
                value={formData.strYoutube}
                onChange={(e) =>
                  setFormData({ ...formData, strYoutube: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hướng dẫn *
            </label>
            <textarea
              required
              value={formData.strInstructions}
              onChange={(e) =>
                setFormData({ ...formData, strInstructions: e.target.value })
              }
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Mỗi bước trên một dòng..."
            />
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Nguyên liệu ({ingredientCount}/20)
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIngredientCount(Math.max(1, ingredientCount - 1))}
                  disabled={ingredientCount <= 1}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  - Bớt
                </button>
                <button
                  type="button"
                  onClick={() => setIngredientCount(Math.min(20, ingredientCount + 1))}
                  disabled={ingredientCount >= 20}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Thêm
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(ingredientCount)].map((_, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={formData[`strIngredient${i + 1}` as keyof typeof formData]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`strIngredient${i + 1}`]: e.target.value,
                      })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder={`Nguyên liệu ${i + 1}`}
                  />
                  <input
                    type="text"
                    value={formData[`strMeasure${i + 1}` as keyof typeof formData]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`strMeasure${i + 1}`]: e.target.value,
                      })
                    }
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Số lượng"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Đang tạo..." : "Thêm công thức"}
            </button>
            <Link
              href="/admin/recipes"
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
