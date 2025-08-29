"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { toBackendUrl } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  title?: string;
}

export function ImageGallery({
  images,
  title = "معرض الصور",
}: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openGallery = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => openGallery(index)}
          >
            <img
              src={toBackendUrl(image) || "/placeholder.svg"}
              alt={`${title} - صورة ${index + 1}`}
              className="w-full h-32 object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
              <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium">عرض الصورة</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="relative">
              <img
                src={toBackendUrl(images[currentIndex]) || "/placeholder.svg"}
                alt={`${title} - صورة ${currentIndex + 1}`}
                className="w-full max-h-[80vh] object-contain"
              />

              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            <div className="p-4 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {currentIndex + 1} من {images.length}
                </span>
                {images.length > 1 && (
                  <div className="flex gap-1">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentIndex ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
