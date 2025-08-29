import { api } from "./api";

export type CreateReportBody = {
  title: string;
  type: "media" | "financial" | "management" | "project" | "statistic";
  author: string;
  createdAt: string; // YYYY-MM-DD
  status: "published" | "draft";
  file: string; // fileId
};

export type ReportResponse = {
  status: string;
  data: {
    _id: string;
    title: string;
    type: string;
    author: string;
    createdAt: string;
    status: string;
    file: string;
  };
  message: string;
};

export async function createReport(body: CreateReportBody): Promise<ReportResponse> {
  const response = await api.post("/report", body);
  return response.data;
}

export type ListReportsQuery = {
  page?: number;
  limit?: number;
  type?: "media" | "financial" | "management" | "project" | "statistic";
  status?: "published" | "draft";
  author?: string;
  search?: string;
};

export type ListReportsResponse = {
  status: string;
  data: {
    reports: Array<{
      _id: string;
      title: string;
      type: string;
      author: string;
      createdAt: string;
      status: string;
      file?: { url?: string } | string;
    }>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
  message: string;
  totalNumberOfReports: number;
  numberOfMediaReports: number;
  numberOfFinancialReports: number;
  numberOfManagementReports: number;
  numberOfProjectReports: number;
  numberOfStatisticReports: number;
};

export async function listReports(params: ListReportsQuery = {}): Promise<ListReportsResponse> {
  const response = await api.get("/report", { params });
  return response.data;
}

export type GetReportByIdResponse = {
  status: string;
  data: {
    _id: string;
    title: string;
    type: string;
    author: string;
    createdAt: string;
    status: string;
    file?: { url?: string } | string;
  };
  message: string;
};

export async function getReportById(id: string): Promise<GetReportByIdResponse> {
  const response = await api.get(`/report/${id}`);
  return response.data;
}

export type UpdateReportBody = CreateReportBody;
export type UpdateReportResponse = ReportResponse;

export async function updateReport(id: string, body: UpdateReportBody): Promise<UpdateReportResponse> {
  const response = await api.put(`/report/${id}`, body);
  return response.data;
}

export type DeleteReportResponse = {
  status: string;
  data: null;
  message: string; // "تم حذف التقرير بنجاح"
};

export async function deleteReport(id: string): Promise<DeleteReportResponse> {
  const response = await api.delete(`/report/${id}`);
  return response.data;
}


