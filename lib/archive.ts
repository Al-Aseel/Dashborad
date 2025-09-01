import { api } from "./api";

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
  };
}

// API functions
export const archiveApi = {
  // Get archived items
  getAll: async (params: GetArchiveParams = {}): Promise<ArchiveResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
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
};
