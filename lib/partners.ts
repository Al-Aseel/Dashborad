import { api } from "./api";

export interface PartnerLogo {
  _id: string;
  fileName: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface Partner {
  _id?: string;
  name_ar: string;
  name_en?: string;
  email: string;
  type: "org" | "member" | "firm";
  website?: string;
  status: "active" | "inactive";
  join_date: string;
  logo?: PartnerLogo;
}

export interface CreatePartnerRequest {
  name_ar: string;
  name_en?: string;
  email: string;
  type: "org" | "member" | "firm";
  website?: string;
  status: "active" | "inactive";
  join_date: string;
  logo: string; // required - file ID
}

export interface CreatePartnerResponse {
  status: string;
  data: Partner;
  message: string;
}

export interface UpdatePartnerRequest extends Partial<CreatePartnerRequest> {
  _id: string;
}

export interface UpdatePartnerResponse {
  status: string;
  data: Partner;
  message: string;
}

export interface DeletePartnerResponse {
  status: string;
  data: any;
  message: string;
}

export interface GetPartnersResponse {
  status: string;
  data: {
    partners: Partner[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

/**
 * إنشاء شريك جديد
 * @param partnerData - بيانات الشريك الجديد
 * @returns استجابة من السيرفر تحتوي على بيانات الشريك المنشأ
 */
export async function createPartner(
  partnerData: CreatePartnerRequest
): Promise<CreatePartnerResponse> {
  const response = await api.post("/partner", partnerData, {
    timeout: 45000,
  });

  return response.data;
}

/**
 * تحديث بيانات شريك موجود
 * @param partnerData - بيانات الشريك المحدثة
 * @returns استجابة من السيرفر تحتوي على بيانات الشريك المحدث
 */
export async function updatePartner(
  partnerData: UpdatePartnerRequest
): Promise<UpdatePartnerResponse> {
  const { _id, ...data } = partnerData;
  const response = await api.put(`/partner/${_id}`, data, {
    timeout: 45000,
  });

  return response.data;
}

/**
 * حذف شريك
 * @param partnerId - معرف الشريك المراد حذفه
 * @returns استجابة من السيرفر
 */
export async function deletePartner(
  partnerId: string
): Promise<DeletePartnerResponse> {
  const response = await api.delete(`/partner/${partnerId}`);
  return response.data;
}

/**
 * الحصول على جميع الشركاء
 * @param params - معاملات البحث والتصفية
 * @returns استجابة من السيرفر تحتوي على قائمة الشركاء
 */
export async function getPartners(params?: {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<GetPartnersResponse> {
  const queryParams = new URLSearchParams();

  if (params?.search) queryParams.append("search", params.search);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.type) queryParams.append("type", params.type);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const response = await api.get(`/partner?${queryParams.toString()}`);
  return response.data;
}

/**
 * الحصول على شريك واحد
 * @param partnerId - معرف الشريك
 * @returns استجابة من السيرفر تحتوي على بيانات الشريك
 */
export async function getPartner(
  partnerId: string
): Promise<{ status: string; data: Partner; message: string }> {
  const response = await api.get(`/partner/${partnerId}`);
  return response.data;
}

/**
 * التحقق من صحة بيانات الشريك
 * @param data - بيانات الشريك
 * @returns true إذا كانت البيانات صحيحة
 */
export function validatePartnerData(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.nameAr?.trim()) {
    errors.push("اسم الشريك بالعربية مطلوب");
  } else if (data.nameAr.trim().length < 3) {
    errors.push("اسم الشريك بالعربية يجب أن يكون 3 أحرف على الأقل");
  }

  if (data.nameEn && data.nameEn.trim().length < 3) {
    errors.push("اسم الشريك بالإنجليزية يجب أن يكون 3 أحرف على الأقل");
  }

  if (!data.email?.trim()) {
    errors.push("البريد الإلكتروني مطلوب");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("البريد الإلكتروني غير صحيح");
  }

  if (!data.type?.trim()) {
    errors.push("نوع الشريك مطلوب");
  } else if (!["org", "member", "firm"].includes(data.type)) {
    errors.push("نوع الشريك يجب أن يكون: org, member, أو firm");
  }

  if (!data.status?.trim()) {
    errors.push("حالة الشريك مطلوبة");
  } else if (!["active", "inactive"].includes(data.status)) {
    errors.push("حالة الشريك يجب أن تكون: active أو inactive");
  }

  if (!data.joinDate?.trim()) {
    errors.push("تاريخ الانضمام مطلوب");
  }

  if (!data.logoFileId?.trim()) {
    errors.push("شعار الشريك مطلوب");
  }

  if (data.website?.trim()) {
    // السماح بالروابط المحلية والخارجية مع دعم www. اختياري
    // أمثلة صحيحة: example.com, www.example.com, https://www.example.com, http://example.com
    const websiteRegex =
      /^(https?:\/\/)?(www\.)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    const isLocalhost =
      data.website.startsWith("http://localhost") ||
      data.website.startsWith("https://localhost");
    const isExternal = websiteRegex.test(data.website);

    // منع الروابط الداخلية للتطبيق
    if (
      data.website.includes("/partners") ||
      data.website.includes("/users") ||
      data.website.includes("/projects")
    ) {
      errors.push("لا يمكن استخدام روابط داخلية للتطبيق كموقع للشريك");
    }
    // السماح بالروابط المحلية والخارجية الصحيحة
    else if (!isLocalhost && !isExternal) {
      errors.push("الرجاء إدخال رابط موقع صالح");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * تحويل بيانات النموذج إلى تنسيق API
 * @param formData - بيانات النموذج
 * @returns بيانات جاهزة للإرسال
 */
export function transformFormDataToAPI(formData: any): CreatePartnerRequest {
  // Convert YYYY-MM-DD date to ISO format for API
  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      // Set time to start of day in local timezone
      date.setHours(0, 0, 0, 0);
      return date.toISOString();
    } catch (error) {
      console.error("Error formatting date for API:", error);
      return "";
    }
  };

  return {
    name_ar: formData.nameAr || "",
    name_en: formData.nameEn || undefined,
    email: formData.email || "",
    type: formData.type || "org",
    website: formData.website || undefined,
    status: formData.status || "active",
    join_date: formatDateForAPI(formData.joinDate),
    logo: formData.logoFileId || "",
  };
}

/**
 * تحويل بيانات API إلى تنسيق النموذج
 * @param apiData - بيانات من API
 * @returns بيانات جاهزة للنموذج
 */
export function transformAPIToFormData(apiData: Partner): any {
  // Convert ISO date to YYYY-MM-DD format for form input
  const formatDateForInput = (isoDateString: string): string => {
    if (!isoDateString) return "";
    try {
      const date = new Date(isoDateString);
      if (isNaN(date.getTime())) return "";

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  return {
    nameAr: apiData.name_ar,
    nameEn: apiData.name_en || "",
    email: apiData.email,
    type: apiData.type,
    website: apiData.website || "",
    status: apiData.status,
    joinDate: formatDateForInput(apiData.join_date),
    logo: apiData.logo?.url || "",
    logoFileId: apiData.logo?._id || "",
  };
}
