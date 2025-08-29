"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Search, AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotFoundPageProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showRefreshButton?: boolean;
  customActions?: React.ReactNode;
}

export function NotFoundPage({
  title = "404",
  description = "الصفحة غير موجودة",
  showBackButton = true,
  showHomeButton = true,
  showRefreshButton = true,
  customActions
}: NotFoundPageProps) {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              {title}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              {description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-gray-500 leading-relaxed">
              عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر.
            </p>
            
            {/* Custom Actions */}
            {customActions && (
              <div className="space-y-3">
                {customActions}
              </div>
            )}
            
            {/* Default Actions */}
            {!customActions && (
              <div className="space-y-3">
                {showHomeButton && (
                  <Button asChild className="w-full" size="lg">
                    <Link href="/">
                      <Home className="w-4 h-4 ml-2" />
                      العودة للرئيسية
                    </Link>
                  </Button>
                )}
                
                {showBackButton && (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    onClick={handleGoBack}
                  >
                    <ArrowLeft className="w-4 h-4 ml-2" />
                    العودة للصفحة السابقة
                  </Button>
                )}
                
                {showRefreshButton && (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="w-4 h-4 ml-2" />
                    إعادة تحميل الصفحة
                  </Button>
                )}
              </div>
            )}
            
            {/* Quick Navigation Links */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-400 mb-2">
                يمكنك أيضاً البحث عن:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link href="/projects">
                  <Button variant="ghost" size="sm">
                    <Search className="w-3 h-3 ml-1" />
                    المشاريع
                  </Button>
                </Link>
                <Link href="/news-activities">
                  <Button variant="ghost" size="sm">
                    <Search className="w-3 h-3 ml-1" />
                    الأخبار
                  </Button>
                </Link>
                <Link href="/partners">
                  <Button variant="ghost" size="sm">
                    <Search className="w-3 h-3 ml-1" />
                    الشركاء
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Additional decorative elements */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الدعم الفني
          </p>
        </div>
      </div>
    </div>
  );
}
