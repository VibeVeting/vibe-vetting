"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, ReactNode, useState } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      // Use window.location instead of router to avoid issues
      window.location.href = "/login";
    }
  }, [isAuthenticated, loading, mounted]);

  // Don't render until mounted to avoid hydration issues
  if (!mounted || loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <i className="fa-solid fa-spinner fa-spin"></i>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <i className="fa-solid fa-spinner fa-spin"></i>
        </div>
        <p>Redirecting...</p>
      </div>
    );
  }

  return <>{children}</>;
}
