"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/lib/auth";
import { User, Save } from "lucide-react";

interface UserData {
  name: string;
  email: string;
}

export function EditProfileForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserData>({
    name: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load current user data on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        if (typeof window !== "undefined") {
          const userData = localStorage.getItem("userData") || sessionStorage.getItem("userData");
          if (userData) {
            const parsedUser = JSON.parse(userData);
            setFormData({
              name: parsedUser.name || "",
              email: parsedUser.email || "",
            });
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "الاسم مطلوب";
    }

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
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
      await AuthService.editMyData({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      toast({
        title: "تم تحديث البيانات بنجاح",
        description: "سيتم تسجيل الخروج تلقائياً. يرجى تسجيل الدخول مرة أخرى",
      });

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
          const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء تحديث البيانات";
          toast({
            title: "فشل تحديث البيانات",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        // Handle other types of errors
        const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء تحديث البيانات";
        toast({
          title: "فشل تحديث البيانات",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          تعديل البيانات الشخصية
        </CardTitle>
        <CardDescription>
          قم بتحديث معلوماتك الشخصية. بعد التحديث سيتم تسجيل الخروج تلقائياً.
        </CardDescription>
      </CardHeader>
      <CardContent dir="rtl" className="space-y-4 text-right">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* الاسم */}
          <div className="space-y-2">
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={errors.name ? "border-red-500" : ""}
              placeholder="أدخل اسمك"
            />
            {errors.name && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription>{errors.name}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* البريد الإلكتروني */}
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={errors.email ? "border-red-500" : ""}
              placeholder="أدخل بريدك الإلكتروني"
              dir="ltr"
              className="text-left"
            />
            {errors.email && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription>{errors.email}</AlertDescription>
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
                تحديث البيانات
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
