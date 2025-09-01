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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useSettings } from "@/hooks/use-settings";
import { UpdateSettingsRequest } from "@/lib/settings";
import { SettingsPageSkeleton } from "@/components/shared/settings-page-skeleton";
import { LoadingOverlay } from "@/components/shared/loading-overlay";
import { ErrorState } from "@/components/shared/error-state";
import { InitialLoadingSkeleton } from "@/components/shared/initial-loading-skeleton";
import { RefreshButton } from "@/components/shared/refresh-button";
import { ValidationErrors } from "@/components/shared/validation-errors";
import { LogoUpload } from "@/components/shared/logo-upload";

export default function SettingsPage() {
  const { logoutAllDevices } = useAuthContext();
  const { toast } = useToast();
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);

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
  } = useSettings();

  // للتأكد من وصول الأخطاء
  console.log("Settings page validationErrors:", validationErrors);

  // حالة النموذج
  const [formData, setFormData] = useState<UpdateSettingsRequest>({});
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);

  // تحديث النموذج عند تحميل الإعدادات
  useEffect(() => {
    if (settings) {
      // استخراج imageId و URL من websiteLogo object
      let websiteLogoId = null;
      let websiteLogoUrl = null;
      if (settings.websiteLogo && typeof settings.websiteLogo === "object") {
        websiteLogoId = settings.websiteLogo._id;
        // بناء URL الصورة من host + url من الاستجابة
        const host = "http://localhost:5000"; // من API_BASE_URL
        websiteLogoUrl = `${host}/${settings.websiteLogo.url}`;
      }

      setFormData({
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
    try {
      await updateSettings(formData);
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
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="system">النظام</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
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
                    />
                    <ValidationErrors
                      errors={validationErrors}
                      fieldName="websiteName_en"
                    />
                  </div>
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
                  />
                  <ValidationErrors
                    errors={validationErrors}
                    fieldName="website"
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
                    disabled={updating}
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
                  />
                  <ValidationErrors
                    errors={validationErrors}
                    fieldName="description"
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

                <Button
                  onClick={handleSaveSettings}
                  disabled={updating}
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
                </Button>
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
                      <Database className="w-5 h-5" />
                      إعدادات النظام
                    </CardTitle>
                    <CardDescription>إعدادات النظام والتطبيق</CardDescription>
                  </div>
                  <RefreshButton
                    onRefresh={fetchSettings}
                    loading={loading}
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
                    placeholder="10"
                    defaultValue="10"
                    dir="ltr"
                    className="text-left md:order-1"
                  />
                </div>

                {/* أنواع الملفات المسموحه */}
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                  <Label htmlFor="allowed-types" className="md:order-2">
                    أنواع الملفات المسموحه
                  </Label>
                  <Input
                    id="allowed-types"
                    placeholder="jpg,jpeg,png,pdf,doc,docx"
                    defaultValue="jpg,jpeg,png,pdf,doc,docx"
                    dir="ltr"
                    className="text-left md:order-1"
                  />
                </div>

                {/* تمت إزالة اللغة الافتراضية والمنطقة الزمنية وتنسيق التاريخ والعملة */}

                {/* إعدادات الأداء */}
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">إعدادات الأداء</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Switch id="image-opt" />
                      <span className="text-sm">
                        ضغط الصور تلقائياً عند الرفع
                      </span>
                    </div>
                    <span className="hidden md:block"></span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                    <Select defaultValue="weekly">
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
                </div>

                <Button className="w-full md:w-auto">
                  حفظ الإعدادات
                  <Save className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                </Button>

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
