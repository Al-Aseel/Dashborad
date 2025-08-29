"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
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
                  <Button onClick={reset} className="w-full" size="lg">
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
      </body>
    </html>
  );
}
