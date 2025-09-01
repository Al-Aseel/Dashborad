import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  onRefresh: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  loadingText?: string;
  refreshText?: string;
}

export const RefreshButton = ({
  onRefresh,
  loading = false,
  disabled = false,
  variant = "outline",
  size = "sm",
  className,
  showText = true,
  loadingText = "جاري التحميل...",
  refreshText = "تحديث",
}: RefreshButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onRefresh}
      disabled={disabled || loading}
      className={cn(
        "flex items-center gap-2",
        variant === "ghost" && "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      {showText && (loading ? loadingText : refreshText)}
    </Button>
  );
};
