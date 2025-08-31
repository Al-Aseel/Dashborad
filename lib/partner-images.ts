import { api } from "./api";

export interface UploadImageResponse {
  status: string;
  data: {
    _id?: string;
    id?: string;
    fileName?: string;
    originalName?: string;
    url?: string;
    size?: number;
    mimeType?: string;
  };
  message: string;
}

export interface DeleteImageResponse {
  status: string;
  data: any;
  message: string;
}

/**
 * رفع صورة شريك جديد
 * @param file - ملف الصورة
 * @returns استجابة من السيرفر تحتوي على معلومات الصورة المرفوعة
 */
export async function uploadPartnerImage(file: File): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("image", file, file.name);

  const response = await api.post("/upload/image", formData, {
    headers: {
      // لا نحدد Content-Type يدوياً - نترك المتصفح يحدده مع boundary
    },
    timeout: 30000, // timeout أطول لرفع الملفات
  });

  return response.data;
}

/**
 * حذف صورة شريك من السيرفر
 * @param fileId - معرف الملف المراد حذفه
 * @returns استجابة من السيرفر
 */
export async function deletePartnerImage(fileId: string): Promise<DeleteImageResponse> {
  const response = await api.delete(`/upload/file/${fileId}`);
  return response.data;
}

/**
 * استخراج معرف الملف من استجابة رفع الصورة
 * @param response - استجابة رفع الصورة
 * @returns معرف الملف أو undefined إذا لم يتم العثور عليه
 */
export function extractPartnerImageId(response: UploadImageResponse): string | undefined {
  // نفضل Mongo ObjectId `_id` أولاً
  const objectId = String(response?.data?._id ?? "").trim();
  if (objectId && /^[a-f\d]{24}$/i.test(objectId)) return objectId;
  
  // بدائل أخرى
  const anyId = String(response?.data?.id ?? response?.data?.fileName ?? "").trim();
  return anyId || undefined;
}

/**
 * التحقق من صحة نوع الملف
 * @param file - الملف المراد التحقق منه
 * @returns true إذا كان الملف صورة صحيحة
 */
export function isValidImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * التحقق من حجم الملف
 * @param file - الملف المراد التحقق منه
 * @param maxSizeMB - الحد الأقصى للحجم بالميجابايت (افتراضي: 5MB)
 * @returns true إذا كان حجم الملف مقبول
 */
export function isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}
