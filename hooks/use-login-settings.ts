import { useState, useEffect } from "react";
import axios from "axios";

export interface LoginSettings {
  websiteName_ar: string;
  websiteName_en: string;
  websiteLogo: {
    _id: string;
    url: string;
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
  } | null;
  mainColor: string;
}

export interface LoginSettingsResponse {
  status: string;
  data: LoginSettings;
  message: string;
}

export const useLoginSettings = () => {
  const [settings, setSettings] = useState<LoginSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoginSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const publicApiUrl =
        process.env.NEXT_PUBLIC_API_PUBLIC_URL ||
        "http://localhost:5000/api/v1";
      const response = await axios.get<LoginSettingsResponse>(
        `${publicApiUrl}/setting`
      );

      if (response.data.status === "sucsess" && response.data.data) {
        setSettings(response.data.data);
      } else {
        throw new Error("فشل في جلب إعدادات الموقع");
      }
    } catch (err: any) {
      console.error("Error fetching login settings:", err);
      const message =
        err?.response?.data?.message || "حدث خطأ في جلب إعدادات الموقع";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings on every mount and when logout occurs
  useEffect(() => {
    fetchLoginSettings();
  }, []);

  // Listen for logout events to refetch
  useEffect(() => {
    const handleLogout = () => {
      // Use setTimeout to avoid scheduling updates during render
      setTimeout(() => {
        fetchLoginSettings();
      }, 0);
    };

    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("logout", handleLogout);
    };
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchLoginSettings,
  };
};
