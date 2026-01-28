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
      <div className="auth-loading-screen">
        <div className="auth-spinner">
          <div className="auth-spinner-ring" />
          <div className="auth-spinner-center">
            <i className="fa-solid fa-bolt" />
          </div>
        </div>
        <p>Loading...</p>
        <style jsx>{`
          .auth-loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0f0f23;
            color: #ffffff;
            gap: 20px;
          }
          .auth-spinner {
            position: relative;
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .auth-spinner-ring {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 4px solid rgba(0, 245, 255, 0.2);
            border-top-color: #00f5ff;
            animation: auth-spin 1s linear infinite;
          }
          .auth-spinner-center {
            font-size: 20px;
            color: #667eea;
            animation: auth-pulse 1.5s ease-in-out infinite;
          }
          @keyframes auth-spin {
            to { transform: rotate(360deg); }
          }
          @keyframes auth-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.9); }
          }
          .auth-loading-screen p {
            font-size: 18px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.7);
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-spinner">
          <div className="auth-spinner-ring" />
          <div className="auth-spinner-center">
            <i className="fa-solid fa-bolt" />
          </div>
        </div>
        <p>Redirecting...</p>
        <style jsx>{`
          .auth-loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0f0f23;
            color: #ffffff;
            gap: 20px;
          }
          .auth-spinner {
            position: relative;
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .auth-spinner-ring {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 4px solid rgba(0, 245, 255, 0.2);
            border-top-color: #00f5ff;
            animation: auth-spin 1s linear infinite;
          }
          .auth-spinner-center {
            font-size: 20px;
            color: #667eea;
            animation: auth-pulse 1.5s ease-in-out infinite;
          }
          @keyframes auth-spin {
            to { transform: rotate(360deg); }
          }
          @keyframes auth-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.9); }
          }
          .auth-loading-screen p {
            font-size: 18px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.7);
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
