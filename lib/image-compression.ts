export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  quality: number;
  fileType: string;
}

export const defaultCompressionOptions: CompressionOptions = {
  maxSizeMB: 1, // الحد الأقصى للحجم بالميجابايت
  maxWidthOrHeight: 1024, // الحد الأقصى للعرض أو الارتفاع
  quality: 0.8, // جودة الصورة (0.1 إلى 1.0)
  fileType: 'image/jpeg', // نوع الملف النهائي
};

/**
 * ضغط صورة باستخدام Canvas API
 * @param file - ملف الصورة المراد ضغطه
 * @param options - خيارات الضغط
 * @returns ملف الصورة المضغوط
 */
export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<File> {
  return new Promise((resolve, reject) => {
    const compressionOptions = {
      ...defaultCompressionOptions,
      ...options,
    };

    console.log('بدء ضغط الصورة:', {
      originalSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      originalType: file.type,
      options: compressionOptions,
    });

    // التحقق من أن الملف صورة
    if (!isImageFile(file)) {
      reject(new Error('الملف المحدد ليس صورة'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // حساب الأبعاد الجديدة مع الحفاظ على النسبة
        let { width, height } = img;
        const maxDimension = compressionOptions.maxWidthOrHeight;
        
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        // تعيين أبعاد Canvas
        canvas.width = width;
        canvas.height = height;

        // رسم الصورة على Canvas
        ctx?.drawImage(img, 0, 0, width, height);

        // تحويل إلى blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('فشل في ضغط الصورة'));
              return;
            }

            // إنشاء ملف جديد
            const compressedFile = new File([blob], file.name, {
              type: compressionOptions.fileType,
              lastModified: Date.now(),
            });

            console.log('تم ضغط الصورة بنجاح:', {
              originalSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              compressedSize: `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
              reduction: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`,
              newDimensions: `${Math.round(width)}x${Math.round(height)}`,
            });

            resolve(compressedFile);
          },
          compressionOptions.fileType,
          compressionOptions.quality
        );
      } catch (error) {
        console.error('خطأ في ضغط الصورة:', error);
        reject(new Error('فشل في ضغط الصورة. يرجى المحاولة مرة أخرى.'));
      }
    };

    img.onerror = () => {
      reject(new Error('فشل في تحميل الصورة'));
    };

    // تحميل الصورة من الملف
    img.src = URL.createObjectURL(file);
  });
}

/**
 * التحقق من نوع الملف إذا كان صورة
 * @param file - الملف المراد التحقق منه
 * @returns true إذا كان الملف صورة
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * التحقق من حجم الملف
 * @param file - الملف المراد التحقق منه
 * @param maxSizeMB - الحد الأقصى للحجم بالميجابايت
 * @returns true إذا كان الملف أصغر من الحد الأقصى
 */
export function isFileSizeValid(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * الحصول على معلومات الملف
 * @param file - الملف
 * @returns معلومات الملف
 */
export function getFileInfo(file: File) {
  return {
    name: file.name,
    size: file.size,
    sizeMB: (file.size / 1024 / 1024).toFixed(2),
    type: file.type,
    lastModified: new Date(file.lastModified),
  };
}

/**
 * ضغط صورة مع خيارات مخصصة للشعارات
 * @param file - ملف الصورة
 * @returns ملف الصورة المضغوط
 */
export async function compressLogoImage(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 0.5, // 500KB للشعارات
    maxWidthOrHeight: 512, // حجم أصغر للشعارات
    quality: 0.85, // جودة عالية للشعارات
  });
}

/**
 * ضغط صورة مع خيارات مخصصة للصور العامة
 * @param file - ملف الصورة
 * @returns ملف الصورة المضغوط
 */
export async function compressGeneralImage(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 1, // 1MB للصور العامة
    maxWidthOrHeight: 1024,
    quality: 0.8,
  });
}

/**
 * تنسيق حجم الملف لعرضه بشكل مقروء
 * @param bytes - حجم الملف بالبايت
 * @returns النص المنسق
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

