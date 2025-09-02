"use client";

import type React from "react";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Camera, Loader2 } from "lucide-react";
import Image from "next/image";
import { toBackendUrl } from "@/lib/utils";
import { useSystemSettings } from "@/hooks/use-system-settings";

interface GalleryImage {
  url: string;
  title: string; // user-provided caption/title
  file?: File;
  fileId?: string; // server identifier
}

interface GalleryUploadProps {
  onImagesChange: (images: GalleryImage[]) => void;
  currentImages?: GalleryImage[];
  maxImages?: number;
  label?: string;
  hideTitles?: boolean;
  onUpload?: (files: File[]) => Promise<void>;
  uploading?: boolean;
  onRemove?: (index: number, image: GalleryImage) => Promise<void> | void;
}

export function GalleryUpload({
  onImagesChange,
  currentImages = [],
  maxImages = 10,
  label = "اضغط لاختيار صور",
  hideTitles = false,
  onUpload,
  uploading = false,
  onRemove,
}: GalleryUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { settings: systemSettings } = useSystemSettings();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    const remainingSlots = maxImages - currentImages.length;
    const filesToProcess = files.slice(0, remainingSlots);

    // Compress images before proceeding (if enabled)
    let processedFiles = filesToProcess;
    try {
      if (systemSettings?.enableFileCompression) {
        const mod = await import("@/lib/image-compression");
        const { compressImage } = mod as any;
        const promises = filesToProcess.map((f) => compressImage(f));
        const results: File[] = await Promise.all(promises);
        processedFiles = results;
      }
    } catch {}

    if (onUpload) {
      // If upload callback is provided, use it
      try {
        await onUpload(processedFiles);
      } catch (error) {
        console.error("Error in onUpload callback:", error);
        // Fallback to local handling if upload fails
        const newImages: GalleryImage[] = processedFiles.map((file) => ({
          url: URL.createObjectURL(file),
          title: "",
          file: file,
        }));
        onImagesChange([...currentImages, ...newImages]);
      }
    } else {
      // Otherwise, use the old behavior
      const newImages: GalleryImage[] = processedFiles.map((file) => ({
        url: URL.createObjectURL(file),
        title: "",
        file: file,
      }));

      onImagesChange([...currentImages, ...newImages]);
    }

    // Allow selecting the same file again by clearing the input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      if (onRemove) {
        await onRemove(index, currentImages[index]);
      }
    } finally {
      const updatedImages = currentImages.filter((_, i) => i !== index);
      onImagesChange(updatedImages);
      // Ensure re-selecting the same file triggers onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleTitleChange = (index: number, title: string) => {
    const updatedImages = currentImages.map((img, i) =>
      i === index ? { ...img, title } : img
    );
    onImagesChange(updatedImages);
  };

  const handleClick = () => {
    if (currentImages.length < maxImages && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {currentImages.map((image, index) => (
            <div key={index} className="space-y-2">
              <div className="relative group">
                <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <Image
                    src={toBackendUrl(image.url) || "/placeholder.svg"}
                    alt={`صورة ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {!hideTitles && (
                <Input
                  placeholder="عنوان الصورة"
                  value={image.title}
                  onChange={(e) => handleTitleChange(index, e.target.value)}
                  className="text-sm"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {currentImages.length < maxImages && (
        <div
          className={`w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center transition-colors ${
            uploading
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:border-gray-400"
          }`}
          onClick={handleClick}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-gray-400 mb-1 animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-gray-400 mb-1" />
          )}
          <p className="text-gray-600 text-center text-sm">
            {uploading
              ? "جاري رفع الصور..."
              : `${label} (${currentImages.length}/${maxImages})`}
          </p>
        </div>
      )}
    </div>
  );
}
