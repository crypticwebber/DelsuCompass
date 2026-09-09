import { apiClient } from "@/services/api/axios";

type UploadResult = { url: string; publicId: string; width?: number; height?: number };
type R<T> = { success: true; data: T };

export const mediaApi = {
  async uploadImage(file: File) {
    const form = new FormData();
    form.append("image", file);
    // Do not set Content-Type manually. The browser must add the multipart
    // boundary; forcing multipart/form-data can cause Multer to receive no file.
    const { data } = await apiClient.post<R<UploadResult>>("/media/images", form, { timeout: 45_000 });
    return data.data;
  },
};
