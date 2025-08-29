import { useState, useEffect, useCallback } from "react";
import {
  activitiesApi,
  Activity,
  GetActivitiesParams,
  ActivitiesResponse,
  CreateActivityData,
  UpdateActivityData,
  UploadResponse,
  UploadImagesResponse,
} from "@/lib/activities";
import { useToast } from "@/hooks/use-toast";

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
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
    // Prefer showing only details messages if provided
    if (detailsJoined && detailsJoined.trim() !== "") return detailsJoined;
    return data.message || fallback;
  }, []);

  // Fetch activities
  const fetchActivities = useCallback(
    async (params: GetActivitiesParams = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response: ActivitiesResponse = await activitiesApi.getAll({
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search,
          type: params.type,
          status: params.status,
          category: params.category,
          isSpecial: params.isSpecial,
        });

        setActivities(response.data.activities);
        setPagination(response.data.pagination);

        return response;
      } catch (err: any) {
        const errorMessage = extractErrorMessage(
          err,
          "حدث خطأ أثناء جلب الأنشطة"
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

  // Create activity
  const createActivity = useCallback(
    async (activityData: CreateActivityData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await activitiesApi.create(activityData);

        // Refresh activities list
        await fetchActivities();

        toast({
          title: "نجح",
          description: response.message || "تم إنشاء النشاط بنجاح",
        });

        return response.data;
      } catch (err: any) {
        const errorMessage = extractErrorMessage(
          err,
          "حدث خطأ أثناء إنشاء النشاط"
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
    [fetchActivities, toast, extractErrorMessage]
  );

  // Update activity
  const updateActivity = useCallback(
    async (id: string, activityData: UpdateActivityData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await activitiesApi.update(id, activityData);

        // Update local state
        setActivities((prev) =>
          prev.map((activity) =>
            activity._id === id ? response.data : activity
          )
        );

        toast({
          title: "نجح",
          description: response.message || "تم تحديث النشاط بنجاح",
        });

        return response.data;
      } catch (err: any) {
        const errorMessage = extractErrorMessage(
          err,
          "حدث خطأ أثناء تحديث النشاط"
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

  // Delete activity
  const deleteActivity = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await activitiesApi.delete(id);

        // Remove from local state
        setActivities((prev) => prev.filter((activity) => activity._id !== id));

        toast({
          title: "نجح",
          description: response.message || "تم حذف النشاط بنجاح",
        });

        return response;
      } catch (err: any) {
        const errorMessage = extractErrorMessage(
          err,
          "حدث خطأ أثناء حذف النشاط"
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

  // Get single activity
  const getActivity = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await activitiesApi.getById(id);
        return response.data;
      } catch (err: any) {
        const errorMessage = extractErrorMessage(
          err,
          "حدث خطأ أثناء جلب النشاط"
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

  // Upload single image
  const uploadImage = useCallback(
    async (file: File): Promise<UploadResponse> => {
      try {
        const response = await activitiesApi.uploadImage(file);
        return response;
      } catch (err: any) {
        const errorMessage = extractErrorMessage(
          err,
          "حدث خطأ أثناء رفع الصورة"
        );
        toast({
          title: "خطأ",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      }
    },
    [toast, extractErrorMessage]
  );

  // Upload multiple images
  const uploadImages = useCallback(
    async (files: File[]): Promise<UploadImagesResponse> => {
      try {
        const response = await activitiesApi.uploadImages(files);
        return response;
      } catch (err: any) {
        const errorMessage = extractErrorMessage(
          err,
          "حدث خطأ أثناء رفع الصور"
        );
        toast({
          title: "خطأ",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      }
    },
    [toast, extractErrorMessage]
  );

  // Delete uploaded image by fileId
  const deleteUploadedImage = useCallback(
    async (fileId: string) => {
      try {
        const res = await activitiesApi.deleteImage(fileId);
        toast({ title: "نجح", description: res.message || "تم حذف الصورة" });
        return res;
      } catch (err: any) {
        const errorMessage = extractErrorMessage(
          err,
          "حدث خطأ أثناء حذف الصورة"
        );
        toast({
          title: "خطأ",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      }
    },
    [toast, extractErrorMessage]
  );

  // Load activities on mount
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    error,
    pagination,
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    getActivity,
    uploadImage,
    uploadImages,
    deleteUploadedImage,
  };
};
