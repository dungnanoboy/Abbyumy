"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface Short {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  provider: string;
  providerVideoId: string;
  thumbnail: string;
  recipeId?: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  likeCount: number;
  commentCount: number;
  shareCount: number;
  views: number;
  tags: string[];
}

export default function AbbyShortPage() {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchShorts();
  }, []);

  useEffect(() => {
    // Handle scroll snap
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const windowHeight = window.innerHeight;
      const index = Math.round(scrollPosition / windowHeight);
      setCurrentIndex(index);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchShorts = async () => {
    try {
      const res = await fetch("/api/shorts");
      const data = await res.json();
      if (data.success) {
        setShorts(data.shorts);
      }
    } catch (error) {
      console.error("Error fetching shorts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Call API to like short
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Call API to follow user
  };

  const handleShare = () => {
    // TODO: Share functionality
    alert("Chức năng chia sẻ đang được phát triển");
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">📹 Chưa có video nào</p>
          <p className="text-gray-400 mt-2">Hãy quay lại sau nhé!</p>
        </div>
      </div>
    );
  }

  const currentShort = shorts[currentIndex] || shorts[0];

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Video Container with Snap Scroll */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {shorts.map((short, index) => (
          <div
            key={short._id}
            className="h-screen w-full snap-start snap-always flex items-center justify-center relative"
          >
            {/* YouTube Video Embed */}
            <div className="relative w-full h-full max-w-[500px] mx-auto bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${short.providerVideoId}?autoplay=${
                  index === currentIndex ? 1 : 0
                }&mute=0&controls=1&rel=0&modestbranding=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              {/* Overlay Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
                <div className="max-w-[400px]">
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-3 pointer-events-auto">
                    {short.author?.avatar ? (
                      <Image
                        src={short.author.avatar}
                        alt={short.author?.name || "User"}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {short.author?.name?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        {short.author?.name || "Unknown"}
                      </p>
                    </div>
                    <button
                      onClick={handleFollow}
                      className={`px-4 py-1 rounded-full font-semibold text-sm ${
                        isFollowing
                          ? "bg-gray-700 text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-white font-semibold mb-2">{short.title}</h3>
                  <p className="text-white text-sm line-clamp-2 mb-3">
                    {short.description}
                  </p>

                  {/* Tags */}
                  {short.tags && short.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {short.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-white text-xs bg-white/20 px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side Actions (TikTok Style) */}
              <div className="absolute right-4 bottom-24 flex flex-col gap-6 pointer-events-auto">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isLiked ? "bg-red-500" : "bg-gray-800/80"
                    } backdrop-blur-sm`}
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill={isLiked ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-white text-xs font-semibold">
                    {short.likeCount || 0}
                  </span>
                </button>

                {/* Comment Button */}
                <Link
                  href={`/abbyshort/${short._id}`}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-12 h-12 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <span className="text-white text-xs font-semibold">
                    {short.commentCount || 0}
                  </span>
                </Link>

                {/* Share Button */}
                <button onClick={handleShare} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </div>
                  <span className="text-white text-xs font-semibold">
                    {short.shareCount || 0}
                  </span>
                </button>

                {/* Recipe Link (if available) */}
                {short.recipeId && (
                  <Link
                    href={`/recipes/${short.recipeId}`}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-white text-xs font-semibold">Công thức</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
