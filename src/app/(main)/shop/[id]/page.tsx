"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  category: string;
  tags: string[];
  sku?: string;
  variants?: {
    name: string;
    value: string;
    extraPrice: number;
  }[];
  recipeId?: string;
  sellerId: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [recipe, setRecipe] = useState<any>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    if (product?.recipeId) {
      fetchRecipe(product.recipeId);
    }
  }, [product?.recipeId]);

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      
      if (data.success && data.product) {
        setProduct(data.product);
      } else {
        console.error("Product not found:", data.error);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipe = async (recipeId: string) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      const data = await response.json();
      if (data.recipe) {
        setRecipe(data.recipe);
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Check if product is in stock
    if (product.stock < quantity) {
      alert("Không đủ hàng trong kho!");
      return;
    }

    // Add to cart
    addToCart({
      productId: product._id,
      title: product.title,
      price: totalPrice,
      image: product.images?.[0] || "/placeholder-product.png",
      quantity: quantity,
      variant: selectedVariant?.value || undefined,
    });

    // Show success message
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Check if product is in stock
    if (product.stock < quantity) {
      alert("Không đủ hàng trong kho!");
      return;
    }

    // Add to cart
    addToCart({
      productId: product._id,
      title: product.title,
      price: totalPrice,
      image: product.images?.[0] || "/placeholder-product.png",
      quantity: quantity,
      variant: selectedVariant?.value || undefined,
    });

    // Redirect to cart
    router.push("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Không tìm thấy sản phẩm
          </h2>
          <Link href="/shop" className="text-orange-500 hover:underline">
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = product.price + (selectedVariant?.extraPrice || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Toast */}
      {addedToCart && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <div className="font-semibold">Đã thêm vào giỏ hàng!</div>
              <div className="text-sm opacity-90">{quantity} sản phẩm</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-orange-500">Trang chủ</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-orange-500">Cửa hàng</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {/* Main Image */}
            <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-gray-100">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Badges */}
              {product.stock < 50 && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    🔥 Sắp hết hàng
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-orange-500 ring-2 ring-orange-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              {product.title}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-1">
                <span className="text-orange-500 font-bold text-lg">
                  {product.rating}
                </span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? "text-orange-400 fill-current"
                          : "text-gray-300"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="text-gray-600 text-sm">
                ({product.reviewCount} đánh giá)
              </div>
              <div className="text-gray-600 text-sm">
                Đã bán: 1.2k
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-orange-500">
                  ₫{formatPrice(totalPrice)}
                </span>
                {selectedVariant?.extraPrice > 0 && (
                  <span className="text-gray-400 line-through">
                    ₫{formatPrice(product.price)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Miễn phí vận chuyển cho đơn từ 200k</span>
              </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Phân loại: {product.variants[0].name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedVariant === variant
                          ? "border-orange-500 bg-orange-50 text-orange-600 font-medium"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {variant.value}
                      {variant.extraPrice > 0 && (
                        <span className="text-xs ml-1">
                          (+₫{formatPrice(variant.extraPrice)})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Số lượng</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center border-x-2 border-gray-200 py-2 focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  Còn lại: {product.stock} sản phẩm
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 bg-orange-100 text-orange-600 py-4 rounded-xl font-semibold hover:bg-orange-200 transition-all border-2 border-orange-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Thêm vào giỏ
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                Mua ngay
              </button>
            </div>

            {/* Related Recipe */}
            {product.recipeId && recipe && (
              <Link
                href={`/recipes/${product.recipeId}`}
                className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl hover:shadow-lg transition-all border-2 border-blue-100 hover:border-blue-300"
              >
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    📖 CÔNG THỨC GỢI Ý
                  </div>
                  <div className="font-bold text-gray-800 mb-1">
                    {recipe.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    Xem cách sử dụng sản phẩm này →
                  </div>
                </div>
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            {product.recipeId && !recipe && (
              <Link
                href={`/recipes/${product.recipeId}`}
                className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <div className="bg-blue-500 text-white p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Công thức gợi ý</div>
                  <div className="font-semibold text-blue-600">Xem công thức sử dụng →</div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Product Description */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Mô tả sản phẩm
          </h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {product.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Product Info Table */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">
              Thông tin chi tiết
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Danh mục:</span>
                <span className="font-medium text-gray-800">{product.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">SKU:</span>
                <span className="font-medium text-gray-800">{product.sku || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Tình trạng:</span>
                <span className="font-medium text-green-600">
                  {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Đánh giá:</span>
                <span className="font-medium text-gray-800">
                  ⭐ {product.rating} ({product.reviewCount} đánh giá)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Returns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl mb-2">🚚</div>
            <h3 className="font-semibold text-gray-800 mb-2">Giao hàng nhanh</h3>
            <p className="text-sm text-gray-600">
              Miễn phí ship cho đơn từ 200k
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-semibold text-gray-800 mb-2">Chính hãng 100%</h3>
            <p className="text-sm text-gray-600">
              Cam kết sản phẩm chất lượng
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl mb-2">🔄</div>
            <h3 className="font-semibold text-gray-800 mb-2">Đổi trả dễ dàng</h3>
            <p className="text-sm text-gray-600">
              7 ngày đổi trả miễn phí
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
