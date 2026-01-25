import api from "@/lib/axiosInstance";
import { CreateProductImageDto } from "@/schemas/product-image.schema";

export class ProductImagesService {
  async list(productId: string) {
    const res = await api.get(`/products/images/${productId}`);
    return res.data.data;
  }

  async upload(productId: string, file: File, dto: CreateProductImageDto) {
    const formData = new FormData();
    formData.append("file", file);
    if (dto.isPrimary) formData.append("isPrimary", "true");

    const res = await api.post(`/products/images/${productId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  }

  async remove(imageId: string) {
    const res = await api.delete(`/products/images/${imageId}`);
    return res.data.data;
  }
}

export const productImagesService = new ProductImagesService();
