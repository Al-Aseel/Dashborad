"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, RefreshCw, Wifi, AlertTriangle, Server } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
    checkOnlineStatus();

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    reset();
  };

  const isServerError = error.message.includes('fetch') || 
                       error.message.includes('network') ||
                       error.message.includes('ECONNREFUSED') ||
                       error.message.includes('ENOTFOUND') ||
                       !isOnline;

  if (isServerError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Server className="w-10 h-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                خطأ في الاتصال بالسيرفر
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                لا يمكن الاتصال بالسيرفر في الوقت الحالي
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {!isOnline && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Wifi className="w-4 h-4" />
                      <span className="text-sm">أنت غير متصل بالإنترنت</span>
                    </div>
                  </div>
                )}
                
                <p className="text-gray-500 leading-relaxed">
                  عذراً، حدث خطأ في الاتصال بالسيرفر. قد يكون السيرفر متوقفاً أو هناك مشكلة في الشبكة.
                </p>
                
                {retryCount > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      تمت المحاولة {retryCount} مرات
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Button onClick={handleRetry} className="w-full" size="lg">
                  <RefreshCw className="w-4 h-4 ml-2" />
                  إعادة المحاولة
                </Button>
                
                <Button variant="outline" asChild className="w-full" size="lg">
                  <Link href="/">
                    <Home className="w-4 h-4 ml-2" />
                    العودة للرئيسية
                  </Link>
                </Button>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-400 mb-2">
                  نصائح لحل المشكلة:
                </p>
                <ul className="text-sm text-gray-500 text-right space-y-1">
                  <li>• تحقق من اتصالك بالإنترنت</li>
                  <li>• انتظر قليلاً وحاول مرة أخرى</li>
                  <li>• تأكد من أن السيرفر يعمل</li>
                  <li>• امسح ذاكرة التخزين المؤقت للمتصفح</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional decorative elements */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default error page for other types of errors
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-10 h-10 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              حدث خطأ غير متوقع
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              عذراً، حدث خطأ في التطبيق
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-gray-500 leading-relaxed">
              حدث خطأ غير متوقع في التطبيق. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
            </p>
            
            {error.digest && (
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-xs text-gray-500 font-mono">
                  Error ID: {error.digest}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full" size="lg">
                <RefreshCw className="w-4 h-4 ml-2" />
                إعادة المحاولة
              </Button>
              
              <Button variant="outline" asChild className="w-full" size="lg">
                <Link href="/">
                  <Home className="w-4 h-4 ml-2" />
                  العودة للرئيسية
                </Link>
              </Button>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-400">
                إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
