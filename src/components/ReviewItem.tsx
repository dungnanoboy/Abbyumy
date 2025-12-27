"use client";

import { useState } from "react";
import Image from "next/image";

interface Author {
  id: string;
  name: string;
  avatar: string;
}

interface Reply {
  _id: string;
  content: string;
  likes: string[];
  createdAt: string;
  author: Author;
}

interface ReviewItemProps {
  review: {
    _id: string;
    content: string;
    likes: string[];
    createdAt: string;
    author: Author;
    replies: Reply[];
  };
  currentUserId: string | null;
  onLike: (reviewId: string) => void;
  onReply: (reviewId: string, content: string) => void;
  isReply?: boolean;
}

export default function ReviewItem({
  review,
  currentUserId,
  onLike,
  onReply,
  isReply = false,
}: ReviewItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isLiked, setIsLiked] = useState(
    currentUserId ? review.likes.includes(currentUserId) : false
  );
  const [likesCount, setLikesCount] = useState(review.likes.length);

  const handleLike = async () => {
    if (!currentUserId) {
      alert("Bạn cần đăng nhập để thích bình luận!");
      return;
    }

    try {
      const res = await fetch(`/api/comments/${review._id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: currentUserId }),
      });

      const data = await res.json();

      if (data.success) {
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;

    onReply(review._id, replyContent);
    setReplyContent("");
    setShowReplyForm(false);
  };

  return (
    <div className={`flex gap-3 ${isReply ? "ml-12" : ""}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {review.author.avatar ? (
          <Image
            src={review.author.avatar}
            alt={review.author.name}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
            <span className="text-orange-600 font-semibold">
              {review.author.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-800">
              {review.author.name}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <p className="text-gray-700">{review.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2 text-sm">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 hover:underline ${
              isLiked ? "text-red-600 font-semibold" : "text-gray-600"
            }`}
          >
            {isLiked ? "❤️" : "🤍"} Thích
            {likesCount > 0 && ` (${likesCount})`}
          </button>

          {!isReply && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-gray-600 hover:underline"
            >
              💬 Trả lời
            </button>
          )}

          <span className="text-gray-400">
            {review.replies?.length > 0 && `${review.replies.length} phản hồi`}
          </span>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Viết phản hồi..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSubmitReply();
                }
              }}
            />
            <button
              onClick={handleSubmitReply}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              Gửi
            </button>
            <button
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent("");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Hủy
            </button>
          </div>
        )}

        {/* Replies */}
        {review.replies && review.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {review.replies.map((reply) => (
              <ReviewItem
                key={reply._id}
                review={reply as any}
                currentUserId={currentUserId}
                onLike={onLike}
                onReply={onReply}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
