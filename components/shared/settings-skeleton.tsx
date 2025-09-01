import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings } from "lucide-react";

export const SettingsSkeleton = () => {
  return (
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
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </CardHeader>
      <CardContent dir="rtl" className="space-y-6 text-right">
        {/* اسم الموقع (عربي/إنجليزي) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </div>

        {/* رقم الهاتف / البريد الإلكتروني */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </div>

        {/* رقم الواتساب */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>

        {/* العنوان */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>

        {/* الموقع الإلكتروني */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>

        {/* شعار الموقع */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-20" />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center space-y-6">
              {/* أيقونة رفع الصورة */}
              <div className="relative">
                <Skeleton className="w-20 h-20 rounded-full mx-auto" />
                <Skeleton className="absolute inset-0 w-20 h-20 rounded-full animate-pulse" />
              </div>

              {/* النصوص */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />

                {/* معلومات الملفات */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-center space-x-4">
                    <Skeleton className="w-8 h-3" />
                    <Skeleton className="w-8 h-3" />
                    <Skeleton className="w-8 h-3" />
                    <Skeleton className="w-12 h-3" />
                  </div>
                </div>

                {/* Badge نسخ الرابط */}
                <Skeleton className="h-6 w-24 mx-auto rounded-full" />
              </div>

              {/* زر الاختيار */}
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </div>
        </div>

        {/* وصف الجمعية */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>

        {/* روابط السوشيال */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </div>

        {/* زر الحفظ */}
        <div className="pt-2">
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};
