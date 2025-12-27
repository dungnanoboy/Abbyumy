"use client";

import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReviewItem from "@/components/ReviewItem";

interface RecipeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasViewIncremented, setHasViewIncremented] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    // Check if user is logged in
    const currentUserStr = localStorage.getItem('currentUser');
    console.log('currentUserStr:', currentUserStr);
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        console.log('Parsed currentUser:', currentUser);
        setUserId(currentUser.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      console.log('No user logged in');
    }

    // Fetch recipe data only once
    if (!hasViewIncremented) {
      async function fetchRecipe() {
        const { id } = await params;
        try {
          const res = await fetch(`/api/recipes/${id}`, {
            cache: 'no-store',
          });
          
          if (!res.ok) {
            notFound();
          }
          
          const data = await res.json();
          setRecipe(data.recipe);
          
          // Set followers count
          setFollowersCount(data.recipe.author.stats?.totalFollowers || data.recipe.author.followers?.length || 0);
          
          // Check if user already liked and saved
          const currentUserStr = localStorage.getItem('currentUser');
          if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            const likedBy = data.recipe.likedBy || [];
            setIsLiked(likedBy.includes(currentUser.id));
            
            // Check if following author
            const authorFollowers = data.recipe.author.followers || [];
            setIsFollowing(authorFollowers.includes(currentUser.id));
            
            // Fetch user data to check saved recipes
            fetch(`/api/users/${currentUser.id}`)
              .then(res => res.json())
              .then(userData => {
                if (userData.success) {
                  const savedRecipes = userData.user.savedRecipes || [];
                  const isSavedByUser = savedRecipes.some((recipeId: string) => 
                    recipeId === data.recipe.id || recipeId === data.recipe._id
                  );
                  setIsSaved(isSavedByUser);
                }
              })
              .catch(err => console.error('Error checking saved status:', err));
          }
          
          // Fetch reviews
          fetchReviews(id);
          
          setHasViewIncremented(true);
        } catch (error) {
          console.error('Error fetching recipe:', error);
          notFound();
        } finally {
          setIsLoading(false);
        }
      }

      fetchRecipe();
    }
  }, [params, hasViewIncremented]);

  const fetchReviews = async (recipeId: string) => {
    try {
      const res = await fetch(`/api/recipes/${recipeId}/reviews`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!checkAuth()) return;
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          content: newComment,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setReviews([data.review, ...reviews]);
        setNewComment("");
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!checkAuth()) return;

    try {
      const res = await fetch(`/api/recipes/${recipe.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          content,
          parentId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Refresh reviews to show new reply
        fetchReviews(recipe.id);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    // This is handled inside ReviewItem component
  };

  const checkAuth = () => {
    if (!userId) {
      // Save current URL to redirect back after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      router.push('/login');
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!checkAuth()) return;
    
    console.log('Like clicked, userId:', userId);
    
    try {
      // Call API to like/unlike recipe
      const res = await fetch(`/api/recipes/${recipe.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (data.success) {
        setIsLiked(data.isLiked);
        setRecipe({
          ...recipe,
          likes: data.likes,
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const handleSave = async () => {
    if (!checkAuth()) return;
    
    console.log('Save clicked, userId:', userId);
    
    try {
      // Call API to save/unsave recipe
      const res = await fetch(`/api/recipes/${recipe.id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (data.success) {
        setIsSaved(data.isSaved);
        alert(data.message);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const handleCooksnap = () => {
    if (!checkAuth()) return;
    
    console.log('Cooksnap clicked, userId:', userId);
    // TODO: Navigate to cooksnap upload page
    alert('Chức năng đăng cooksnap đang được phát triển!');
    // router.push(`/recipes/${recipe._id}/cooksnap`);
  };

  const handleFollow = async () => {
    if (!checkAuth()) return;

    // Không thể follow chính mình
    if (userId === recipe.author.id) {
      alert('Bạn không thể theo dõi chính mình!');
      return;
    }

    try {
      const res = await fetch(`/api/users/${recipe.author.id}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (data.success) {
        setIsFollowing(data.isFollowing);
        setFollowersCount(prev => data.isFollowing ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section - Image Left, Info Right */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: Hero Image */}
            <div className="relative h-[500px]">
              <Image
                src={recipe.image}
                alt={recipe.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Right: Recipe Info */}
            <div className="p-8 flex flex-col justify-between">
              {/* Title and Author */}
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  {recipe.title}
                </h1>
                <p className="text-lg text-gray-600 mb-6">{recipe.description}</p>
                
                <div className="flex items-center gap-3 mb-6">
                  {recipe.author.avatar ? (
                    <Image
                      src={recipe.author.avatar}
                      alt={recipe.author.name}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                      <span className="text-xl text-orange-600 font-semibold">
                        {recipe.author.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{recipe.author.name}</p>
                    <p className="text-sm text-gray-500">
                      {followersCount} người theo dõi • {new Date(recipe.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  {/* Follow Button */}
                  {userId && userId !== recipe.author.id && (
                    <button
                      onClick={handleFollow}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isFollowing
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      {isFollowing ? '✓ Đang theo dõi' : '+ Theo dõi'}
                    </button>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">⏱️</span>
                      <p className="text-sm text-gray-600">Thời gian</p>
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      {recipe.prepTime + recipe.cookTime} phút
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">👥</span>
                      <p className="text-sm text-gray-600">Khẩu phần</p>
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      {recipe.servings} người
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📊</span>
                      <p className="text-sm text-gray-600">Độ khó</p>
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      {recipe.difficulty === "easy" ? "Dễ" : recipe.difficulty === "medium" ? "Trung bình" : "Khó"}
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">👁️</span>
                      <p className="text-sm text-gray-600">Lượt xem</p>
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      {recipe.views}
                    </p>
                  </div>
                </div>
              </div>

              {/* Engagement Actions */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
                  <span className="font-medium">{recipe.likes}</span>
                </button>

                <button 
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isSaved 
                      ? 'bg-orange-500 text-white hover:bg-orange-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Lưu vào bộ sưu tập"
                >
                  <span className="text-xl">{isSaved ? '🔖' : '📑'}</span>
                  <span className="font-medium">Lưu</span>
                </button>

                <button 
                  onClick={handleCooksnap}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  title="Đã làm món này"
                >
                  <span className="text-xl">📸</span>
                  <span className="font-medium">{recipe.cooksnaps}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Ingredients */}
            <div className="md:col-span-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Nguyên liệu
              </h2>
              <div className="bg-orange-50 rounded-lg p-6">
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient: any) => (
                    <li key={ingredient.id} className="flex justify-between">
                      <span className="text-gray-700">{ingredient.name}</span>
                      <span className="font-medium text-gray-800">
                        {ingredient.amount} {ingredient.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Steps */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Cách làm
              </h2>
              <div className="space-y-4">
                {recipe.steps.map((step: any) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                      {step.order}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">
                        {step.instruction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* YouTube Video Section */}
        {recipe.strYoutube && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🎥 Video hướng dẫn
            </h2>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                src={recipe.strYoutube.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                title="Video hướng dẫn"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Bình luận ({reviews.length})
          </h2>
          
          {/* Comment Form */}
          <div className="mb-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                {userId ? (
                  <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">
                      {localStorage.getItem('currentUser') && 
                        JSON.parse(localStorage.getItem('currentUser')!).name.charAt(0)}
                    </span>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 font-semibold">?</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={userId ? "Viết bình luận của bạn..." : "Đăng nhập để bình luận..."}
                  disabled={!userId}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  rows={3}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!userId || !newComment.trim() || submittingComment}
                  className="mt-2 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submittingComment ? "Đang gửi..." : "Gửi bình luận"}
                </button>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewItem
                  key={review._id}
                  review={review}
                  currentUserId={userId}
                  onLike={handleLikeReview}
                  onReply={handleReply}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </p>
            )}
          </div>
        </div>

        {/* Similar Recipes */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Món ăn tương tự
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder for similar recipes */}
            <p className="text-gray-500 col-span-full text-center py-8">
              Đang tải các món ăn tương tự...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
