import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
export const API_BASE_URL = baseURL;

export const api = axios.create({
  baseURL,
  timeout: 10000, // تقليل timeout لسرعة اكتشاف المشاكل
});

// Same-origin client for hitting Next.js API routes (no external baseURL)
export const localApi = axios.create({
  baseURL: "",
  timeout: 10000,
});

// Attach token from localStorage on each request
const attachAuthToken = (config: any) => {
  try {
    let token: string | null = null;
    if (typeof window !== "undefined") {
      // Prefer persistent token, fallback to session token
      token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
    }
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
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
    error.message.includes("Network Error") ||
    error.message.includes("ERR_NETWORK") ||
    error.message.includes("fetch") ||
    (error.response && error.response.status >= 500); // Server errors (5xx)

  // Previously we dispatched a custom event for a ServerErrorProvider.
  // That provider has been removed, so we no longer emit any window events here.

  // Handle 401 globally
  if (error?.response?.status === 401 && typeof window !== "undefined") {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("userData");
      localStorage.removeItem("isAuthenticated");
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("userData");
      sessionStorage.removeItem("isAuthenticated");
      document.cookie =
        "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch {}
    // Redirect to login
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
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
    const remember = options?.remember ?? true;
    try {
      // Ensure token exists in only one storage
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
      if (remember) {
        localStorage.setItem("auth_token", token);
      } else {
        sessionStorage.setItem("auth_token", token);
      }
    } catch {}
  } else {
    delete api.defaults.headers.common.Authorization;
    try {
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
    } catch {}
  }
}
// Helper function to check if server is reachable
// Removed checkServerHealth as ServerErrorProvider is no longer used
