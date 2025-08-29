import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_BASE_URL } from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
    return `${API_BASE_URL}${trimmed}`;
  }
}
