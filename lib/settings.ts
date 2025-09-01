import { api } from "./api";

export interface WebsiteLogo {
  _id: string;
  url: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface Settings {
  mainColor: string;
  websiteName_ar: string;
  websiteName_en: string;
  websiteLogo: WebsiteLogo | null;
  contactNumber: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  whatsappNumber: string;
  website: string;
  description: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SettingsResponse {
  status: string;
  data: Settings;
  message: string;
}

export interface UpdateSettingsRequest {
  websiteName_ar: string;
  websiteName_en: string;
  websiteLogo: string | null; // سيحتوي على imageId بدلاً من URL
  contactNumber: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  whatsappNumber: string;
  website: string;
  description: string;
}

export interface ValidationError {
  param: string;
  msg: string;
}

export interface ErrorResponse {
  status: string;
  message: string;
  details?: ValidationError[];
}

/**
 * جلب إعدادات الموقع
 */
export const getSettings = async (): Promise<Settings> => {
  try {
    const response = await api.get<SettingsResponse>("/setting");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

/**
 * تحديث إعدادات الموقع
 */
export const updateSettings = async (
  settings: UpdateSettingsRequest
): Promise<Settings> => {
  try {
    const response = await api.put<SettingsResponse>("/setting", settings);
    return response.data.data;
  } catch (error: any) {
    console.error("Error updating settings:", error);

    // معالجة أخطاء التحقق من صحة البيانات
    if (error.response?.data?.details) {
      console.log("Validation errors found:", error.response.data.details);
      // نعيد الخطأ كما هو بدون تجميع الرسائل
      throw error;
    }

    // معالجة الأخطاء العامة
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "حدث خطأ في تحديث الإعدادات";
    throw new Error(errorMessage);
  }
};
