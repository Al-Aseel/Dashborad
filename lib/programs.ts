import { api } from "./api";

export interface CreateProgramBody {
  name: string;
  description: string;
  category: string; // categoryId
  status: string; // e.g. "active"
  location: string;
  budget: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
  manager: string;
  numberOfBeneficiary: number;
  content: string; // rich text html
  goals: string[];
  activities: string[];
  coverImage?: string; // fileId
  gallery?: Array<{ fileId: string; title?: string }>;
  file?: string; // fileId for optional file attachment
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export const ProgramsApi = {
  createProgram: async <T = any>(body: CreateProgramBody): Promise<ApiResponse<T>> => {
    const response = await api.post("/program", body);
    return response.data;
  },
  updateProgram: async <T = any>(id: string, body: Partial<CreateProgramBody>): Promise<ApiResponse<T>> => {
    const response = await api.put(`/program/${id}`, body);
    return response.data;
  },
  deleteProgram: async <T = any>(id: string): Promise<ApiResponse<T>> => {
    const response = await api.delete(`/program/${id}`);
    return response.data;
  },
  getProgramById: async <T = any>(id: string): Promise<ApiResponse<T>> => {
    const response = await api.get(`/program/${id}`);
    return response.data;
  },
  getPrograms: async (
    params: {
      page?: number;
      limit?: number;
      status?: "scheduled" | "completed" | "active" | "stopped";
      category?: string;
      location?: string;
      manager?: string;
      active?: boolean;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {}
  ): Promise<
    ApiResponse<{
      programs: any[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }> & {
      totalNumberOfPrograms?: number;
      numberOfActivePrograms?: number;
      totalBudget?: number;
      totalNumberOfBeneficiaries?: number;
    }
  > => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.status) query.append("status", params.status);
    if (params.category) query.append("category", params.category);
    if (params.location) query.append("location", params.location);
    if (params.manager) query.append("manager", params.manager);
    if (params.active !== undefined) query.append("active", String(params.active));
    if (params.search) query.append("search", params.search);
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.sortOrder) query.append("sortOrder", params.sortOrder);

    const response = await api.get(`/program?${query.toString()}`);
    return response.data;
  },
};


