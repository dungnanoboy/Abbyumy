"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/recipe";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to check and update user from localStorage
  const checkUser = () => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  // Function to fetch fresh user data from server
  const refreshUser = async () => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) return;

    try {
      const currentUser = JSON.parse(userStr);
      const response = await fetch(`/api/users/${currentUser._id || currentUser.id}`, {
        headers: {
          "x-user-id": currentUser._id || currentUser.id || "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          localStorage.setItem("currentUser", JSON.stringify(data.user));
          setUser(data.user);
          window.dispatchEvent(new Event("authChange"));
        }
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  useEffect(() => {
    // Initial check
    checkUser();
    
    // Refresh user data from server on mount to get latest data
    refreshUser().finally(() => {
      setLoading(false);
    });

    // Listen for storage changes (when other tabs/windows update localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentUser") {
        checkUser();
      }
    };

    // Listen for custom event (when same tab updates localStorage)
    const handleAuthChange = () => {
      checkUser();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("authChange"));
    window.location.href = "/";
  };

  return { user, loading, logout, refreshUser };
}
