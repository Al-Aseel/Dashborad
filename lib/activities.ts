import { api } from "./api";

// Types
export interface ActivityImage {
  _id: string;
  fileName: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface ActivityCategory {
  _id: string;
  name: string;
}

export interface ActivityCreatedBy {
  _id: string;
  name: string;
  email: string;
}

export interface GalleryItem {
  fileId: string;
  title?: string;
}

export interface Activity {
  _id: string;
  name: string;
  description: string;
  content: string;
  type: string;
  category: ActivityCategory;
  author: string;
  status: string;
  scheduledAt?: Date;
  keywords: string[];
  isSpecial: boolean;
  coverImage?: ActivityImage | string;
  gallery: ActivityImage[];
  createdAt: Date;
  created_by: ActivityCreatedBy;
}

export interface CreateActivityData {
  name: string;
  coverImage: string;
  type: string;
  category: string;
  author: string;
  status: string;
  scheduled_date?: string;
  scheduled_time?: string;
  description: string;
  content: string;
  createdAt: string;
  gallery?: GalleryItem[];
  keywords?: string[];
  isSpecial?: boolean;
}

export interface UpdateActivityData {
  name?: string;
  coverImage?: string;
  type?: string;
  category?: string;
  author?: string;
  status?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  description?: string;
  content?: string;
  createdAt?: string;
  gallery?: GalleryItem[];
  keywords?: string[];
  isSpecial?: boolean;
}

export interface ActivitiesResponse {
  status: string;
  message: string;
  data: {
    activities: Activity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface GetActivitiesParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  category?: string;
  isSpecial?: boolean;
}

export interface UploadResponse {
  status: string;
  message: string;
  data: {
    id?: string;
    _id?: string;
    fileName: string;
    originalName: string;
    url: string;
    size: number;
    mimeType: string;
  };
}

export interface UploadImagesResponse {
  status: string;
  message: string;
  data: Array<{
    id?: string;
    _id?: string;
    fileName: string;
    originalName: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
}

// API Functions
export const activitiesApi = {
  // Get all activities with pagination and filters
  getAll: async (
    params: GetActivitiesParams = {}
  ): Promise<ActivitiesResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.type) {
      const mappedType = params.type === "news" ? "new" : params.type;
      queryParams.append("type", mappedType);
    }
    if (params.status) queryParams.append("status", params.status);
    if (params.category) queryParams.append("category", params.category);
    if (params.isSpecial !== undefined)
      queryParams.append("isSpecial", params.isSpecial.toString());

    const response = await api.get(`/activity?${queryParams.toString()}`);
    return response.data;
  },

  // Get single activity by ID
  getById: async (
    id: string
  ): Promise<{ status: string; message: string; data: Activity }> => {
    const response = await api.get(`/activity/${id}`);
    return response.data;
  },

  // Create new activity
  create: async (
    activityData: CreateActivityData
  ): Promise<{ status: string; message: string; data: Activity }> => {
    const response = await api.post("/activity", activityData);
    return response.data;
  },

  // Update activity
  update: async (
    id: string,
    activityData: UpdateActivityData
  ): Promise<{ status: string; message: string; data: Activity }> => {
    const response = await api.put(`/activity/${id}`, activityData);
    return response.data;
  },

  // Delete activity
  delete: async (id: string): Promise<{ status: string; message: string }> => {
    const response = await api.delete(`/activity/${id}`);
    return response.data;
  },

  // Upload single image for cover - using endpoint/key per spec
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();

    // The server expects 'image' field with binary file data
    formData.append("image", file, file.name);

    // Log the FormData contents for debugging (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log("Uploading image:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          value:
            value instanceof File
              ? `File: ${value.name} (${value.size} bytes)`
              : value,
        })),
      });
    }

    const response = await api.post("/upload/image", formData, {
      headers: {
        // Don't set Content-Type manually - let the browser set it with boundary
        // "Content-Type": "multipart/form-data",
      },
      // Ensure proper timeout for file uploads - increased for gallery uploads
      timeout: 90000,
    });
    return response.data;
  },

  // Upload multiple images for gallery - using endpoint/key per spec
  uploadImages: async (files: File[]): Promise<UploadImagesResponse> => {
    const formData = new FormData();

    // Append as 'images' per server contract
    files.forEach((file) => {
      formData.append("images", file, file.name);
    });

    // Log the FormData contents for debugging (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log("Uploading multiple images:", {
        fileCount: files.length,
        files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          value:
            value instanceof File
              ? `File: ${value.name} (${value.size} bytes)`
              : value,
        })),
      });
    }

    const response = await api.post("/upload/images", formData, {
      headers: {
        // Don't set Content-Type manually - let the browser set it with boundary
        // "Content-Type": "multipart/form-data",
      },
      // Ensure proper timeout for file uploads - increased for gallery uploads
      timeout: 90000,
    });
    return response.data;
  },

  // Delete uploaded image by fileId (server fileName)
  deleteImage: async (
    fileId: string
  ): Promise<{ status: string; message: string }> => {
    const response = await api.delete(`/upload/file/${fileId}`);
    return response.data;
  },
};
