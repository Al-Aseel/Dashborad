"use client";

import { useEffect, useRef } from "react";
import { Permissions, type Role } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useAuthContext } from "./auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowRoles?: Role[]; // optional allowlist
}

export function ProtectedRoute({ children, allowRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (!isLoading && !isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Reset redirect flag when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      hasRedirected.current = false;
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
            <div className="w-8 h-8 bg-white rounded-full animate-pulse" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (allowRoles && user?.role && !allowRoles.includes(user.role as Role)) {
    // Unauthorized: do NOT logout; redirect back if possible, else home
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      try {
        if (typeof window !== "undefined" && document.referrer) {
          const sameOrigin =
            new URL(document.referrer).origin === window.location.origin;
          if (sameOrigin) {
            router.back();
            return null;
          }
        }
      } catch {}
      router.push("/");
    }
    return null;
  }

  return <>{children}</>;
}
