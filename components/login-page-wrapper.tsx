"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Mail, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthContext } from "@/components/auth-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { useLoginSettings } from "@/hooks/use-login-settings";
import { buildImageUrl } from "@/lib/config";
import { useDynamicColor } from "@/hooks/use-dynamic-color";
import Image from "next/image";

export default function LoginPageWrapper() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const { settings, loading: settingsLoading } = useLoginSettings();
  const { mainColor, gradientColors, isColorLoading } = useDynamicColor();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password, rememberMe);

      if (success) {
        router.push("/");
      } else {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get dynamic colors from settings
  const websiteName = settings?.websiteName_ar || "جمعية أصيل";
  const logoUrl = settings?.websiteLogo?.url
    ? buildImageUrl(settings.websiteLogo.url)
    : null;

  if (settingsLoading || isColorLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4 custom-scrollbar">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-4 shadow-lg border-2 border-gray-300/20 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-300/50 backdrop-blur-sm flex items-center justify-center">
                <Heart className="w-6 h-6 text-gray-400 drop-shadow-sm" />
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
          </div>
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-4">
              <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 custom-scrollbar"
      style={{
        background: `linear-gradient(135deg, ${gradientColors.light}15 0%, white 50%, ${gradientColors.light}15 100%)`,
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-lg border-2 border-white/20"
            style={{
              background: `linear-gradient(135deg, ${gradientColors.from} 0%, ${gradientColors.to} 100%)`,
              boxShadow: `0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
            }}
          >
            {logoUrl ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm">
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover object-center"
                  style={{
                    filter: "brightness(1.1) contrast(1.1)",
                  }}
                />
                {/* Overlay for better contrast */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Heart className="w-6 h-6 text-white drop-shadow-sm" />
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {websiteName}
          </h1>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              تسجيل الدخول
            </CardTitle>
            <CardDescription className="text-gray-600">
              أدخل بياناتك للوصول إلى لوحة التحكم
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 pr-4 py-3 border-gray-300"
                    style={
                      {
                        "--tw-ring-color": mainColor,
                        "--tw-border-opacity": "1",
                      } as React.CSSProperties
                    }
                    onFocus={(e) => {
                      e.target.style.borderColor = mainColor;
                      e.target.style.boxShadow = `0 0 0 1px ${mainColor}`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                      e.target.style.boxShadow = "none";
                    }}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 py-3 border-gray-300"
                    style={
                      {
                        "--tw-ring-color": mainColor,
                        "--tw-border-opacity": "1",
                      } as React.CSSProperties
                    }
                    onFocus={(e) => {
                      e.target.style.borderColor = mainColor;
                      e.target.style.boxShadow = `0 0 0 1px ${mainColor}`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                      e.target.style.boxShadow = "none";
                    }}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(v) => setRememberMe(Boolean(v))}
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-700">
                    تذكرني
                  </Label>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-200 bg-red-50"
                >
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full text-white py-3 text-lg font-medium"
                style={{
                  background: `linear-gradient(135deg, ${gradientColors.from} 0%, ${gradientColors.to} 100%)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
                disabled={isLoading}
              >
                {isLoading ? "...جاري تسجيل الدخول" : "تسجيل الدخول"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 {websiteName}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}
