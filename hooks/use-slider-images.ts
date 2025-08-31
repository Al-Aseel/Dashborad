import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  SliderImage,
  CreateSliderImageRequest,
  UpdateSliderImageRequest,
  uploadImage,
  deleteUploadedImage,
  createSliderImage,
  getAllSliderImages,
  getSliderImageById,
  updateSliderImage,
  deleteSliderImage,
} from "@/lib/slider-images";

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function useSliderImages() {
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Fetch all slider images with pagination
  const fetchSliderImages = useCallback(
    async (page: number = 1, limit: number = 10) => {
      setLoading(true);
      try {
        const result = await getAllSliderImages(page, limit);
        setSliderImages(result.images);
        setPagination(result.pagination);
      } catch (error) {
        console.error("Error fetching slider images:", error);
        toast.error("فشل في تحميل صور السلايدر");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Upload image file
  const uploadImageFile = useCallback(
    async (file: File): Promise<{ id: string; url: string } | null> => {
      setUploading(true);
      try {
        const result = await uploadImage(file);
        toast.success("تم رفع الصورة بنجاح");
        return result;
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("فشل في رفع الصورة");
        return null;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  // Create new slider image
  const createNewSliderImage = useCallback(
    async (data: CreateSliderImageRequest): Promise<SliderImage | null> => {
      setLoading(true);
      try {
        const newImage = await createSliderImage(data);
        // Refresh the current page after creating
        await fetchSliderImages(pagination.page, pagination.limit);
        toast.success("تم إنشاء صورة السلايدر بنجاح");
        return newImage;
      } catch (error) {
        console.error("Error creating slider image:", error);
        toast.error("فشل في إنشاء صورة السلايدر");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchSliderImages, pagination.page, pagination.limit]
  );

  // Update slider image
  const updateExistingSliderImage = useCallback(
    async (
      id: string,
      data: UpdateSliderImageRequest
    ): Promise<SliderImage | null> => {
      setLoading(true);
      try {
        const updatedImage = await updateSliderImage(id, data);
        // Refresh the current page after updating
        await fetchSliderImages(pagination.page, pagination.limit);
        toast.success("تم تحديث صورة السلايدر بنجاح");
        return updatedImage;
      } catch (error) {
        console.error("Error updating slider image:", error);
        toast.error("فشل في تحديث صورة السلايدر");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchSliderImages, pagination.page, pagination.limit]
  );

  // Delete slider image
  const deleteExistingSliderImage = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      try {
        await deleteSliderImage(id);
        // Refresh the current page after deleting
        await fetchSliderImages(pagination.page, pagination.limit);
        toast.success("تم حذف صورة السلايدر بنجاح");
        return true;
      } catch (error) {
        console.error("Error deleting slider image:", error);
        toast.error("فشل في حذف صورة السلايدر");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchSliderImages, pagination.page, pagination.limit]
  );

  // Delete uploaded image file
  const deleteImageFile = useCallback(
    async (imageId: string): Promise<boolean> => {
      try {
        await deleteUploadedImage(imageId);
        return true;
      } catch (error) {
        console.error("Error deleting image file:", error);
        return false;
      }
    },
    []
  );

  // Get specific slider image
  const getSliderImage = useCallback(
    async (id: string): Promise<SliderImage | null> => {
      try {
        const image = await getSliderImageById(id);
        return image;
      } catch (error) {
        console.error("Error fetching slider image:", error);
        toast.error("فشل في تحميل صورة السلايدر");
        return null;
      }
    },
    []
  );

  // Load images on mount
  useEffect(() => {
    fetchSliderImages(1, 10);
  }, [fetchSliderImages]);

  return {
    sliderImages,
    loading,
    uploading,
    pagination,
    fetchSliderImages,
    uploadImageFile,
    createNewSliderImage,
    updateExistingSliderImage,
    deleteExistingSliderImage,
    deleteImageFile,
    getSliderImage,
  };
}
