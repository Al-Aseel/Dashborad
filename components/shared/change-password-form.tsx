"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/lib/auth";
import { Eye, EyeOff, Lock, Save } from "lucide-react";

export function ChangePasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "كلمة المرور الحالية مطلوبة";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور الجديدة مطلوبة";
    } else if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمة المرور الجديدة غير متطابقة";
    }

    if (formData.currentPassword === formData.password) {
      newErrors.password = "كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.changePassword(
        formData.currentPassword,
        formData.password,
        formData.confirmPassword
      );

      toast({
        title: "تم تغيير كلمة المرور بنجاح",
        description: "سيتم تسجيل الخروج تلقائياً. يرجى تسجيل الدخول مرة أخرى بكلمة المرور الجديدة",
      });

      // Reset form
      setFormData({
        currentPassword: "",
        password: "",
        confirmPassword: "",
      });
      setErrors({});

      // Wait a bit for the toast to be visible, then logout and redirect
      setTimeout(async () => {
        try {
          await AuthService.logout();
          // Redirect to login page
          window.location.href = "/login";
        } catch (error) {
          console.error("Error during logout:", error);
          // Force redirect even if logout fails
          window.location.href = "/login";
        }
      }, 2000); // Wait 2 seconds for user to read the message

    } catch (error: any) {
      // Handle server validation errors
      if (error?.response?.data?.status === "error" && error?.response?.data?.details) {
        const details = error.response.data.details;
        if (Array.isArray(details) && details.length > 0) {
          // Show first error message in toast
          const firstError = details[0];
          toast({
            title: "خطأ في التحقق من البيانات",
            description: firstError.msg,
            variant: "destructive",
          });
          
          // Set field-specific errors
          const newErrors: Record<string, string> = {};
          details.forEach((detail: any) => {
            if (detail.param && detail.msg) {
              newErrors[detail.param] = detail.msg;
            }
          });
          setErrors(newErrors);
        } else {
          // Fallback for other error formats
          const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء تغيير كلمة المرور";
          toast({
            title: "فشل تغيير كلمة المرور",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        // Handle other types of errors
        const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء تغيير كلمة المرور";
        toast({
          title: "فشل تغيير كلمة المرور",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          تغيير كلمة المرور
        </CardTitle>
        <CardDescription>
          قم بتحديث كلمة المرور الخاصة بك. تأكد من استخدام كلمة مرور قوية وآمنة.
        </CardDescription>
      </CardHeader>
      <CardContent dir="rtl" className="space-y-4 text-right">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* كلمة المرور الحالية */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className={errors.currentPassword ? "border-red-500" : ""}
                placeholder="أدخل كلمة المرور الحالية"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("current")}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.currentPassword && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription>{errors.currentPassword}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* كلمة المرور الجديدة */}
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور الجديدة</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPasswords.new ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={errors.password ? "border-red-500" : ""}
                placeholder="أدخل كلمة المرور الجديدة"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("new")}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription>{errors.password}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* تأكيد كلمة المرور */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={errors.confirmPassword ? "border-red-500" : ""}
                placeholder="أعد إدخال كلمة المرور الجديدة"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription>{errors.confirmPassword}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* زر الحفظ */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              "جاري التحديث..."
            ) : (
              <>
                <Save className="w-4 h-4 ml-2" />
                تحديث كلمة المرور
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
