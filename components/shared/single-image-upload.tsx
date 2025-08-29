"use client";

import type React from "react";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Camera } from "lucide-react";
import Image from "next/image";

interface SingleImageUploadProps {
  onImageChange: (image: string | null) => void;
  onFileChange?: (file: File | null) => void; // New callback for file object
  currentImage?: string | null;
  required?: boolean;
  label?: string;
}

export function SingleImageUpload({
  onImageChange,
  onFileChange,
  currentImage,
  required = false,
  label = "اضغط لاختيار صورة",
}: SingleImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Lazy import to avoid SSR issues if used server-side indirectly
  const compressAndPrepare = async (file: File) => {
    const mod = await import("@/lib/image-compression");
    const { compressImage, isImageFile } = mod;
    if (!isImageFile(file)) return { file, url: URL.createObjectURL(file) };
    try {
      const { file: compressed } = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        format: "jpeg",
      });
      return { file: compressed, url: URL.createObjectURL(compressed) };
    } catch {
      return { file, url: URL.createObjectURL(file) };
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const { file: processed, url } = await compressAndPrepare(file);
      onImageChange(url);
      if (onFileChange) {
        onFileChange(processed);
      }
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);

    // Also clear the file object if callback is provided
    if (onFileChange) {
      onFileChange(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
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
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemoveImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full mt-2 bg-transparent"
            onClick={handleClick}
          >
            تغيير الصورة
          </Button>
        </div>
      ) : (
        <div
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={handleClick}
        >
          <Camera className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-gray-600 text-center">{label}</p>
          {required && (
            <p className="text-red-500 text-sm mt-1">هذا الحقل مطلوب</p>
          )}
        </div>
      )}
    </div>
  );
}
