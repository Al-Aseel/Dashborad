// Base URL for images and API
export const config = {
  // Base URL for images - يمكن تغييرها حسب البيئة
  imageBaseUrl:
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "http://localhost:5000",

  // API Base URL
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1",
};

// دالة لبناء URL الصورة
export const buildImageUrl = (imagePath: string): string => {
  if (!imagePath) return "";

  // إذا كان المسار يحتوي على http أو https، استخدمه كما هو
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // إذا كان المسار يبدأ بـ /، أضف Base URL
  if (imagePath.startsWith("/")) {
    return `${config.imageBaseUrl}${imagePath}`;
  }

  // إذا كان المسار نسبي، أضف Base URL مع /
  return `${config.imageBaseUrl}/${imagePath}`;
};
