import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export const useLogoutRefetch = (refetch: () => void) => {
  const router = useRouter();
  const isLoggingOut = useRef(false);

  useEffect(() => {
    // Listen for beforeunload to detect logout
    const handleBeforeUnload = () => {
      isLoggingOut.current = true;
    };

    // Listen for visibility change (when user switches tabs or comes back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isLoggingOut.current) {
        // User came back after potential logout, refetch data
        setTimeout(() => {
          refetch();
          isLoggingOut.current = false;
        }, 0);
      }
    };

    // Listen for focus events (when user comes back to the tab)
    const handleFocus = () => {
      if (isLoggingOut.current) {
        setTimeout(() => {
          refetch();
          isLoggingOut.current = false;
        }, 0);
      }
    };

    // Listen for storage events (when localStorage changes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token" && e.newValue === null) {
        // Token was removed, user logged out
        setTimeout(() => {
          refetch();
        }, 0);
      }
    };

    // Listen for custom logout events
    const handleLogout = () => {
      isLoggingOut.current = true;
      setTimeout(() => {
        refetch();
      }, 0);
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("logout", handleLogout);
    };
  }, [refetch]);

  // Function to trigger logout refetch manually
  const triggerLogoutRefetch = () => {
    isLoggingOut.current = true;
    refetch();
  };

  return { triggerLogoutRefetch };
};
