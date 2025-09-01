import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingOverlay = ({
  isLoading,
  message = "جاري التحميل...",
  className,
  size = "md",
}: LoadingOverlayProps) => {
  if (!isLoading) return null;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3 p-6">
        <div className="relative">
          <Loader2
            className={cn("animate-spin text-primary", sizeClasses[size])}
          />
        </div>
        <div className="text-center">
          <span className="text-sm font-medium text-gray-700">{message}</span>
        </div>
      </div>
    </div>
  );
};
