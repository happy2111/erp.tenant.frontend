import {
  CreateProductInstanceDto,
  UpdateProductInstanceDto,
  ProductInstanceFilterDto,
  ProductInstance,
  PaginatedProductInstances,
  SellInstanceDto,
  ReturnInstanceDto,
  TransferInstanceDto,
  ResellInstanceDto,
  MarkLostDto, ProductStatus, ProductTransaction,
} from "@/schemas/product-instance.schema";
import api from "@/lib/axiosInstance";

export class ProductInstanceService {
  // CREATE
  async create(dto: CreateProductInstanceDto): Promise<ProductInstance> {
    const res = await api.post("/product-instances/create", dto);
    return res.data.data;
  }

  // FILTER / LIST
  async findAll(filter: ProductInstanceFilterDto = {}): Promise<PaginatedProductInstances> {
    const res = await api.post("/product-instances/filter", filter);
    return res.data.data;
  }

  // GET ONE
  async findOne(id: string): Promise<ProductInstance> {
    const res = await api.get(`/product-instances/${id}`);
    return res.data.data;
  }

  // UPDATE
  async update(id: string, dto: UpdateProductInstanceDto): Promise<ProductInstance> {
    const res = await api.patch(`/product-instances/update/${id}`, dto);
    return res.data.data;
  }

  // DELETE
  async remove(id: string): Promise<void> {
    await api.delete(`/product-instances/remove/${id}`);
  }

  // SELL
  async sell(dto: SellInstanceDto): Promise<ProductInstance> {
    const res = await api.post("/product-instances/sell", dto);
    return res.data.data;
  }

  // RETURN
  async return(dto: ReturnInstanceDto): Promise<ProductInstance> {
    const res = await api.post("/product-instances/return", dto);
    return res.data.data;
  }

  // TRANSFER
  async transfer(dto: TransferInstanceDto): Promise<ProductInstance> {
    const res = await api.post("/product-instances/transfer", dto);
    return res.data.data;
  }

  // RESELL
  async resell(dto: ResellInstanceDto): Promise<ProductInstance> {
    const res = await api.post("/product-instances/resell", dto);
    return res.data.data;
  }

  // MARK LOST
  async markLost(dto: MarkLostDto): Promise<ProductInstance> {
    const res = await api.post("/product-instances/mark-lost", dto);
    return res.data.data;
  }

  // HISTORY
  async getHistory(instanceId: string): Promise<ProductTransaction[]> {
    const res = await api.get(`/product-instances/history/${instanceId}`);
    return res.data.data;
  }

  // Дополнительные удобные методы
  async getBySerialNumber(serialNumber: string): Promise<ProductInstance | null> {
    const result = await this.findAll({ serialNumber, limit: 1 });
    return result.data[0] || null;
  }

  async getInStock(organizationId: string, limit = 50): Promise<ProductInstance[]> {
    const result = await this.findAll({
      organizationId,
      status: ProductStatus.IN_STOCK,
      limit,
    });
    return result.data;
  }
}

// Экспорт синглтона
export const productInstanceService = new ProductInstanceService();