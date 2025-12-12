import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_BASE_URL } from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

// Ensure a URL is absolute to the backend host
export function toBackendUrl(pathOrUrl: string | undefined | null): string {
  if (!pathOrUrl) return "";
  try {
    const url = new URL(pathOrUrl);
    // Normalize path and force backend origin
    const backend = new URL(API_BASE_URL);
    const normalizedPath = url.pathname.replace(/^\/api\/v1(\/)?/, "/");
    return `${backend.origin}${normalizedPath}`;
  } catch {
    // Not a full URL, treat as path
    // Strip /api/v1 prefix if present in returned path
    const withoutApiPrefix = pathOrUrl.replace(/^\/api\/v1(\/)?/, "");
    const trimmed = withoutApiPrefix.startsWith("/")
      ? withoutApiPrefix
      : `/${withoutApiPrefix}`;
    // Always use only the origin of API_BASE_URL to avoid duplicating base paths (e.g., /api/v1)
    try {
      const backend = new URL(API_BASE_URL);
      return `${backend.origin}${trimmed}`;
    } catch {
      return trimmed;
    }
  }
}

// Get the public website URL for end-user review
export function getPublicWebsiteUrl(): string {
  // First try environment variable for public website URL
  if (process.env.NEXT_PUBLIC_WEBSITE_URL) {
    return process.env.NEXT_PUBLIC_WEBSITE_URL;
  }

  // Fallback: derive from API base URL by removing /api/v1
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || API_BASE_URL;
    const url = new URL(apiUrl);
    return url.origin;
  } catch {
    // Final fallback
    return "https://elaseel.org";
  }
}

// Get the public website URL from settings API
export async function getPublicWebsiteUrlFromSettings(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/setting`);
    const data = await response.json();

    if (data.status === "sucsess" && data.data?.website) {
      return data.data.website;
    }

    // Fallback to environment variable or default
    return getPublicWebsiteUrl();
  } catch (error) {
    console.error("Failed to fetch website URL from settings:", error);
    // Fallback to environment variable or default
    return getPublicWebsiteUrl();
  }
}
