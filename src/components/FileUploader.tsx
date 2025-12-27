"use client";

import { useState, useRef } from "react";

interface FileUploaderProps {
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
  folder?: 'users' | 'recipes' | 'cooksnaps' | 'general';
  userId?: string;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  className?: string;
}

export default function FileUploader({
  onUploadComplete,
  currentUrl = "",
  folder = "general",
  userId = "anonymous",
  accept = "image/jpeg,image/jpg,image/png,image/gif,image/webp",
  maxSizeMB = 10,
  label = "Chọn file",
  className = "",
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentUrl);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File không được vượt quá ${maxSizeMB}MB`);
      return;
    }

    setError("");
    setUploading(true);

    try {
      // Delete old file if exists and is from uploads directory
      if (currentUrl && currentUrl.startsWith('/uploads/')) {
        try {
          await fetch('/api/upload/delete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filePath: currentUrl }),
          });
        } catch (deleteError) {
          console.warn('Failed to delete old file:', deleteError);
          // Continue with upload even if delete fails
        }
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("userId", userId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onUploadComplete(data.url);
      } else {
        setError(data.message || "Upload thất bại");
        setPreview(currentUrl);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Có lỗi xảy ra khi upload");
      setPreview(currentUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const isVideo = preview && (preview.endsWith('.mp4') || preview.endsWith('.webm') || preview.includes('video'));

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {/* Preview */}
      {preview && (
        <div className="mb-3">
          {isVideo ? (
            <video
              src={preview}
              controls
              className="w-full max-w-xs h-40 object-cover rounded-lg border border-gray-300"
            />
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="w-full max-w-xs h-40 object-cover rounded-lg border border-gray-300"
            />
          )}
        </div>
      )}

      {/* Upload Button */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={uploading}
        className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Đang tải lên...
          </span>
        ) : (
          label
        )}
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Helper Text */}
      <p className="mt-1 text-xs text-gray-500">
        Tối đa {maxSizeMB}MB. {accept.includes('video') ? 'Hỗ trợ ảnh và video.' : 'Hỗ trợ JPG, PNG, GIF, WEBP.'}
      </p>
    </div>
  );
}
