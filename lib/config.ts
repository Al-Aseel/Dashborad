// Base URL for images and API
export const config = {
  // API Base URL - استخدام نفس baseURL للصور والAPI
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.elaseel.org/api/v1",

  // Base URL for images - استخراج من API Base URL
  get imageBaseUrl() {
    // إزالة /api/v1 من نهاية API Base URL للحصول على base URL للصور
    return this.apiBaseUrl.replace("/api/v1", "");
  },
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
