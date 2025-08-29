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
} from "lucide-react";
import { useAuthContext } from "@/components/auth-provider";
import { LogoutDialog } from "@/components/logout-dialog";
import { ChangePasswordForm } from "@/components/shared/change-password-form";
import { EditProfileForm } from "@/components/shared/edit-profile-form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { logoutAllDevices } = useAuthContext();
  const { toast } = useToast();
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
          <p className="text-gray-600 mt-2">إدارة إعدادات النظام والحساب</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="system">النظام</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  الإعدادات العامة
                </CardTitle>
                <CardDescription>
                  إعدادات الموقع والمعلومات الأساسية
                </CardDescription>
              </CardHeader>
              <CardContent dir="rtl" className="space-y-4 text-right">
                {/* اسم الموقع (عربي/إنجليزي) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-name-ar">اسم الموقع (عربي)</Label>
                    <Input
                      id="site-name-ar"
                      defaultValue="جمعية أصيل للتنمية الخيرية"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-name-en">اسم الموقع (إنجليزي)</Label>
                    <Input
                      id="site-name-en"
                      dir="ltr"
                      className="text-left"
                      defaultValue="I Charity Development Association"
                    />
                  </div>
                </div>

                {/* رقم الهاتف / البريد الإلكتروني (مطابق للصورة: الهاتف يمين، البريد يسار) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      dir="ltr"
                      className="text-left"
                      defaultValue="+970 8 123 4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      dir="ltr"
                      className="text-left"
                      defaultValue="info@aseel.org"
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
                    defaultValue="+970 59 123 4567"
                  />
                </div>

                {/* العنوان */}
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Input id="address" defaultValue="غزة، فلسطين" />
                </div>

                {/* الموقع الإلكتروني */}
                <div className="space-y-2">
                  <Label htmlFor="website">الموقع الإلكتروني</Label>
                  <Input
                    id="website"
                    dir="ltr"
                    className="text-left"
                    defaultValue="https://aseel.org"
                  />
                </div>

                {/* وصف الجمعية */}
                <div className="space-y-2">
                  <Label htmlFor="description">وصف الجمعية</Label>
                  <Textarea
                    id="description"
                    placeholder="اكتب وصفًا مختصرًا عن الجمعية ورسالتها وأهدافها"
                    defaultValue="جمعية خيرية تهدف إلى دعم وتمكين الفئات المحتاجة عبر مشاريع تنموية وخدمات اجتماعية."
                  />
                </div>

                {/* روابط السوشيال (مطابقة للصورة: Facebook يمين / Twitter يسار، Instagram يمين / YouTube يسار) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      dir="ltr"
                      className="text-left"
                      defaultValue="https://facebook.com/aseel.org"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      dir="ltr"
                      className="text-left"
                      defaultValue="https://twitter.com/aseel_org"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      dir="ltr"
                      className="text-left"
                      defaultValue="https://instagram.com/aseel_org"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      dir="ltr"
                      className="text-left"
                      defaultValue="https://youtube.com/@aseel"
                    />
                  </div>
                </div>

                <Button>
                  حفظ الإعدادات
                  <Save className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
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
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  إعدادات النظام
                </CardTitle>
                <CardDescription>إعدادات النظام والتطبيق</CardDescription>
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
