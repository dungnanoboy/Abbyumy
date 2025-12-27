"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug - User Info</h1>

        {user ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Current User Data:</h2>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>

            <div className="mt-6 space-y-2">
              <p className="text-sm">
                <strong>ID:</strong> {user.id}
              </p>
              <p className="text-sm">
                <strong>Name:</strong> {user.name}
              </p>
              <p className="text-sm">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-sm">
                <strong>Role:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {user.role || "user"}
                </span>
              </p>
            </div>

            <div className="mt-6 space-x-4">
              <a
                href="/"
                className="inline-block bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Trang chủ
              </a>
              {user.role === "admin" && (
                <a
                  href="/admin"
                  className="inline-block bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                >
                  Trang Admin
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">Chưa đăng nhập</p>
            <a
              href="/login"
              className="inline-block mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Đăng nhập
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
