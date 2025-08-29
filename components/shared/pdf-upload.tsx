"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PdfUploadProps {
  onFileChange: (file: File | null) => void
  currentFile?: File | null
  label?: string
  required?: boolean
  className?: string
}

export function PdfUpload({
  onFileChange,
  currentFile,
  label = "رفع ملف PDF",
  required = false,
  className,
}: PdfUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (file: File) => {
    if (file.type === "application/pdf") {
      onFileChange(file)
    } else {
      alert("يرجى اختيار ملف PDF فقط")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const removeFile = () => {
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {currentFile ? (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-red-500" />
              <div>
                <p className="font-medium text-gray-900">{currentFile.name}</p>
                <p className="text-sm text-gray-500">{(currentFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors",
            dragActive && "border-blue-400 bg-blue-50",
            "hover:border-gray-400",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">اضغط لاختيار ملف</p>
          <p className="text-sm text-red-500">هذا الحقل مطلوب</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 bg-transparent"
            onClick={() => fileInputRef.current?.click()}
          >
            اختيار ملف PDF
          </Button>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
    </div>
  )
}
