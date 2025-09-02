import { useEffect, useState } from "react";
import {
  getSystemSettings,
  updateSystemSettings,
  SystemSettings,
  UpdateSystemSettingsRequest,
  ValidationError,
} from "@/lib/system-settings";
import { useToast } from "@/hooks/use-toast";

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [initialized, setInitialized] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSystemSettings();
      setSettings(data);
      setInitialized(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "حدث خطأ في جلب إعدادات النظام");
      toast({
        title: "خطأ في جلب إعدادات النظام",
        description:
          err?.response?.data?.message || "حدث خطأ في جلب إعدادات النظام",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettingsData = async (
    newSettings: UpdateSystemSettingsRequest
  ) => {
    try {
      setUpdating(true);
      setError(null);
      setValidationErrors([]);

      const updated = await updateSystemSettings(newSettings);

      await fetchSettings();

      toast({
        title: "تم حفظ إعدادات النظام",
        description: "تم تحديث إعدادات النظام بنجاح",
      });

      return updated;
    } catch (err: any) {
      if (err?.response?.data?.details) {
        setValidationErrors(err.response.data.details);
        setError("خطأ في التحقق من صحة البيانات");
      } else {
        setError(err?.message || "حدث خطأ في تحديث إعدادات النظام");
        toast({
          title: "خطأ في حفظ إعدادات النظام",
          description: err?.message || "حدث خطأ في تحديث إعدادات النظام",
          variant: "destructive",
        });
      }
      throw err;
    } finally {
      setUpdating(false);
    }
  };

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
