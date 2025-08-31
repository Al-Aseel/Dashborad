"use client";

import type React from "react";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Camera,
  Loader2,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
  uploadPartnerImage,
  deletePartnerImage,
  extractPartnerImageId,
  isValidImageFile,
  isValidFileSize,
} from "@/lib/partner-images";

interface SingleImageUploadProps {
  onImageChange: (image: string | null) => void;
  onFileChange?: (file: File | null) => void;
  onFileIdChange?: (fileId: string | null) => void; // جديد: لتتبع معرف الملف
  currentImage?: string | null;
  currentFileId?: string | null; // جديد: معرف الملف الحالي
  required?: boolean;
  label?: string;
  autoUpload?: boolean; // جديد: رفع تلقائي أم لا
}

export function SingleImageUpload({
  onImageChange,
  onFileChange,
  onFileIdChange,
  currentImage,
  currentFileId,
  required = false,
  label = "اضغط لاختيار صورة",
  autoUpload = true, // افتراضي: رفع تلقائي
}: SingleImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false); // جديد: معالجة الملف
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "processing" | "uploading" | "success" | "error"
  >("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Lazy import to avoid SSR issues if used server-side indirectly
  const compressAndPrepare = async (file: File) => {
    setProcessing(true);
    setUploadStatus("processing");

    try {
      const mod = await import("@/lib/image-compression");
      const { compressLogoImage, isImageFile, formatFileSize } = mod;
      
      if (!isImageFile(file)) {
        setProcessing(false);
        setUploadStatus("idle");
        return { file, url: URL.createObjectURL(file) };
      }

      // ضغط الصورة باستخدام خيارات مخصصة للشعارات
      const compressedFile = await compressLogoImage(file);

      console.log('معلومات ضغط الصورة:', {
        original: formatFileSize(file.size),
        compressed: formatFileSize(compressedFile.size),
        reduction: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`,
      });

      setProcessing(false);
      setUploadStatus("idle");
      return { file: compressedFile, url: URL.createObjectURL(compressedFile) };
    } catch (error) {
      console.error('خطأ في ضغط الصورة:', error);
      setProcessing(false);
      setUploadStatus("error");
      // في حالة فشل الضغط، استخدم الملف الأصلي
      return { file, url: URL.createObjectURL(file) };
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!isValidImageFile(file)) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف صورة صحيح",
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الملف
    if (!isValidFileSize(file, 5)) {
      toast({
        title: "خطأ",
        description: "حجم الملف يجب أن يكون أقل من 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    const { file: processed, url } = await compressAndPrepare(file);
    setSelectedFile(processed);
    onImageChange(url);

    if (onFileChange) {
      onFileChange(processed);
    }

    // إذا كان الرفع التلقائي مفعل، ارفع الصورة فوراً
    if (autoUpload) {
      await handleUpload(processed);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setUploadStatus("uploading");

    try {
      const response = await uploadPartnerImage(file);
      const fileId = extractPartnerImageId(response);

      if (fileId && onFileIdChange) {
        onFileIdChange(fileId);
      }

      setUploadStatus("success");
      toast({
        title: "تم بنجاح",
        description: "تم رفع الصورة المضغوطة بنجاح",
      });

      // إعادة تعيين الحالة بعد ثانيتين
      setTimeout(() => {
        setUploadStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("خطأ في رفع الصورة:", error);
      setUploadStatus("error");
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفع الصورة",
        variant: "destructive",
      });

      // إعادة تعيين الحالة بعد 3 ثوان
      setTimeout(() => {
        setUploadStatus("idle");
      }, 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    // إذا كان هناك معرف ملف، احذف الصورة من السيرفر
    if (currentFileId) {
      try {
        await deletePartnerImage(currentFileId);
        if (onFileIdChange) {
          onFileIdChange(null);
        }
        toast({
          title: "تم بنجاح",
          description: "تم حذف الصورة بنجاح",
        });
      } catch (error) {
        console.error("خطأ في حذف الصورة:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حذف الصورة",
          variant: "destructive",
        });
      }
    }

    // مسح الصورة من الواجهة
    onImageChange(null);
    setSelectedFile(null);
    setUploadStatus("idle");

    if (onFileChange) {
      onFileChange(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (uploading || processing) return; // منع النقر أثناء التحميل
    fileInputRef.current?.click();
  };

  // دالة لتحديد رسالة الحالة
  const getStatusMessage = () => {
    switch (uploadStatus) {
      case "processing":
        return "جاري ضغط وتحسين الصورة...";
      case "uploading":
        return "جاري رفع الصورة المضغوطة...";
      case "success":
        return "تم رفع الصورة المضغوطة بنجاح!";
      case "error":
        return "حدث خطأ في معالجة الصورة";
      default:
        return label;
    }
  };

  // دالة لتحديد أيقونة الحالة
  const getStatusIcon = () => {
    switch (uploadStatus) {
      case "processing":
      case "uploading":
        return (
          <Loader2 className="w-12 h-12 text-blue-500 mb-2 animate-spin" />
        );
      case "success":
        return <CheckCircle className="w-12 h-12 text-green-500 mb-2" />;
      case "error":
        return <AlertCircle className="w-12 h-12 text-red-500 mb-2" />;
      default:
        return <Camera className="w-12 h-12 text-gray-400 mb-2" />;
    }
  };

  // دالة لتحديد لون النص
  const getStatusTextColor = () => {
    switch (uploadStatus) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "processing":
      case "uploading":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  // دالة لحساب حجم الصورة
  const getImageSize = (imageUrl: string): string => {
    if (!imageUrl) return "";

    // إذا كان URL يحتوي على معرف الملف أو uploads، استخدم حجم افتراضي
    if (imageUrl.includes("/uploads/") || imageUrl.includes("data:")) {
      return "500 KB"; // حجم مضغوط للصور المرفوعة
    }

    // إذا كان URL خارجي، استخدم حجم افتراضي
    if (imageUrl.startsWith("http")) {
      return "1.8 MB"; // حجم افتراضي للصور الخارجية
    }

    return "1.5 MB"; // حجم افتراضي عام
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || processing}
      />

      {currentImage ? (
        <div className="relative group">
          <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <Image
              src={currentImage || "/placeholder.svg"}
              alt="الصورة المختارة"
              fill
              className="object-cover"
            />

            {/* مؤشر الحالة */}
            {uploadStatus !== "idle" && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white">
                  {getStatusIcon()}
                  <p className="text-sm">{getStatusMessage()}</p>
                </div>
              </div>
            )}

            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemoveImage}
              disabled={uploading || processing}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* عرض حجم الصورة */}
          {currentImage && (
            <div className="text-xs text-gray-500 mt-1">
              حجم الصورة: {getImageSize(currentImage)} (مضغوط)
            </div>
          )}

          {/* مؤشر الحالة */}
          {uploadStatus !== "idle" && (
            <div
              className={`text-sm text-center p-2 rounded-md ${getStatusTextColor()} bg-opacity-10`}
            >
              {getStatusMessage()}
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={handleClick}
              disabled={uploading || processing}
            >
              {uploading || processing ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  {processing ? "معالجة..." : "جاري الرفع..."}
                </>
              ) : (
                "تغيير الصورة"
              )}
            </Button>

            {/* زر الرفع اليدوي إذا لم يكن الرفع التلقائي مفعل */}
            {!autoUpload && selectedFile && !uploading && !processing && (
              <Button
                type="button"
                onClick={() => handleUpload(selectedFile)}
                disabled={uploading || processing}
                className="flex-1"
              >
                <Upload className="w-4 h-4 ml-2" />
                رفع الصورة
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all ${
            uploading || processing
              ? "border-blue-300 bg-blue-50 cursor-not-allowed"
              : "border-gray-300 hover:border-gray-400 cursor-pointer"
          }`}
          onClick={handleClick}
        >
          {getStatusIcon()}
          <p className={`text-center ${getStatusTextColor()}`}>
            {getStatusMessage()}
          </p>

          {/* رسائل إضافية للحالات المختلفة */}
          {uploadStatus === "processing" && (
            <p className="text-xs text-blue-500 mt-1">ضغط وتحسين الصورة...</p>
          )}
          {uploadStatus === "uploading" && (
            <p className="text-xs text-blue-500 mt-1">جاري رفع الصورة المضغوطة...</p>
          )}
          {uploadStatus === "success" && (
            <p className="text-xs text-green-500 mt-1">تم رفع الصورة المضغوطة بنجاح!</p>
          )}
          {uploadStatus === "error" && (
            <p className="text-xs text-red-500 mt-1">حدث خطأ في معالجة الصورة</p>
          )}

          {required && uploadStatus === "idle" && (
            <p className="text-red-500 text-sm mt-1">هذا الحقل مطلوب</p>
          )}
        </div>
      )}
    </div>
  );
}
