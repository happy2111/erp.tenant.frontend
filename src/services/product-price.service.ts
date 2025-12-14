import {
  CreateProductPriceDto,
  UpdateProductPriceDto,
  ProductPriceFilterDto,
  ProductPrice,
  PaginatedProductPrices, PriceType,
} from "@/schemas/product-price.schema";
import api from "@/lib/axiosInstance";

export class ProductPriceService {
  async create(dto: CreateProductPriceDto): Promise<ProductPrice> {
    const res = await api.post("/product-prices/create", dto);
    return res.data.data;
  }

  async findAll(filter: ProductPriceFilterDto): Promise<PaginatedProductPrices> {
    const res = await api.post("/product-prices/filter", filter);
    return res.data.data;
  }

  async findOne(id: string): Promise<ProductPrice> {
    const res = await api.get(`/product-prices/${id}`);
    return res.data.data;
  }

  async update(id: string, dto: UpdateProductPriceDto): Promise<ProductPrice> {
    const res = await api.patch(`/product-prices/update/${id}`, dto);
    return res.data.data;
  }

  async remove(id: string): Promise<void> {
    const res = await api.delete(`/product-prices/remove/${id}`);
    return res.data.data;
  }

  // Дополнительные методы

  async getProductPrices(productId: string): Promise<ProductPrice[]> {
    const res = await this.findAll({ productId, limit: 100 });
    return res.data;
  }

  async getCashPrice(productId: string): Promise<ProductPrice | null> {
    const prices = await this.getProductPrices(productId);
    return prices.find(price => price.priceType === PriceType.CASH && !price.customerType) || null;
  }

  async getOnlinePrice(productId: string): Promise<ProductPrice | null> {
    const prices = await this.getProductPrices(productId);
    return prices.find(price => price.priceType === PriceType.ONLINE) || null;
  }
}

// Экспорт синглтона
export const productPriceService = new ProductPriceService();