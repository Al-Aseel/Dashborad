"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Settings,
  UpdateSettingsRequest,
  ValidationError,
} from "@/lib/settings";
import { getSettings, updateSettings } from "@/lib/settings";
import { useToast } from "@/hooks/use-toast";

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
  validationErrors: ValidationError[];
  initialized: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: UpdateSettingsRequest) => Promise<Settings>;
  websiteName: string;
  websiteLogo: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error(
      "useSettingsContext must be used within a SettingsProvider"
    );
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [initialized, setInitialized] = useState(false);
  const [websiteName, setWebsiteName] = useState("جمعية أصيل");
  const [websiteLogo, setWebsiteLogo] = useState<string | null>(null);

  const { toast } = useToast();

  // جلب الإعدادات
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSettings();
      setSettings(data);

      // تحديث اسم الموقع وشعار الموقع
      if (data.websiteName_ar) {
        setWebsiteName(data.websiteName_ar);
      }

      if (data.websiteLogo?.url) {
        const host = "http://localhost:5000";
        const logoUrl = `${host}/${data.websiteLogo.url}`;
        setWebsiteLogo(logoUrl);
      }

      setInitialized(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "حدث خطأ في جلب الإعدادات");
      toast({
        title: "خطأ في جلب الإعدادات",
        description: err?.response?.data?.message || "حدث خطأ في جلب الإعدادات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // تحديث الإعدادات
  const updateSettingsData = async (newSettings: UpdateSettingsRequest) => {
    try {
      setUpdating(true);
      setError(null);
      setValidationErrors([]);

      const updatedSettings = await updateSettings(newSettings);

      // إعادة جلب البيانات الكاملة من الخادم لضمان التحديث الفوري
      await fetchSettings();

      toast({
        title: "تم حفظ الإعدادات",
        description: "تم تحديث الإعدادات بنجاح",
      });

      return updatedSettings;
    } catch (err: any) {
      // معالجة أخطاء التحقق من صحة البيانات
      if (err?.response?.data?.details) {
        console.log("Validation errors:", err.response.data.details);
        setValidationErrors(err.response.data.details);
        setError("خطأ في التحقق من صحة البيانات");
        // لا نعرض toast لأخطاء التحقق من صحة البيانات
      } else {
        setError(err?.message || "حدث خطأ في تحديث الإعدادات");
        // عرض toast للأخطاء العامة فقط (غير أخطاء التحقق من صحة البيانات)
        toast({
          title: "خطأ في حفظ الإعدادات",
          description: err?.message || "حدث خطأ في تحديث الإعدادات",
          variant: "destructive",
        });
      }
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // جلب الإعدادات عند تحميل المكون
  useEffect(() => {
    fetchSettings();
  }, []);

  const value: SettingsContextType = {
    settings,
    loading,
    updating,
    error,
    validationErrors,
    initialized,
    fetchSettings,
    updateSettings: updateSettingsData,
    websiteName,
    websiteLogo,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
