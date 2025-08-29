import { api } from "./api";

type UploadFileSuccess = {
  status: string;
  data: {
    _id?: string;
    id?: string;
    fileName?: string;
    originalName?: string;
    url?: string;
    size?: number;
    mimeType?: string;
  };
  message: string;
};

export async function uploadPdf(file: File): Promise<UploadFileSuccess> {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await api.post("/upload/file", formData, {
    headers: {
      // Let the browser set multipart boundary automatically
    },
    timeout: 30000,
  });
  return response.data;
}

export async function deleteFileById(fileId: string): Promise<{ status: string; data: any; message: string }> {
  const response = await api.delete(`/upload/file/${fileId}`);
  return response.data;
}

export function extractUploadedFileId(payload: any): string | undefined {
  // Prefer Mongo ObjectId `_id` strictly for report `fileId`
  const objectId = String(payload?.data?._id ?? "").trim();
  if (objectId && /^[a-f\d]{24}$/i.test(objectId)) return objectId;
  // Fallbacks (not ideal for report create which expects ObjectId, but keep for general use)
  const anyId = String(payload?.data?.id ?? payload?.data?.fileName ?? "").trim();
  return anyId || undefined;
}


