import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, API_BASE_URL } from "@/lib/api";
import { useSystemSettings } from "@/hooks/use-system-settings";

// Interface لاستجابة رفع الصورة
interface UploadResponse {
  status: string;
  data: {
    url: string;
    title: string | null;
    fileName: string;
    originalName: string;
    isUsed: boolean;
    createdAt: string;
    mimeType: string;
    size: number;
    isArray: boolean;
    _id: string;
    __v: number;
  };
  message: string;
}

// دالة مساعدة لاستخراج host من baseURL
const getHostFromBaseURL = (baseURL: string): string => {
  try {
    const url = new URL(baseURL);
    return `${url.protocol}//${url.host}/`;
  } catch (error) {
    // في حالة فشل parsing، نعيد baseURL مع إضافة / في النهاية
    return baseURL.endsWith("/") ? baseURL : `${baseURL}/`;
  }
};

// دالة مساعدة لحذف الصورة من الخادم
export const deleteImage = async (imageId: string): Promise<void> => {
  try {
    await api.delete(`/upload/file/${imageId}`);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

interface LogoUploadProps {
  value?: string | null; // هذا سيكون imageId
  imageUrl?: string | null; // URL الصورة للعرض
  onChange: (value: string | null) => void; // سيحتوي على imageId
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export const LogoUpload = ({
  value, // هذا سيكون imageId
  imageUrl, // URL الصورة للعرض
  onChange,
  onError,
  className,
  disabled = false,
}: LogoUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { settings: systemSettings } = useSystemSettings();

  // تحميل URL الصورة عندما يكون هناك imageId موجود
  useEffect(() => {
    if (value && value !== imageId) {
      setImageId(value);
    }

    // استخدام imageUrl الممرر من الصفحة الأم فقط إذا لم يكن هناك preview محلي
    if (imageUrl && !preview) {
      setPreview(imageUrl);
    }
  }, [value, imageId, imageUrl, preview]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      onError?.("يرجى اختيار ملف صورة صالح");
      return;
    }

    // التحقق من حجم الملف (5MB كحد أقصى)
    if (file.size > 5 * 1024 * 1024) {
      onError?.("حجم الملف يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    try {
      setIsUploading(true);

      // إنشاء FormData لرفع الصورة
      const formData = new FormData();
      let fileToUpload: File = file;
      // ضغط الصورة إذا كان خيار الضغط مفعلًا
      try {
        if (systemSettings?.enableFileCompression) {
          const mod = await import("@/lib/image-compression");
          const { compressLogoImage } = mod;
          fileToUpload = await compressLogoImage(file);
        }
      } catch {}

      formData.append("image", fileToUpload);

      // رفع الصورة إلى الخادم
      const response = await api.post<UploadResponse>(
        "/upload/image",
        formData,
        {
          headers: {
            // Don't set Content-Type manually - let the browser set it with boundary
          },
          timeout: 90000, // Increased timeout for large files
        }
      );

      // الحصول على بيانات الصورة من الاستجابة
      const imageData = response.data.data;

      if (imageData?.url && imageData?._id) {
        // استخراج host من baseURL وبناء URL كامل: host/url
        const host = getHostFromBaseURL(API_BASE_URL);
        const fullImageUrl = `${host}${imageData.url}`;

        // عرض المعاينة فوراً بعد نجاح رفع الصورة
        setPreview(fullImageUrl);
        setImageId(imageData._id);

        // إرسال imageId للصفحة الأم (وليس URL)
        onChange(imageData._id);
      } else {
        throw new Error("لم يتم الحصول على بيانات الصورة من الخادم");
      }
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "حدث خطأ في رفع الصورة";
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleCopyUrl = async () => {
    if (preview) {
      try {
        await navigator.clipboard.writeText(preview);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy URL:", error);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = preview;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        // محاكاة تغيير الملف
        const event = {
          target: { files: [file] },
        } as React.ChangeEvent<HTMLInputElement>;
        handleFileSelect(event);
      }
    },
    [handleFileSelect]
  );

  return (
    <div className={cn("space-y-4", className)}>
      <Label>شعار الموقع</Label>

      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-300",
          isDragOver
            ? "border-blue-500 bg-blue-50/80 shadow-lg scale-[1.02]"
            : "border-gray-300 hover:border-gray-400 hover:shadow-md"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          {preview ? (
            // معاينة الصورة
            <div className="space-y-4">
              <div className="relative group">
                {/* خلفية متدرجة للمعاينة */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <div className="flex flex-col items-center space-y-3">
                    {/* إطار الصورة مع تأثيرات */}
                    <div className="relative bg-white rounded-lg p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      <img
                        src={preview}
                        alt="شعار الموقع"
                        className="max-w-full h-auto max-h-24 object-contain"
                      />
                      {/* تأثير التوهج */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                    </div>

                    {/* معلومات الصورة */}
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        شعار الموقع
                      </p>
                      <p className="text-xs text-gray-500">
                        تم رفع الصورة بنجاح
                      </p>
                      {/* Badge لنسخ رابط الصورة */}
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-gray-200 transition-colors duration-200 flex items-center gap-1 mx-auto"
                        onClick={handleCopyUrl}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3" />
                            تم النسخ
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            نسخ الرابط
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClickUpload}
                  disabled={disabled || isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      تغيير الشعار
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // منطقة رفع الصورة
            <div className="text-center space-y-6">
              {/* أيقونة رفع الصورة مع تأثيرات */}
              <div className="relative">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center border-2 border-dashed border-blue-200 group-hover:border-blue-300 transition-all duration-300">
                  <ImageIcon className="w-10 h-10 text-blue-400" />
                </div>
                {/* تأثير النبض */}
                <div className="absolute inset-0 w-20 h-20 bg-blue-200 rounded-full animate-ping opacity-20"></div>
              </div>

              {/* النصوص التوضيحية */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-700">
                    رفع شعار الموقع
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    اسحب وأفلت صورة الشعار هنا، أو اضغط للاختيار من جهازك
                  </p>
                </div>

                {/* معلومات الملفات المدعومة */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center justify-center space-x-4 text-xs text-blue-700">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      PNG
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      JPG
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      GIF
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      حتى 5MB
                    </span>
                  </div>
                </div>
              </div>

              {/* زر الاختيار */}
              <Button
                type="button"
                variant="outline"
                onClick={handleClickUpload}
                disabled={disabled || isUploading}
                className="w-full h-12 text-base font-medium bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-blue-400 transition-all duration-300"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    اختيار صورة الشعار
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input مخفي لرفع الملف */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Input مخفي لتخزين قيمة URL */}
      <Input
        type="hidden"
        value={preview || ""}
        onChange={(e) => onChange(e.target.value || null)}
      />
    </div>
  );
};
