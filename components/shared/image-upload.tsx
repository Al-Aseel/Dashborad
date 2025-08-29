"use client"

import { useRef } from "react"
import { Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  onImageChange: (url: string) => void
  currentImage?: string
  required?: boolean
}

export const ImageUpload = ({ onImageChange, currentImage, required = false }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const url = URL.createObjectURL(file)
    onImageChange(url)
  }

  const removeImage = () => {
    onImageChange("")
  }

  return (
    <div className="space-y-4">
      {!currentImage && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
          >
            <Camera className="w-12 h-12 mb-2" />
            <span className="text-sm">اضغط لاختيار صورة</span>
            {required && <span className="text-xs text-red-500 mt-1">هذا الحقل مطلوب</span>}
          </button>
        </div>
      )}

      {currentImage && (
        <div className="relative group">
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img
              src={currentImage || "/placeholder.svg"}
              alt="الصورة المختارة"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                <Button size="sm" variant="secondary" onClick={removeImage}>
                  <X className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}
