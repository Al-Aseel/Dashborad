import { api, API_BASE_URL } from "./api";

// Helper function to get clean base URL
function getBaseUrl(): string {
  try {
    const url = new URL(API_BASE_URL);
    return `${url.protocol}//${url.host}`;
  } catch {
    // Fallback: remove everything after the first path segment
    return API_BASE_URL.replace(/\/[^\/].*$/, "").replace(/\/$/, "");
  }
}

export interface SliderImage {
  _id: string;
  image: string; // image ID
  title?: string;
  description?: string;
  imageUrl?: string; // full URL for display
  isActive?: boolean;
  isMainImage?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSliderImageRequest {
  image: string; // image ID
  title?: string;
  description?: string;
  isActive?: boolean;
  isMainImage?: boolean;
}

export interface UpdateSliderImageRequest {
  image?: string;
  title?: string;
  description?: string;
  isActive?: boolean;
  isMainImage?: boolean;
}

// Upload image to server
export async function uploadImage(
  file: File
): Promise<{ id: string; url: string }> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post("/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
  });

  const responseData = response.data.data || response.data;
  return {
    id: responseData._id || responseData.id,
    url: `${getBaseUrl()}/${responseData.url}`,
  };
}

// Delete uploaded image
export async function deleteUploadedImage(imageId: string): Promise<void> {
  await api.delete(`/upload/file/${imageId}`);
}

// Create new slider image
export async function createSliderImage(
  data: CreateSliderImageRequest
): Promise<SliderImage> {
  const response = await api.post("/slider-image", data);
  const item = response.data.data || response.data;
  return {
    _id: item._id,
    title: item.title,
    description: item.description,
    image: item.image?._id || item.image,
    imageUrl: item.image?.url ? `${getBaseUrl()}/${item.image.url}` : undefined,
    isActive: item.isActive,
    isMainImage: item.isMainImage,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

// Get all slider images with pagination
export async function getAllSliderImages(
  page: number = 1,
  limit: number = 10
): Promise<{ images: SliderImage[]; pagination: any }> {
  const response = await api.get(`/slider-image?page=${page}&limit=${limit}`);

  // Handle different response structures
  let data = response.data;
  let pagination = null;

  // Check for the specific structure we received
  if (
    response.data &&
    response.data.data &&
    response.data.data.sliderImages &&
    Array.isArray(response.data.data.sliderImages)
  ) {
    data = response.data.data.sliderImages;
    pagination = response.data.data.pagination;
  } else if (
    response.data &&
    response.data.data &&
    Array.isArray(response.data.data)
  ) {
    data = response.data.data;
    pagination = response.data.pagination;
  } else if (response.data && Array.isArray(response.data)) {
    data = response.data;
    pagination = response.data.pagination;
  } else if (
    response.data &&
    response.data.items &&
    Array.isArray(response.data.items)
  ) {
    data = response.data.items;
    pagination = response.data.pagination;
  } else {
    // If no array found, return empty array
    console.warn("No array found in response:", response.data);
    return {
      images: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    };
  }

  const images = data.map((item: any) => ({
    _id: item._id,
    title: item.title,
    description: item.description,
    image: item.image?._id || item.image, // Handle both object and string
    imageUrl: item.image?.url ? `${getBaseUrl()}/${item.image.url}` : undefined,
    isActive: item.isActive,
    isMainImage: item.isMainImage,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return {
    images,
    pagination: pagination || { page: 1, limit: 10, total: 0, pages: 0 },
  };
}

// Get specific slider image by ID
export async function getSliderImageById(id: string): Promise<SliderImage> {
  const response = await api.get(`/slider-image/${id}`);
  const item = response.data.data || response.data;
  return {
    _id: item._id,
    title: item.title,
    description: item.description,
    image: item.image?._id || item.image,
    imageUrl: item.image?.url ? `${getBaseUrl()}/${item.image.url}` : undefined,
    isActive: item.isActive,
    isMainImage: item.isMainImage,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

// Update slider image
export async function updateSliderImage(
  id: string,
  data: UpdateSliderImageRequest
): Promise<SliderImage> {
  const response = await api.put(`/slider-image/${id}`, data);
  const item = response.data.data || response.data;
  return {
    _id: item._id,
    title: item.title,
    description: item.description,
    image: item.image?._id || item.image,
    imageUrl: item.image?.url ? `${getBaseUrl()}/${item.image.url}` : undefined,
    isActive: item.isActive,
    isMainImage: item.isMainImage,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

// Delete slider image
export async function deleteSliderImage(id: string): Promise<void> {
  await api.delete(`/slider-image/${id}`);
}
