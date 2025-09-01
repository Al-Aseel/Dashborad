import { useState, useEffect, useCallback } from "react";
import {
  archiveApi,
  ArchivedItem,
  GetArchiveParams,
  ArchiveResponse,
} from "@/lib/archive";
import { useToast } from "@/hooks/use-toast";

export const useArchive = () => {
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const { toast } = useToast();

  const extractErrorMessage = useCallback((err: any, fallback: string) => {
    const data = err?.response?.data;
    if (!data) return fallback;
    const detailsJoined = Array.isArray(data.details)
      ? data.details
          .map((d: any) => d?.msg || d?.message)
          .filter(Boolean)
          .join(" | ")
      : undefined;
    if (detailsJoined && detailsJoined.trim() !== "") return detailsJoined;
    return data.message || fallback;
  }, []);

  // Fetch archived items
  const fetchArchivedItems = useCallback(
    async (params: GetArchiveParams = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response: ArchiveResponse = await archiveApi.getAll({
          page: params.page || 1,
          limit: params.limit || 10,
          q: params.q,
          type: params.type,
        });

        setArchivedItems(response.data.items);
        setPagination(response.data.pagination);

        return response;
      } catch (err: any) {
        const errorMessage = extractErrorMessage(
          err,
          "حدث خطأ أثناء جلب العناصر المؤرشفة"
        );
        setError(errorMessage);
        toast({
          title: "خطأ",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [toast, extractErrorMessage]
  );

  // Search archived items
  const searchItems = useCallback(
    async (query: string, params: Omit<GetArchiveParams, "q"> = {}) => {
      return fetchArchivedItems({ ...params, q: query });
    },
    [fetchArchivedItems]
  );

  // Load archived items on mount
  useEffect(() => {
    fetchArchivedItems();
  }, [fetchArchivedItems]);

  return {
    archivedItems,
    loading,
    error,
    pagination,
    fetchArchivedItems,
    searchItems,
  };
};
