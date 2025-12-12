import { useEffect, useState } from "react";
import {
  getSystemSettings,
  updateSystemSettings,
  SystemSettings,
  UpdateSystemSettingsRequest,
  ValidationError,
} from "@/lib/system-settings";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/components/auth-provider";

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
  const { user } = useAuthContext();
  const isSubadmin = (user?.role || "").toString() === "subadmin";

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      // Avoid calling the endpoint for subadmin to prevent 401 from backend
      if (isSubadmin) {
        setInitialized(true);
        return;
      }
      const data = await getSystemSettings();
      setSettings(data);
      setInitialized(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "حدث خطأ في جلب إعدادات النظام";
      if (isSubadmin) {
        setError(null);
      } else {
        setError(message);
        toast({
          title: "خطأ في جلب إعدادات النظام",
          description: message,
          variant: "destructive",
        });
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubadmin]);

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
