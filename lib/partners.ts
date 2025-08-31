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
  data: Partner[];
  message: string;
  total?: number;
  page?: number;
  limit?: number;
}

/**
 * إنشاء شريك جديد
 * @param partnerData - بيانات الشريك الجديد
 * @returns استجابة من السيرفر تحتوي على بيانات الشريك المنشأ
 */
export async function createPartner(partnerData: CreatePartnerRequest): Promise<CreatePartnerResponse> {
  const response = await api.post("/partner", partnerData, {
    timeout: 15000,
  });

  return response.data;
}

/**
 * تحديث بيانات شريك موجود
 * @param partnerData - بيانات الشريك المحدثة
 * @returns استجابة من السيرفر تحتوي على بيانات الشريك المحدث
 */
export async function updatePartner(partnerData: UpdatePartnerRequest): Promise<UpdatePartnerResponse> {
  const { _id, ...data } = partnerData;
  const response = await api.put(`/partner/${_id}`, data, {
    timeout: 15000,
  });

  return response.data;
}

/**
 * حذف شريك
 * @param partnerId - معرف الشريك المراد حذفه
 * @returns استجابة من السيرفر
 */
export async function deletePartner(partnerId: string): Promise<DeletePartnerResponse> {
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
  
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await api.get(`/partner?${queryParams.toString()}`);
  return response.data;
}

/**
 * الحصول على شريك واحد
 * @param partnerId - معرف الشريك
 * @returns استجابة من السيرفر تحتوي على بيانات الشريك
 */
export async function getPartner(partnerId: string): Promise<{ status: string; data: Partner; message: string }> {
  const response = await api.get(`/partner/${partnerId}`);
  return response.data;
}

/**
 * التحقق من صحة بيانات الشريك
 * @param data - بيانات الشريك
 * @returns true إذا كانت البيانات صحيحة
 */
export function validatePartnerData(data: any): { isValid: boolean; errors: string[] } {
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

  if (data.website?.trim() && !/^https?:\/\/.+/.test(data.website)) {
    errors.push("الموقع الإلكتروني يجب أن يبدأ بـ http:// أو https://");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * تحويل بيانات النموذج إلى تنسيق API
 * @param formData - بيانات النموذج
 * @returns بيانات جاهزة للإرسال
 */
export function transformFormDataToAPI(formData: any): CreatePartnerRequest {
  return {
    name_ar: formData.nameAr || "",
    name_en: formData.nameEn || undefined,
    email: formData.email || "",
    type: formData.type || "org",
    website: formData.website || undefined,
    status: formData.status || "active",
    join_date: formData.joinDate || "",
    logo: formData.logoFileId || "",
  };
}

/**
 * تحويل بيانات API إلى تنسيق النموذج
 * @param apiData - بيانات من API
 * @returns بيانات جاهزة للنموذج
 */
export function transformAPIToFormData(apiData: Partner): any {
  return {
    nameAr: apiData.name_ar,
    nameEn: apiData.name_en || "",
    email: apiData.email,
    type: apiData.type,
    website: apiData.website || "",
    status: apiData.status,
    joinDate: apiData.join_date,
    logo: apiData.logo?.url || "",
    logoFileId: apiData.logo?._id || "",
  };
}
