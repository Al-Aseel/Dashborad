import { api } from "./api";

export type OverviewResponse = {
  status: string;
  message: string;
  data: {
    general: {
      totalProjects: number;
      totalActiveProjects: number;
      totalInactiveProjects: number;
      totalBeneficiaries: number;
      totalReports: number;
      totalActivePartners: number;
    };
    recent: {
      projects: Array<{
        id: string;
        name: string;
        status: string;
        startDate: string;
        endDate: string;
        numberOfBeneficiary: number;
        budget: number;
        coverImage?: { fileName?: string; url?: string } | null;
      }>;
      reports: Array<{
        id: string;
        title: string;
        type: string;
        author: string;
        status: string;
        createdAt: string;
        file?: { fileName?: string; url?: string } | null;
      }>;
      partners: Array<{
        id: string;
        name_ar: string;
        name_en?: string;
        type: string;
        status: string;
        join_date: string;
        logo?: { fileName?: string; url?: string } | null;
      }>;
    };
  };
};

export async function getDashboardOverview(): Promise<OverviewResponse> {
  const response = await api.get("/overview");
  return response.data as OverviewResponse;
}


