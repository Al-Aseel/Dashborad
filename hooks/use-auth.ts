"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AuthService, type AuthUser } from "@/lib/auth";
import { UsersService, type BackendUser } from "@/lib/users";
import { useRouter } from "next/navigation";

interface User extends AuthUser {}

// Helper function to convert BackendUser to User
const convertBackendUserToUser = (backendUser: BackendUser): User => ({
  id: backendUser._id,
  name: backendUser.name,
  email: backendUser.email,
  role: backendUser.role,
});

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const isInitialized = useRef(false);
  const isVerifying = useRef(false);

  // Verify token and fetch current user on mount
  useEffect(() => {
    // Prevent multiple verification calls
    if (isInitialized.current || isVerifying.current) {
      return;
    }

    const verify = async () => {
      if (isVerifying.current) return;
      isVerifying.current = true;

      try {
        // Check if we have cached user data first
        const cachedUser = localStorage.getItem("userData");
        const cachedAuth = localStorage.getItem("isAuthenticated");

        if (cachedUser && cachedAuth === "true") {
          try {
            const userData = JSON.parse(cachedUser);
            setUser(userData);
            setIsAuthenticated(true);
            setIsLoading(false);
            isInitialized.current = true;
            return;
          } catch (e) {
            // Invalid cached data, continue with verification
          }
        }

        const me = await UsersService.getMyData();
        const convertedUser = convertBackendUserToUser(me);
        setUser(convertedUser);
        setIsAuthenticated(true);

        // Persist minimal user info for UX
        try {
          // Always use localStorage for userData and isAuthenticated
          window.localStorage.setItem(
            "userData",
            JSON.stringify(convertedUser)
          );
          window.localStorage.setItem("isAuthenticated", "true");
          if (!document.cookie.includes("isAuthenticated=true")) {
            document.cookie = "isAuthenticated=true; path=/";
          }
        } catch {}
      } catch (error) {
        // 401 will be caught by interceptor and redirected; just reflect state
        setIsAuthenticated(false);
        setUser(null);

        // Clear invalid cached data
        try {
          localStorage.removeItem("userData");
          localStorage.removeItem("isAuthenticated");
        } catch {}
      } finally {
        setIsLoading(false);
        isInitialized.current = true;
        isVerifying.current = false;
      }
    };

    verify();
  }, []);

  // Login function
  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe: boolean = false
    ): Promise<boolean> => {
      try {
        const response = await AuthService.login(email, password, rememberMe);

        // After token is set by AuthService.login, fetch fresh user profile from server
        try {
          const me = await UsersService.getMyData();
          const convertedUser = convertBackendUserToUser(me);
          setUser(convertedUser);

          // Persist minimal user info for UX
          try {
            // Always use localStorage for userData and isAuthenticated
            window.localStorage.setItem(
              "userData",
              JSON.stringify(convertedUser)
            );
            window.localStorage.setItem("isAuthenticated", "true");
            if (!document.cookie.includes("isAuthenticated=true")) {
              document.cookie = "isAuthenticated=true; path=/";
            }
          } catch {}
        } catch {
          // Fall back to user returned by login if getMyData fails
          setUser(response.data);
        }

        setIsAuthenticated(true);
        isInitialized.current = true;
        return true;
      } catch (error) {
        console.error("Login error:", error);
        return false;
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(() => {
    try {
      AuthService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      isInitialized.current = false;
      try {
        // Ensure cached flags cleared
        localStorage.removeItem("userData");
        localStorage.removeItem("isAuthenticated");
        document.cookie =
          "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } catch {}
      router.push("/login");
    }
  }, []);

  // Handle authentication error response
  const handleAuthError = useCallback(() => {
    const errorResponse = {
      status: "error",
      message: "فشل في عملية تسجيل دخول",
      details: {
        message: "انتهت صلاحية الجلسة",
      },
    };

    // Clear authentication data
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("userData");
      localStorage.removeItem("isAuthenticated");
      document.cookie =
        "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch {}

    setUser(null);
    setIsAuthenticated(false);
    isInitialized.current = false;

    return errorResponse;
  }, []);

  // Logout from all devices
  const logoutAllDevices = useCallback(async () => {
    try {
      await AuthService.logoutAll();
    } catch {}

    setUser(null);
    setIsAuthenticated(false);
    isInitialized.current = false;

    // Clear cached data
    try {
      localStorage.removeItem("userData");
      localStorage.removeItem("isAuthenticated");
      document.cookie =
        "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch {}

    router.push("/login");
  }, [router]);

  // Check if user is authenticated
  const checkAuthStatus = useCallback(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    return authStatus === "true";
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    logoutAllDevices,
    checkAuthStatus,
  };
}
