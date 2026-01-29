"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, ReactNode, useState } from "react";
import { usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      // Check if user was a barter user based on last known path
      const lastUser = localStorage.getItem('user');
      if (lastUser) {
        try {
          const userData = JSON.parse(lastUser);
          if (userData.userType === 'barter_creator') {
            window.location.href = "/login-barter";
            return;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      window.location.href = "/login";
    }
  }, [isAuthenticated, loading, mounted]);

  // Redirect barter users trying to access regular dashboard
  useEffect(() => {
    if (mounted && !loading && isAuthenticated) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          // If barter user is trying to access non-creator pages, redirect to creator-dashboard
          if (userData.userType === 'barter_creator') {
            const allowedBarterPaths = ['/creator-dashboard', '/creator-dashboard/settings'];
            const isOnAllowedPath = allowedBarterPaths.some(path => pathname.startsWith(path));
            if (!isOnAllowedPath && pathname !== '/creator-dashboard') {
              window.location.href = "/creator-dashboard";
            }
          }
          // If regular user is trying to access creator pages, redirect to dashboard
          else if (userData.userType !== 'barter_creator' && pathname.startsWith('/creator-dashboard')) {
            window.location.href = "/dashboard";
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [mounted, loading, isAuthenticated, pathname]);

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
