"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  twoFactorEnabled?: boolean;
  currentPlan?: string;
  planUpdatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to safely check if we're in browser
const isBrowser = () => typeof window !== "undefined";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only access localStorage in browser
    if (!isBrowser()) {
      setLoading(false);
      return;
    }

    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Silently handle localStorage errors
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch {
        // Ignore cleanup errors
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    if (isBrowser()) {
      try {
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
      } catch {
        // Ignore localStorage errors
      }
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    if (isBrowser()) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch {
        // Ignore localStorage errors
      }
    }
    // Use window.location for navigation to avoid router issues
    if (isBrowser()) {
      window.location.href = "/login";
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch('/api/user/settings', {
        headers: { 'x-user-id': user.email },
      });
      const data = await response.json();
      
      if (data.success && data.user) {
        const updatedUser = {
          ...user,
          name: data.user.name,
          company: data.user.company,
          twoFactorEnabled: data.user.twoFactorEnabled,
          currentPlan: data.user.currentPlan,
          planUpdatedAt: data.user.planUpdatedAt,
        };
        setUser(updatedUser);
        if (isBrowser()) {
          try {
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } catch {
            // Ignore localStorage errors
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
