"use client";

import type React from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Camera, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface CoverImageUploadProps {
  onImageChange: (image: string | null) => void;
  onFileChange?: (file: File | null) => void;
  currentImage?: string | null;
  required?: boolean;
  label?: string;
  onUpload?: (file: File) => Promise<any>; // Upload callback
}

export function CoverImageUpload({
  onImageChange,
  onFileChange,
  currentImage,
  required = false,
  label = "صورة الغلاف",
  onUpload,
}: CoverImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف صورة صحيح",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الملف يجب أن يكون أقل من 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    // Compress image before preview/upload
    let processed = file;
    try {
      const { compressImage, isImageFile } = await import("@/lib/image-compression");
      if (isImageFile(file)) {
        const { file: compressed } = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8,
          format: "jpeg",
        });
        processed = compressed;
      }
    } catch {}

    setSelectedFile(processed);
    const imageUrl = URL.createObjectURL(processed);
    onImageChange(imageUrl);

    // Also pass the file object if callback is provided
    if (onFileChange) {
      onFileChange(processed);
    }

    // If upload callback is provided, upload immediately
    if (onUpload) {
      setUploading(true);
      try {
        await onUpload(processed);
        toast({
          title: "نجح",
          description: "تم رفع الصورة بنجاح",
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "خطأ",
          description: "فشل في رفع الصورة",
          variant: "destructive",
        });
        // Revert on error
        onImageChange(null);
        if (onFileChange) {
          onFileChange(null);
        }
        setSelectedFile(null);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);

    // Also clear the file object if callback is provided
    if (onFileChange) {
      onFileChange(null);
    }

    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {currentImage ? (
        <div className="relative group">
          <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <Image
              src={currentImage || "/placeholder.svg"}
              alt="صورة الغلاف"
              fill
              className="object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemoveImage}
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={handleClick}
              disabled={uploading}
            >
              <Camera className="w-4 h-4 mr-2" />
              تغيير الصورة
            </Button>
            {uploading && (
              <Button variant="outline" disabled className="px-4">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جاري الرفع...
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            uploading
              ? "border-gray-400 bg-gray-50 cursor-not-allowed"
              : "hover:border-gray-400"
          }`}
          onClick={handleClick}
        >
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-gray-400 mb-2 animate-spin" />
              <p className="text-gray-600 text-center">جاري رفع الصورة...</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-600 text-center">{label}</p>
              {required && (
                <p className="text-red-500 text-sm mt-1">هذا الحقل مطلوب</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
