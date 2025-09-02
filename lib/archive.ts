import { api, API_BASE_URL } from "./api";

// Types
export interface ArchivedItem {
  _id: string;
  title: string;
  type: string; // النوع من الـ response
  description: string;
  size: string;
  deletedAt?: Date | string; // تاريخ الأرشفة من الـ response
  status: "مؤرشف";
}

export interface GetArchiveParams {
  page?: number;
  limit?: number;
  q?: string; // search query parameter
  type?: string;
}

export interface ArchiveResponse {
  status: string;
  message: string;
  data: {
    items: ArchivedItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    // Optional stats for dashboard cards
    totalNumberOfArchivedItems?: number;
    totalNumberOfArchivedActivities?: number;
    totalNumberOfArchivedPrograms?: number;
    totalNumberOfArchivedReports?: number;
    totalNumberOfArchivedUsers?: number;
  };
}

// API functions
export const archiveApi = {
  // Get archived items
  getAll: async (params: GetArchiveParams = {}): Promise<ArchiveResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", (params.limit || 5).toString());
    if (params.q) queryParams.append("q", params.q);
    if (params.type) queryParams.append("type", params.type);

    const url = `/archive${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await api.get(url);
    return response.data;
  },

  // Search archived items
  search: async (query: string, params: Omit<GetArchiveParams, "q"> = {}): Promise<ArchiveResponse> => {
    return archiveApi.getAll({ ...params, q: query });
  },

  // Permanently delete archived item by type and id
  permanentDelete: async (
    type: string,
    id: string
  ): Promise<{ success: boolean; message: string; data: null }> => {
    const normalizedType = (type || "").toLowerCase();
    const basePath = API_BASE_URL.includes("/api/v1") ? "/archive" : "/api/v1/archive";
    const response = await api.delete(`${basePath}/${normalizedType}/${id}`);
    return response.data;
  },

  // Restore archived item
  restore: async (
    type: string,
    id: string
  ): Promise<{ success: boolean; message: string; data: any }> => {
    const normalizedType = (type || "").toLowerCase();
    const basePath = API_BASE_URL.includes("/api/v1") ? "/archive" : "/api/v1/archive";
    const response = await api.patch(`${basePath}/${normalizedType}/${id}/restore`);
    return response.data;
  },
};
