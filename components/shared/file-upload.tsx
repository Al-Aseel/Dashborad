"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Upload, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  className?: string
  currentFiles?: string[] // Added support for displaying current files
}

export function FileUpload({
  onFilesChange,
  maxFiles = 5,
  acceptedTypes = ["image/*", ".pdf", ".doc", ".docx"],
  className,
  currentFiles = [], // Added default empty array for current files
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return

    const fileArray = Array.from(newFiles)
    const validFiles = fileArray.filter((file) => {
      return acceptedTypes.some((type) => {
        if (type.includes("*")) {
          return file.type.startsWith(type.replace("*", ""))
        }
        return file.name.toLowerCase().endsWith(type)
      })
    })

    const updatedFiles = [...files, ...validFiles].slice(0, maxFiles)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const removeCurrentFile = (index: number) => {
    // This would need to be handled by parent component
    // For now, we'll just show the files
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const totalFiles = files.length + currentFiles.length

  return (
    <div className={cn("space-y-4", className)}>
      {totalFiles < maxFiles && (
        <Card
          className={cn(
            "border-2 border-dashed p-6 text-center cursor-pointer transition-colors",
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">اضغط لتحديد الملفات</p>
          <p className="text-sm text-gray-500">أو اسحب الملفات هنا</p>
          <p className="text-xs text-gray-400 mt-2">
            الحد الأقصى: {maxFiles} ملفات ({totalFiles}/{maxFiles})
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </Card>
      )}

      {currentFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">الصور الحالية:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentFiles.map((fileUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={fileUrl || "/placeholder.svg"}
                    alt={`صورة ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => removeCurrentFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">الملفات الجديدة:</h4>
          {acceptedTypes.includes("image/*") ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                </div>
              ))}
            </div>
          ) : (
            // Original list view for non-image files
            files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
