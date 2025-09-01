import { useState, useEffect } from "react";
import {
  getSettings,
  updateSettings,
  Settings,
  UpdateSettingsRequest,
  ValidationError,
} from "@/lib/settings";
import { useToast } from "@/hooks/use-toast";

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  // جلب الإعدادات
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSettings();
      setSettings(data);
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

  return {
    settings,
    loading,
    updating,
    error,
    validationErrors,
    initialized,
    fetchSettings,
    updateSettings: updateSettingsData,
  };
};
