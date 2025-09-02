import { api } from "./api";

export interface SystemSettings {
  _id: string;
  maxSizeAllowedForFilesInMB: number;
  typesOfImagesAllowed: string;
  typesOfFilesAllowed: string;
  timeToDeleteTempFile: "daily" | "weekly" | "monthly";
  maxFilesPerUpload: number;
  enableFileCompression: boolean;
  tempFileRetentionHours: number;
  systemMaintenanceMode: boolean;
  maintenanceMessage: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SystemSettingsResponse {
  status: string;
  data: SystemSettings;
  message: string;
}

export interface UpdateSystemSettingsRequest {
  maxSizeAllowedForFilesInMB: number;
  typesOfImagesAllowed: string;
  typesOfFilesAllowed: string;
  timeToDeleteTempFile: "daily" | "weekly" | "monthly";
  maxFilesPerUpload?: number;
  enableFileCompression?: boolean;
  tempFileRetentionHours?: number;
  systemMaintenanceMode?: boolean;
  maintenanceMessage?: string;
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

export const getSystemSettings = async (): Promise<SystemSettings> => {
  try {
    const response = await api.get<SystemSettingsResponse>("/system");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching system settings:", error);
    throw error;
  }
};

export const updateSystemSettings = async (
  payload: UpdateSystemSettingsRequest
): Promise<SystemSettings> => {
  try {
    const response = await api.put<SystemSettingsResponse>("/system", payload);
    return response.data.data;
  } catch (error: any) {
    console.error("Error updating system settings:", error);
    if (error.response?.data?.details) {
      throw error;
    }
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "حدث خطأ في تحديث إعدادات النظام";
    throw new Error(errorMessage);
  }
};
