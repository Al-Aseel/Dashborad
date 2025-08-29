import { Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">جمعية أصيل</h1>
          <p className="text-gray-600">للتنمية الخيرية</p>
        </div>

        {/* Login Card Skeleton */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Email Field Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* Password Field Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* Submit Button Skeleton */}
              <Skeleton className="h-14 w-full" />
            </div>

            {/* Additional Options Skeleton */}
            <div className="text-center space-y-3">
              <Skeleton className="h-4 w-32 mx-auto" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-40 mx-auto" />
                <Skeleton className="h-3 w-48 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Skeleton */}
        <div className="text-center mt-8">
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    </div>
  );
}
