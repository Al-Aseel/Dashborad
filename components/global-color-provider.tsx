"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLogoutRefetch } from "@/hooks/use-logout-refetch";

interface ColorContextType {
  mainColor: string;
  isColorLoading: boolean;
  colorError: string | null;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export const useGlobalColor = () => {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error("useGlobalColor must be used within a GlobalColorProvider");
  }
  return context;
};

interface GlobalColorProviderProps {
  children: React.ReactNode;
}

export const GlobalColorProvider: React.FC<GlobalColorProviderProps> = ({
  children,
}) => {
  const { settings, loading, error, refetch } = usePublicSettings();
  const [mainColor, setMainColor] = useState("#7C3AED"); // Default color
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Use logout refetch hook
  useLogoutRefetch(refetch);

  // Force refetch settings on every mount and when navigating to login
  useEffect(() => {
    const currentTime = Date.now();
    const timeSinceLastFetch = currentTime - lastFetchTime;

    // Always refetch if not initialized or if it's been more than 5 seconds
    if (!isInitialized || timeSinceLastFetch > 5000) {
      refetch();
      setIsInitialized(true);
      setLastFetchTime(currentTime);
    }
  }, [refetch, isInitialized, lastFetchTime]);

  // Listen for route changes to login page
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.location.pathname === "/login") {
        // Use setTimeout to avoid scheduling updates during render
        setTimeout(() => {
          setLastFetchTime(0); // Reset to force refetch
          refetch();
          setLastFetchTime(Date.now());
        }, 0);
      }
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", handleRouteChange);

    // Listen for pushstate/replacestate events
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      // Use setTimeout to avoid scheduling updates during render
      setTimeout(handleRouteChange, 0);
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      // Use setTimeout to avoid scheduling updates during render
      setTimeout(handleRouteChange, 0);
    };

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [refetch]);

  useEffect(() => {
    if (settings?.mainColor) {
      setMainColor(settings.mainColor);
    }
  }, [settings?.mainColor]);

  // Update CSS variables when mainColor changes
  useEffect(() => {
    const updateCSSVariables = (color: string) => {
      // Convert hex to RGB for better color manipulation
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : null;
      };

      // Create lighter and darker versions
      const createColorVariants = (color: string) => {
        const rgb = hexToRgb(color);
        if (!rgb) return { hover: color, dark: color, light: color };

        // Create hover color (lighter)
        const hoverR = Math.min(255, rgb.r + 20);
        const hoverG = Math.min(255, rgb.g + 20);
        const hoverB = Math.min(255, rgb.b + 20);
        const hover = `rgb(${hoverR}, ${hoverG}, ${hoverB})`;

        // Create dark color (darker)
        const darkR = Math.max(0, rgb.r - 30);
        const darkG = Math.max(0, rgb.g - 30);
        const darkB = Math.max(0, rgb.b - 30);
        const dark = `rgb(${darkR}, ${darkG}, ${darkB})`;

        // Create light color (very light)
        const lightR = Math.min(255, rgb.r + 50);
        const lightG = Math.min(255, rgb.g + 50);
        const lightB = Math.min(255, rgb.b + 50);
        const light = `rgb(${lightR}, ${lightG}, ${lightB})`;

        return { hover, dark, light };
      };

      const variants = createColorVariants(color);

      // Update CSS custom properties
      const root = document.documentElement;
      root.style.setProperty("--main-color", color);
      root.style.setProperty("--main-color-hover", variants.hover);
      root.style.setProperty("--main-color-dark", variants.dark);
      root.style.setProperty("--main-color-light", variants.light);

      // Update additional color variants for better theming
      root.style.setProperty("--primary", color);
      root.style.setProperty("--ring", color);
      root.style.setProperty("--sidebar-primary", color);
      root.style.setProperty("--sidebar-ring", color);
    };

    updateCSSVariables(mainColor);
  }, [mainColor]);

  const value: ColorContextType = {
    mainColor,
    isColorLoading: loading,
    colorError: error,
  };

  return (
    <ColorContext.Provider value={value}>{children}</ColorContext.Provider>
  );
};
