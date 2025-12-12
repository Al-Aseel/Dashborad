import { useState, useEffect } from "react";
import axios from "axios";

export interface PublicSettings {
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
  contactNumber: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  whatsappNumber: string;
  website: string;
  description: string;
  mainColor: string;
}

export interface PublicSettingsResponse {
  status: string;
  data: PublicSettings;
  message: string;
}

export const usePublicSettings = () => {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const publicApiUrl =
        process.env.NEXT_PUBLIC_API_PUBLIC_URL ||
        "http://localhost:5000/api/v1";
      const response = await axios.get<PublicSettingsResponse>(
        `${publicApiUrl}/setting`
      );

      if (response.data.status === "sucsess" && response.data.data) {
        setSettings(response.data.data);
      } else {
        throw new Error("فشل في جلب إعدادات الموقع");
      }
    } catch (err: any) {
      console.error("Error fetching public settings:", err);
      const message =
        err?.response?.data?.message || "حدث خطأ في جلب إعدادات الموقع";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchPublicSettings,
  };
};
