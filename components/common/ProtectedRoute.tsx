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
  const [isBarterPage, setIsBarterPage] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    // Check if we're on a barter page - these pages handle their own auth
    setIsBarterPage(
      pathname.startsWith('/creator-dashboard') || 
      pathname.startsWith('/barter-company-dashboard')
    );
  }, [pathname]);

  useEffect(() => {
    // Skip auth check for barter pages - they handle their own auth
    if (isBarterPage) return;
    
    if (mounted && !loading) {
      const userStr = localStorage.getItem('user');
      let userData = null;
      
      try {
        if (userStr) {
          userData = JSON.parse(userStr);
        }
      } catch (e) {
        // Invalid user data, clear it
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      
      // Check if user is a barter creator trying to access brand dashboard
      if (userData?.userType === 'barter_creator') {
        // Barter creators should NEVER be on brand pages
        window.location.href = "/creator-dashboard";
        return;
      }
      
      // Check if user is a barter company trying to access brand dashboard
      if (userData?.userType === 'barter_company') {
        // Barter companies should NEVER be on brand pages
        window.location.href = "/barter-company-dashboard";
        return;
      }
      
      // Not authenticated - redirect to appropriate login
      if (!isAuthenticated) {
        window.location.href = "/login";
        return;
      }
    }
  }, [isAuthenticated, loading, mounted, isBarterPage]);

  // For barter pages, render children immediately - they handle their own loading state
  if (isBarterPage) {
    return <>{children}</>;
  }

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
