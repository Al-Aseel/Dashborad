import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationError {
  param: string;
  msg: string;
}

interface ValidationErrorsProps {
  errors: ValidationError[];
  fieldName: string;
  className?: string;
}

export const ValidationErrors = ({
  errors,
  fieldName,
  className,
}: ValidationErrorsProps) => {
  // البحث عن الأخطاء الخاصة بالحقل المحدد
  const fieldErrors = errors.filter((error) => error.param === fieldName);

  console.log(`ValidationErrors for ${fieldName}:`, fieldErrors);

  if (fieldErrors.length === 0) return null;

  return (
    <div className={cn("mt-1", className)}>
      {fieldErrors.map((error, index) => (
        <div
          key={index}
          className="flex items-center gap-1 text-sm text-destructive"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error.msg}</span>
        </div>
      ))}
    </div>
  );
};

// دالة مساعدة للحصول على رسالة الخطأ لحقل معين
export const getFieldError = (
  errors: ValidationError[],
  fieldName: string
): string | null => {
  const fieldError = errors.find((error) => error.param === fieldName);
  return fieldError ? fieldError.msg : null;
};
