"use client";

import { useAuthContext } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ErrorHandlerProps {
  error?: any;
  onError?: (errorResponse: any) => void;
}

export function ErrorHandler({ error, onError }: ErrorHandlerProps) {
  const { handleAuthError } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (error?.response?.status === 401) {
      // Handle authentication error
      const errorResponse = handleAuthError();

      // Call the onError callback if provided
      if (onError) {
        onError(errorResponse);
      }

      // Redirect to login page
      router.push("/login");
    }
  }, [error, handleAuthError, onError, router]);

  return null; // This component doesn't render anything
}

// Utility function to create the standard authentication error response
export function createAuthErrorResponse() {
  return {
    status: "error",
    message: "فشل في عملية تسجيل دخول",
    details: {
      message: "انتهت صلاحية الجلسة",
    },
  };
}

// Hook to handle API calls with authentication error handling
export function useApiCall() {
  const { handleAuthError } = useAuthContext();
  const router = useRouter();

  const callApi = async (apiFunction: () => Promise<any>) => {
    try {
      return await apiFunction();
    } catch (error: any) {
      if (error?.response?.status === 401) {
        // Handle authentication error
        const errorResponse = handleAuthError();

        // Redirect to login page
        router.push("/login");

        // Return the standard error response
        return errorResponse;
      }

      // Re-throw other errors
      throw error;
    }
  };

  return { callApi };
}
