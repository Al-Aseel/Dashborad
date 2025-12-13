import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.elaseel.org/api/v1";
export const API_BASE_URL = baseURL;

export const api = axios.create({
  baseURL,
  timeout: 30000, // زيادة timeout للشبكات البطيئة
});

// Same-origin client for hitting Next.js API routes (no external baseURL)
export const localApi = axios.create({
  baseURL: "",
  timeout: 30000,
});

// Attach token from localStorage on each request and handle FormData
const attachAuthToken = (config: any) => {
  try {
    let token: string | null = null;
    if (typeof window !== "undefined") {
      // Always use localStorage for auth_token
      token = localStorage.getItem("auth_token");
    }
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
  } catch {}
  return config;
};

api.interceptors.request.use(attachAuthToken);
localApi.interceptors.request.use(attachAuthToken);

// Handle errors globally
const responseErrorHandler = (error: any) => {
  // Check if it's a server connection error
  const isServerError =
    !error.response || // No response from server
    error.code === "ECONNABORTED" || // Timeout
    error.code === "ERR_NETWORK" || // Network error
    error.code === "ERR_FAILED" || // Generic network failure
    error.message.includes("Network Error") ||
    error.message.includes("ERR_NETWORK") ||
    error.message.includes("ERR_FAILED") ||
    error.message.includes("fetch") ||
    (error.response && error.response.status >= 500); // Server errors (5xx)
  
  // Log network errors for debugging
  if (isServerError && typeof window !== "undefined") {
    console.error("Network error:", {
      code: error.code,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
    });
  }

  // Previously we dispatched a custom event for a ServerErrorProvider.
  // That provider has been removed, so we no longer emit any window events here.

  // Handle 401: Session expired or unauthorized
  if (error?.response?.status === 401 && typeof window !== "undefined") {
    try {
      // Check if the error response matches the expected format
      const errorData = error.response?.data;
      const isSessionExpired =
        errorData?.status === "error" &&
        errorData?.message === "فشل في عملية تسجيل دخول" &&
        errorData?.details?.message === "انتهت صلاحية الجلسة";

      // Clear all authentication data
      clearAuthData();

      // Redirect to login page if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } catch (clearError) {
      console.error("Error clearing authentication data:", clearError);
    }
  }

  return Promise.reject(error);
};

api.interceptors.response.use((response) => response, responseErrorHandler);

localApi.interceptors.response.use(
  (response) => response,
  responseErrorHandler
);

export function setAuthToken(
  token: string | null,
  options?: { remember?: boolean }
) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    try {
      // Always use localStorage for auth_token
      localStorage.removeItem("auth_token");
      localStorage.setItem("auth_token", token);
    } catch {}
  } else {
    delete api.defaults.headers.common.Authorization;
    try {
      localStorage.removeItem("auth_token");
    } catch {}
  }
}

// Utility function to create standard authentication error response
export function createAuthErrorResponse() {
  return {
    status: "error",
    message: "فشل في عملية تسجيل دخول",
    details: {
      message: "انتهت صلاحية الجلسة",
    },
  };
}

// Utility function to clear all authentication data
export function clearAuthData() {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("userData");
      localStorage.removeItem("isAuthenticated");

      // Clear authentication cookie
      document.cookie =
        "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Clear axios default headers
      delete api.defaults.headers.common.Authorization;
      delete localApi.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error("Error clearing authentication data:", error);
  }
}

// Middleware function for API routes to handle authentication errors
export function handleApiAuthError(error: any) {
  if (error?.response?.status === 401) {
    return new Response(JSON.stringify(createAuthErrorResponse()), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  return null; // Let the calling code handle other errors
}

// Helper function to check if server is reachable
// Removed checkServerHealth as ServerErrorProvider is no longer used
