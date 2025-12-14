"use client";

import { DashboardLayout } from "@/components/shared/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DynamicButton } from "@/components/ui/dynamic-button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Save,
  Lock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAuthContext } from "@/components/auth-provider";
import { LogoutDialog } from "@/components/logout-dialog";
import { ChangePasswordForm } from "@/components/shared/change-password-form";
import { EditProfileForm } from "@/components/shared/edit-profile-form";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSettingsContext } from "@/components/settings-context";
import { UpdateSettingsRequest } from "@/lib/settings";
import { useSystemSettings } from "@/hooks/use-system-settings";
import { UpdateSystemSettingsRequest } from "@/lib/system-settings";
import { SettingsPageSkeleton } from "@/components/shared/settings-page-skeleton";
import { LoadingOverlay } from "@/components/shared/loading-overlay";
import { ErrorState } from "@/components/shared/error-state";
import { InitialLoadingSkeleton } from "@/components/shared/initial-loading-skeleton";
import { RefreshButton } from "@/components/shared/refresh-button";
import { ValidationErrors } from "@/components/shared/validation-errors";
import { LogoUpload } from "@/components/shared/logo-upload";

export default function SettingsPage() {
  const { logoutAllDevices } = useAuthContext();
  const { user, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);

  // Redirect only for roles below subadmin (e.g., technical), allow subadmin read-only
  useEffect(() => {
    if (isAuthenticated && user && user.role) {
      const role = String(user.role);
      const isAllowed =
        role === "subadmin" || role === "admin" || role === "superadmin";
      if (!isAllowed) {
        try {
          if (typeof window !== "undefined" && document.referrer) {
            const sameOrigin =
              new URL(document.referrer).origin === window.location.origin;
            if (sameOrigin) {
              router.back();
              return;
            }
          }
        } catch {}
        router.push("/");
      }
    }
  }, [isAuthenticated, user]);

  // استخدام hook الإعدادات
  const {
    settings,
    loading,
    updating,
    updateSettings,
    initialized,
    error,
    validationErrors,
    fetchSettings,
  } = useSettingsContext();

  // للتأكد من وصول الأخطاء
  console.log("Settings page validationErrors:", validationErrors);

  // حالة النموذج
  const [formData, setFormData] = useState<UpdateSettingsRequest>({
    mainColor: "#3B82F6",
    websiteName_ar: "",
    websiteName_en: "",
    websiteLogo: null,
    contactNumber: "",
    email: "",
    address: "",
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    whatsappNumber: "",
    website: "",
    description: "",
    workingHours: "",
    aboutUs_ar: "",
    vision_ar: "",
    mission_ar: "",
  });
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);

  // System settings state & logic
  const {
    settings: systemSettings,
    loading: sysLoading,
    updating: sysUpdating,
    updateSettings: updateSystemSettings,
    initialized: sysInitialized,
    error: sysError,
    validationErrors: sysValidationErrors,
    fetchSettings: fetchSystemSettings,
  } = useSystemSettings();

  const [systemForm, setSystemForm] = useState<UpdateSystemSettingsRequest>({
    maxSizeAllowedForFilesInMB: 10,
    typesOfImagesAllowed: ".jpg,.png,.gif,.jpeg,.webp",
    typesOfFilesAllowed: ".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar",
    timeToDeleteTempFile: "daily",
    maxFilesPerUpload: 10,
    enableFileCompression: false,
    tempFileRetentionHours: 24,
    systemMaintenanceMode: false,
    maintenanceMessage: "النظام تحت الصيانة، يرجى المحاولة لاحقاً",
  });

  useEffect(() => {
    if (systemSettings) {
      setSystemForm({
        maxSizeAllowedForFilesInMB:
          systemSettings.maxSizeAllowedForFilesInMB ?? 10,
        typesOfImagesAllowed: systemSettings.typesOfImagesAllowed ?? "",
        typesOfFilesAllowed: systemSettings.typesOfFilesAllowed ?? "",
        timeToDeleteTempFile: systemSettings.timeToDeleteTempFile,
        maxFilesPerUpload: systemSettings.maxFilesPerUpload ?? 10,
        enableFileCompression: systemSettings.enableFileCompression ?? false,
        tempFileRetentionHours: systemSettings.tempFileRetentionHours ?? 24,
        systemMaintenanceMode: systemSettings.systemMaintenanceMode ?? false,
        maintenanceMessage: systemSettings.maintenanceMessage ?? "",
      });
    }
  }, [systemSettings]);

  const handleSystemChange = (
    field: keyof UpdateSystemSettingsRequest,
    value: string | number | boolean
  ) => {
    setSystemForm((prev) => ({ ...prev, [field]: value as any }));
  };

  // تحديث النموذج عند تحميل الإعدادات
  useEffect(() => {
    if (settings) {
      // استخراج imageId و URL من websiteLogo object
      let websiteLogoId = null;
      let websiteLogoUrl = null;
      if (settings.websiteLogo && typeof settings.websiteLogo === "object") {
        websiteLogoId = settings.websiteLogo._id;
        const host = process.env.NEXT_PUBLIC_API_HOST;
        websiteLogoUrl = `${host}/${settings.websiteLogo.url}`;
      }

      setFormData({
        mainColor: settings.mainColor || "#3B82F6",
        websiteName_ar: settings.websiteName_ar || "",
        websiteName_en: settings.websiteName_en || "",
        websiteLogo: websiteLogoId,
        contactNumber: settings.contactNumber || "",
        email: settings.email || "",
        address: settings.address || "",
        facebook: settings.facebook || "",
        instagram: settings.instagram || "",
        twitter: settings.twitter || "",
        youtube: settings.youtube || "",
        whatsappNumber: settings.whatsappNumber || "",
        website: settings.website || "",
        description: settings.description || "",
        workingHours: settings.workingHours || "",
        aboutUs_ar: settings.aboutUs_ar || "",
        vision_ar: settings.vision_ar || "",
        mission_ar: settings.mission_ar || "",
      });

      // حفظ URL الصورة
      setLogoImageUrl(websiteLogoUrl);
    }
  }, [settings]);

  // معالج تغيير الحقول
  const handleInputChange = (
    field: keyof UpdateSettingsRequest,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // معالج حفظ الإعدادات
  const handleSaveSettings = async () => {
    // Validate required fields
    if (!formData.aboutUs_ar?.trim()) {
      toast({
        title: "خطأ في التحقق",
        description: "حقل 'من نحن' مطلوب ولا يمكن تركه فارغاً",
        variant: "destructive",
      });
      return;
    }
    if (!formData.vision_ar?.trim()) {
      toast({
        title: "خطأ في التحقق",
        description: "حقل 'رؤيتنا' مطلوب ولا يمكن تركه فارغاً",
        variant: "destructive",
      });
      return;
    }
    if (!formData.mission_ar?.trim()) {
      toast({
        title: "خطأ في التحقق",
        description: "حقل 'رسالتنا' مطلوب ولا يمكن تركه فارغاً",
        variant: "destructive",
      });
      return;
    }
    
    // Validate max length
    if (formData.aboutUs_ar.length > 2000) {
      toast({
        title: "خطأ في التحقق",
        description: "حقل 'من نحن' يجب ألا يتجاوز 2000 حرف",
        variant: "destructive",
      });
      return;
    }
    if (formData.vision_ar.length > 2000) {
      toast({
        title: "خطأ في التحقق",
        description: "حقل 'رؤيتنا' يجب ألا يتجاوز 2000 حرف",
        variant: "destructive",
      });
      return;
    }
    if (formData.mission_ar.length > 2000) {
      toast({
        title: "خطأ في التحقق",
        description: "حقل 'رسالتنا' يجب ألا يتجاوز 2000 حرف",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isAdmin) {
        await updateSettings(formData);
      }
    } catch (error) {
      // الخطأ يتم التعامل معه في hook
    }
  };
  // عرض skeleton عند التحميل الأولي
  if (loading && !initialized) {
    return (
      <DashboardLayout>
        <InitialLoadingSkeleton />
      </DashboardLayout>
    );
  }

  // عرض حالة الخطأ
  if (error && !settings) {
    return (
      <DashboardLayout>
        <ErrorState
          title="خطأ في تحميل الإعدادات"
          message={error}
          onRetry={fetchSettings}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
            <p className="text-gray-600 mt-2">إدارة إعدادات النظام والحساب</p>
          </div>
          <RefreshButton
            onRefresh={fetchSettings}
            loading={loading}
            variant="outline"
            size="sm"
          />
        </div>

        <Tabs defaultValue="general" className="space-y-6 relative">
          <LoadingOverlay
            isLoading={updating}
            message="جاري حفظ الإعدادات..."
            className="rounded-lg"
            size="lg"
          />
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-[var(--main-color)] data-[state=active]:text-white"
            >
              عام
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-[var(--main-color)] data-[state=active]:text-white"
            >
              الملف الشخصي
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-[var(--main-color)] data-[state=active]:text-white"
            >
              الأمان
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="data-[state=active]:bg-[var(--main-color)] data-[state=active]:text-white"
            >
              النظام
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DynamicIcon icon={Settings} className="w-5 h-5" />
                      الإعدادات العامة
                    </CardTitle>
                    <CardDescription>
                      إعدادات الموقع والمعلومات الأساسية
                    </CardDescription>
                  </div>
                  <RefreshButton
                    onRefresh={fetchSettings}
                    loading={loading}
                    variant="ghost"
                    size="sm"
                  />
                </div>
              </CardHeader>
              <CardContent dir="rtl" className="space-y-4 text-right">
                {/* اسم الموقع (عربي/إنجليزي) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-name-ar">اسم الموقع (عربي)</Label>
                    <Input
                      id="site-name-ar"
                      value={formData.websiteName_ar || ""}
                      onChange={(e) =>
                        handleInputChange("websiteName_ar", e.target.value)
                      }
                      placeholder="اسم الموقع بالعربية"
                      disabled={!isAdmin}
                    />
                    <ValidationErrors
                      errors={validationErrors}
                      fieldName="websiteName_ar"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-name-en">اسم الموقع (إنجليزي)</Label>
                    <Input
                      id="site-name-en"
                      dir="ltr"
                      className="text-left"
                      value={formData.websiteName_en || ""}
                      onChange={(e) =>
                        handleInputChange("websiteName_en", e.target.value)
                      }
                      placeholder="Website name in English"
                      disabled={!isAdmin}
                    />
                    <ValidationErrors
                      errors={validationErrors}
                      fieldName="websiteName_en"
                    />
                  </div>
                </div>

                {/* اللون الأساسي للموقع */}
                <div className="space-y-6">
                  <div className="text-center">
                    <Label
                      htmlFor="main-color"
                      className="text-xl font-bold text-gray-800 mb-2 block"
                    >
                      🎨 اللون الأساسي للموقع
                    </Label>
                    <p className="text-gray-600 text-sm">
                      اختر اللون الذي يمثل هوية موقعك وسيتم تطبيقه على جميع
                      العناصر
                    </p>
                  </div>

                  {/* معاينة مركزية كبيرة */}
                  <div className="flex justify-center">
                    <div className="relative group">
                      <div
                        className="w-32 h-32 rounded-3xl shadow-2xl border-8 border-white ring-4 ring-gray-100 flex items-center justify-center transition-all duration-500 hover:scale-110 hover:shadow-3xl"
                        style={{
                          backgroundColor: formData.mainColor || "#3B82F6",
                          boxShadow: `0 25px 50px -12px ${
                            formData.mainColor || "#3B82F6"
                          }40`,
                        }}
                      >
                        <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm">
                          <div className="w-8 h-8 rounded-full bg-white shadow-lg"></div>
                        </div>
                      </div>

                      {/* مؤشر اللون المختار */}
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>

                      {/* رمز اللون */}
                      <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200">
                        <span className="text-xs font-bold text-gray-700">
                          🎯
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* معلومات اللون مع اسم اللون */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-100 rounded-full">
                      <div
                        className="w-5 h-5 rounded-full shadow-sm"
                        style={{
                          backgroundColor: formData.mainColor || "#3B82F6",
                        }}
                      ></div>
                      <span className="text-base font-medium text-gray-700">
                        اللون المختار:{" "}
                        {(() => {
                          const selectedColor = [
                            { color: "#3B82F6", name: "أزرق" },
                            { color: "#10B981", name: "أخضر" },
                            { color: "#EF4444", name: "أحمر" },
                            { color: "#F59E0B", name: "أصفر" },
                            { color: "#8B5CF6", name: "بنفسجي" },
                            { color: "#F97316", name: "برتقالي" },
                            { color: "#06B6D4", name: "سماوي" },
                            { color: "#EC4899", name: "وردي" },
                            { color: "#059669", name: "أخضر غامق" },
                            { color: "#DC2626", name: "أحمر غامق" },
                            { color: "#7C3AED", name: "بنفسجي غامق" },
                            { color: "#EA580C", name: "برتقالي غامق" },
                          ].find(
                            (item) =>
                              item.color === (formData.mainColor || "#3B82F6")
                          );
                          return selectedColor
                            ? `${selectedColor.name} (${
                                formData.mainColor || "#3B82F6"
                              })`
                            : "اختر اللون";
                        })()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      💡 سيتم تطبيق هذا اللون على جميع عناصر الموقع
                    </p>
                  </div>

                  {/* معاينة سريعة للألوان */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-600">
                        اختر من الألوان المتاحة
                      </h4>
                    </div>
                    <div className="flex justify-center">
                      <div className="grid grid-cols-6 gap-2 max-w-xs">
                        {[
                          "#3B82F6",
                          "#10B981",
                          "#EF4444",
                          "#F59E0B",
                          "#8B5CF6",
                          "#F97316",
                          "#06B6D4",
                          "#EC4899",
                          "#059669",
                          "#DC2626",
                          "#7C3AED",
                          "#EA580C",
                        ].map((color) => (
                          <button
                            key={color}
                            onClick={() =>
                              handleInputChange("mainColor", color)
                            }
                            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                              formData.mainColor === color
                                ? "scale-110 shadow-lg"
                                : "border-gray-200 hover:border-gray-300 hover:scale-105"
                            }`}
                            style={{
                              backgroundColor: color,
                              borderColor:
                                formData.mainColor === color
                                  ? formData.mainColor
                                  : undefined,
                            }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <ValidationErrors
                    errors={validationErrors}
                    fieldName="mainColor"
                  />
                </div>

                {/* رقم الهاتف / البريد الإلكتروني */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      dir="ltr"
                      className="text-left"
                      value={formData.contactNumber || ""}
                      onChange={(e) =>
                        handleInputChange("contactNumber", e.target.value)
                      }
                      placeholder="+970 8 123 4567"
                      disabled={!isAdmin}
                    />
                    <ValidationErrors
                      errors={validationErrors}
                      fieldName="contactNumber"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      dir="ltr"
                      className="text-left"
                      value={formData.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="info@aseel.org"
                      disabled={!isAdmin}
                    />
                    <ValidationErrors
                      errors={validationErrors}
                      fieldName="email"
                    />
                  </div>
                </div>

                {/* رقم الواتساب */}
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">رقم الواتساب</Label>
                  <Input
                    id="whatsapp"
                    dir="ltr"
                    className="text-left"
                    value={formData.whatsappNumber || ""}
                    onChange={(e) =>
                      handleInputChange("whatsappNumber", e.target.value)
                    }
                    placeholder="+970 59 123 4567"
                    disabled={!isAdmin}
                  />
                  <ValidationErrors
                    errors={validationErrors}
                    fieldName="whatsappNumber"
                  />
                </div>

                {/* العنوان */}
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="غزة، فلسطين"
                    disabled={!isAdmin}
                  />
                  <ValidationErrors
                    errors={validationErrors}
                    fieldName="address"
                  />
                </div>

                {/* الموقع الإلكتروني */}
                <div className="space-y-2">
                  <Label htmlFor="website">الموقع الإلكتروني</Label>
                  <Input
                    id="website"
                    dir="ltr"
                    className="text-left"
                    value={formData.website || ""}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    placeholder="https://aseel.org"
                    disabled={!isAdmin}
                  />
                  <ValidationErrors
                    errors={validationErrors}
                    fieldName="website"
                  />
                </div>

                {/* مواعيد العمل */}
                <div className="space-y-2">
                  <Label htmlFor="workingHours">مواعيد عمل المؤسسة</Label>
                  <Input
                    id="workingHours"
                    value={formData.workingHours || ""}
                    onChange={(e) =>
                      handleInputChange("workingHours", e.target.value)
                    }
                    placeholder="مثال: من الأحد إلى الخميس: 9:00 ص - 5:00 م"
                    disabled={!isAdmin}
                  />
                  <ValidationErrors
                    errors={validationErrors}
                    fieldName="workingHours"
                  />
                </div>

                {/* شعار الموقع */}
                <div className="space-y-2">
                  <LogoUpload
                    value={formData.websiteLogo}
                    imageUrl={logoImageUrl}
                    onChange={(value) =>
                      handleInputChange("websiteLogo", value || "")
                    }
                    onError={(error) => {
                      toast({
                        title: "خطأ في رفع الصورة",
                        description: error,
                        variant: "destructive",
                      });
                    }}
                    disabled={updating || !isAdmin}
                  />
                  <ValidationErrors
                    errors={validationErrors}
                    fieldName="websiteLogo"
                  />
                </div>

                {/* وصف الجمعية */}
                <div className="space-y-2">
                  <Label htmlFor="description">وصف الجمعية</Label>
                  <Textarea
                    id="description"
                    placeholder="اكتب وصفًا مختصرًا عن الجمعية ورسالتها وأهدافها"
                    value={formData.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    disabled={!isAdmin}
                  />
                  <ValidationErrors
                    errors={validationErrors}
                    fieldName="description"
                  />
                </div>

                {/* من نحن */}
                <div className="space-y-2">
                  <Label htmlFor="aboutUs_ar">
                    من نحن <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="aboutUs_ar"
                    placeholder="اكتب نص 'من نحن' بالعربية"
                    value={formData.aboutUs_ar || ""}
                    onChange={(e) =>
                      handleInputChange("aboutUs_ar", e.target.value)
                    }
                    disabled={!isAdmin}
                    maxLength={2000}
                    rows={6}
                    className="resize-y"
                  />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {formData.aboutUs_ar?.length || 0} / 2000 حرف
                    </span>
                    {!formData.aboutUs_ar?.trim() && (
                      <span className="text-red-500">هذا الحقل مطلوب</span>
                    )}
                  </div>
                  <ValidationErrors
                    errors={validationErrors}
                    fieldName="aboutUs_ar"
                  />
                </div>

                {/* رؤيتنا */}
                <div className="space-y-2">
                  <Label htmlFor="vision_ar">
                    رؤيتنا <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="vision_ar"
                    placeholder="اكتب نص 'رؤيتنا' بالعربية"
                    value={formData.vision_ar || ""}
                    onChange={(e) =>
                      handleInputChange("vision_ar", e.target.value)
                    }
                    disabled={!isAdmin}
                    maxLength={2000}
                    rows={6}
                    className="resize-y"
                  />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {formData.vision_ar?.length || 0} / 2000 حرف
                    </span>
                    {!formData.vision_ar?.trim() && (
                      <span className="text-red-500">هذا الحقل مطلوب</span>
                    )}
                  </div>
                  <ValidationErrors
                    errors={validationErrors}
                    fieldName="vision_ar"
                  />
                </div>

                {/* رسالتنا */}
                <div className="space-y-2">
                  <Label htmlFor="mission_ar">
                    رسالتنا <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="mission_ar"
                    placeholder="اكتب نص 'رسالتنا' بالعربية"
                    value={formData.mission_ar || ""}
                    onChange={(e) =>
                      handleInputChange("mission_ar", e.target.value)
                    }
                    disabled={!isAdmin}
                    maxLength={2000}
                    rows={6}
                    className="resize-y"
                  />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {formData.mission_ar?.length || 0} / 2000 حرف
                    </span>
                    {!formData.mission_ar?.trim() && (
                      <span className="text-red-500">هذا الحقل مطلوب</span>
                    )}
                  </div>
                  <ValidationErrors
                    errors={validationErrors}
                    fieldName="mission_ar"
                  />
                </div>

                {/* روابط السوشيال */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      dir="ltr"
                      className="text-left"
                      value={formData.facebook || ""}
                      onChange={(e) =>
                        handleInputChange("facebook", e.target.value)
                      }
                      placeholder="https://facebook.com/aseel.org"
                    />
                    <ValidationErrors
                      errors={validationErrors}
                      fieldName="facebook"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      dir="ltr"
                      className="text-left"
                      value={formData.twitter || ""}
                      onChange={(e) =>
                        handleInputChange("twitter", e.target.value)
                      }
                      placeholder="https://twitter.com/aseel_org"
                    />
                    <ValidationErrors
                      errors={validationErrors}
                      fieldName="twitter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      dir="ltr"
                      className="text-left"
                      value={formData.instagram || ""}
                      onChange={(e) =>
                        handleInputChange("instagram", e.target.value)
                      }
                      placeholder="https://instagram.com/aseel_org"
                    />
                    <ValidationErrors
                      errors={validationErrors}
                      fieldName="instagram"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      dir="ltr"
                      className="text-left"
                      value={formData.youtube || ""}
                      onChange={(e) =>
                        handleInputChange("youtube", e.target.value)
                      }
                      placeholder="https://youtube.com/@aseel"
                    />
                    <ValidationErrors
                      errors={validationErrors}
                      fieldName="youtube"
                    />
                  </div>
                </div>

                <DynamicButton
                  onClick={handleSaveSettings}
                  disabled={updating || !isAdmin}
                  className="w-full md:w-auto"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      حفظ الإعدادات
                      <Save className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    </>
                  )}
                </DynamicButton>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <EditProfileForm />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <ChangePasswordForm />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DynamicIcon icon={Database} className="w-5 h-5" />
                      إعدادات النظام
                    </CardTitle>
                    <CardDescription>إعدادات النظام والتطبيق</CardDescription>
                  </div>
                  <RefreshButton
                    onRefresh={fetchSystemSettings}
                    loading={sysLoading}
                    variant="ghost"
                    size="sm"
                  />
                </div>
              </CardHeader>
              <CardContent dir="ltr" className="space-y-5 text-right">
                {/* الحد الأقصى لحجم الملف */}
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 ">
                  <Label htmlFor="max-file" className="md:order-2">
                    الحد الأقصى لحجم الملف (MB)
                  </Label>
                  <Input
                    id="max-file"
                    type="number"
                    min={1}
                    max={1000}
                    value={systemForm.maxSizeAllowedForFilesInMB}
                    onChange={(e) =>
                      handleSystemChange(
                        "maxSizeAllowedForFilesInMB",
                        Number(e.target.value)
                      )
                    }
                    dir="ltr"
                    className="text-left md:order-1"
                    disabled={!isAdmin}
                  />
                </div>
                <ValidationErrors
                  errors={sysValidationErrors}
                  fieldName="maxSizeAllowedForFilesInMB"
                />

                {/* أنواع الصور المسموحه */}
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                  <Label htmlFor="allowed-image-types" className="md:order-2">
                    أنواع الصور المسموحه
                  </Label>
                  <Input
                    id="allowed-image-types"
                    placeholder=".jpg,.png,.gif,.jpeg,.webp"
                    value={systemForm.typesOfImagesAllowed}
                    onChange={(e) =>
                      handleSystemChange("typesOfImagesAllowed", e.target.value)
                    }
                    dir="ltr"
                    className="text-left md:order-1"
                    disabled={!isAdmin}
                  />
                </div>
                <ValidationErrors
                  errors={sysValidationErrors}
                  fieldName="typesOfImagesAllowed"
                />

                {/* أنواع الملفات المسموحه */}
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                  <Label htmlFor="allowed-file-types" className="md:order-2">
                    أنواع الملفات المسموحه
                  </Label>
                  <Input
                    id="allowed-file-types"
                    placeholder=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                    value={systemForm.typesOfFilesAllowed}
                    onChange={(e) =>
                      handleSystemChange("typesOfFilesAllowed", e.target.value)
                    }
                    dir="ltr"
                    className="text-left md:order-1"
                    disabled={!isAdmin}
                  />
                </div>
                <ValidationErrors
                  errors={sysValidationErrors}
                  fieldName="typesOfFilesAllowed"
                />

                {/* إعدادات الأداء */}
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">إعدادات الأداء</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Switch
                        id="image-opt"
                        checked={!!systemForm.enableFileCompression}
                        onCheckedChange={(v) =>
                          handleSystemChange("enableFileCompression", !!v)
                        }
                        disabled={!isAdmin}
                      />
                      <span className="text-sm">
                        ضغط الملفات/الصور تلقائياً عند الرفع
                      </span>
                    </div>
                    <span className="hidden md:block"></span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                    <Select
                      value={systemForm.timeToDeleteTempFile}
                      onValueChange={(v) =>
                        handleSystemChange(
                          "timeToDeleteTempFile",
                          v as UpdateSystemSettingsRequest["timeToDeleteTempFile"]
                        )
                      }
                      disabled={!isAdmin}
                    >
                      <SelectTrigger id="cleanup-schedule" className="w-full">
                        <SelectValue placeholder="اختر الجدولة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">يوميًا</SelectItem>
                        <SelectItem value="weekly">أسبوعيًا</SelectItem>
                        <SelectItem value="monthly">شهريًا</SelectItem>
                      </SelectContent>
                    </Select>
                    <Label htmlFor="cleanup-schedule">
                      حذف الملفات المؤقتة دوريًا
                    </Label>
                  </div>
                  <ValidationErrors
                    errors={sysValidationErrors}
                    fieldName="timeToDeleteTempFile"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                    <Label htmlFor="max-files" className="md:order-2">
                      الحد الأقصى لعدد الملفات بالرفع الواحد
                    </Label>
                    <Input
                      id="max-files"
                      type="number"
                      min={1}
                      max={100}
                      value={systemForm.maxFilesPerUpload ?? 10}
                      onChange={(e) =>
                        handleSystemChange(
                          "maxFilesPerUpload",
                          Number(e.target.value)
                        )
                      }
                      dir="ltr"
                      className="text-left md:order-1"
                      disabled={!isAdmin}
                    />
                  </div>
                  <ValidationErrors
                    errors={sysValidationErrors}
                    fieldName="maxFilesPerUpload"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                    <Label htmlFor="temp-retention" className="md:order-2">
                      مدة الاحتفاظ بالملفات المؤقتة (ساعات)
                    </Label>
                    <Input
                      id="temp-retention"
                      type="number"
                      min={1}
                      max={8760}
                      value={systemForm.tempFileRetentionHours ?? 24}
                      onChange={(e) =>
                        handleSystemChange(
                          "tempFileRetentionHours",
                          Number(e.target.value)
                        )
                      }
                      dir="ltr"
                      className="text-left md:order-1"
                      disabled={!isAdmin}
                    />
                  </div>
                  <ValidationErrors
                    errors={sysValidationErrors}
                    fieldName="tempFileRetentionHours"
                  />
                </div>

                {/* وضع الصيانة */}
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">وضع الصيانة</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Switch
                        id="maintenance-mode"
                        checked={!!systemForm.systemMaintenanceMode}
                        onCheckedChange={(v) =>
                          handleSystemChange("systemMaintenanceMode", !!v)
                        }
                        disabled={!isAdmin}
                      />
                      <span className="text-sm">تفعيل وضع الصيانة</span>
                    </div>
                    <span className="hidden md:block"></span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-message">رسالة الصيانة</Label>
                    <Textarea
                      id="maintenance-message"
                      value={systemForm.maintenanceMessage ?? ""}
                      onChange={(e) =>
                        handleSystemChange("maintenanceMessage", e.target.value)
                      }
                      placeholder="النظام تحت الصيانة، يرجى المحاولة لاحقاً"
                      disabled={!isAdmin}
                    />
                    <ValidationErrors
                      errors={sysValidationErrors}
                      fieldName="maintenanceMessage"
                    />
                  </div>
                </div>

                <DynamicButton
                  onClick={async () => {
                    try {
                      if (isAdmin) {
                        await updateSystemSettings(systemForm);
                      }
                    } catch {}
                  }}
                  disabled={sysUpdating || !isAdmin}
                  className="w-full md:w-auto"
                >
                  {sysUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      حفظ الإعدادات
                      <Save className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    </>
                  )}
                </DynamicButton>

                {/* Logout from all devices */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <p className="font-medium">
                        تسجيل الخروج من جميع الأجهزة
                      </p>
                      <p className="text-sm text-gray-600">
                        سيتم إنهاء الجلسات المفتوحة على جميع الأجهزة والحسابات
                        المرتبطة.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setShowLogoutAllConfirm(true)}
                      disabled={isLoggingOutAll}
                    >
                      {isLoggingOutAll
                        ? "جاري التنفيذ..."
                        : "تسجيل الخروج الكلي"}
                    </Button>
                    <LogoutDialog
                      isOpen={showLogoutAllConfirm}
                      onClose={() => setShowLogoutAllConfirm(false)}
                      onConfirm={async () => {
                        setShowLogoutAllConfirm(false);
                        try {
                          setIsLoggingOutAll(true);
                          await logoutAllDevices();
                          toast({
                            title: "تم تسجيل الخروج من جميع الأجهزة",
                            description: "تم إنهاء جميع الجلسات بنجاح",
                          });
                        } catch {
                          toast({
                            title: "فشل تسجيل الخروج الكلي",
                            description: "حدث خطأ، حاول مرة أخرى",
                            variant: "destructive",
                          });
                        } finally {
                          setIsLoggingOutAll(false);
                        }
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
