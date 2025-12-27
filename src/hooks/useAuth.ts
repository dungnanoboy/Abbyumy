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

  useEffect(() => {
    // Initial check
    checkUser();
    setLoading(false);

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

  return { user, loading, logout };
}
