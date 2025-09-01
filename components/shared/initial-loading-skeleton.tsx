import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const InitialLoadingSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Tabs */}
        <div className="grid w-full grid-cols-4 gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-md" />
          ))}
        </div>

        {/* Cards */}
        {Array.from({ length: 2 }).map((_, cardIndex) => (
          <Card key={cardIndex} className="overflow-hidden">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Form Fields */}
              {Array.from({ length: cardIndex === 0 ? 8 : 6 }).map(
                (_, fieldIndex) => (
                  <div key={fieldIndex} className="space-y-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-11 w-full rounded-md" />
                  </div>
                )
              )}

              {/* Button */}
              <div className="pt-2">
                <Skeleton className="h-10 w-36 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
