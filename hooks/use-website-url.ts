import { useState, useEffect } from "react";
import { getPublicWebsiteUrlFromSettings } from "@/lib/utils";

export const useWebsiteUrl = () => {
  const [websiteUrl, setWebsiteUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWebsiteUrl = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const url = await getPublicWebsiteUrlFromSettings();
        setWebsiteUrl(url);
      } catch (err) {
        console.error("Error fetching website URL:", err);
        setError("Failed to fetch website URL");
        // Set fallback URL
        setWebsiteUrl("https://elaseel.org");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebsiteUrl();
  }, []);

  return {
    websiteUrl,
    isLoading,
    error,
    refetch: async () => {
      try {
        setIsLoading(true);
        setError(null);
        const url = await getPublicWebsiteUrlFromSettings();
        setWebsiteUrl(url);
      } catch (err) {
        console.error("Error refetching website URL:", err);
        setError("Failed to fetch website URL");
      } finally {
        setIsLoading(false);
      }
    },
  };
};
