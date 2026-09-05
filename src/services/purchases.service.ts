import api from '@/lib/axiosInstance';
import {
  CreatePurchaseDto,
  UpdatePurchaseDto,
  PayPurchaseDto,
  ConfirmPurchaseDto,
  CancelPurchaseDto,
  GetPurchaseQueryDto,
  GetBatchesQueryDto,
  Purchase,
  ProductBatch,
  VariantCost,
  PriceHistoryItem,
  PurchasesListResponseSchema,
  PurchaseSchema,
  BatchesListResponseSchema,
  VariantCostSchema,
  PriceHistoryResponseSchema,
} from '@/schemas/purchases.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class PurchasesService {
  /**
   * Создать закупку. Документ всегда уходит в DRAFT: товар на склад не
   * приходит и деньги из кассы не списываются до проведения.
   */
  static async create(dto: CreatePurchaseDto): Promise<Purchase> {
    const res = await api.post<ApiResponse<Purchase>>(
      '/purchases/create',
      dto
    );
    return res.data.data;
  }

  /**
   * Получить список всех закупок (с фильтрами и пагинацией)
   */
  static async getAllAdmin(
    query: GetPurchaseQueryDto = {}
  ): Promise<{
    items: Purchase[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const res = await api.get<
      ApiResponse<{
        items: unknown[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>
    >('/purchases/all', {
      params: query,
    });

    return PurchasesListResponseSchema.parse(res.data.data);
  }

  /**
   * Получить одну закупку по ID (позиции, платежи, партии прихода)
   */
  static async findOne(id: string): Promise<Purchase> {
    const res = await api.get<ApiResponse<Purchase>>(`/purchases/${id}`);
    return PurchaseSchema.parse(res.data.data);
  }

  /**
   * Обновить закупку. Разрешено только для черновика и только по полям
   * шапки: поставщик, касса, дата, примечание.
   */
  static async update(
    id: string,
    dto: UpdatePurchaseDto
  ): Promise<Purchase> {
    const res = await api.patch<ApiResponse<Purchase>>(
      `/purchases/update/${id}`,
      dto
    );
    return PurchaseSchema.parse(res.data.data);
  }

  /**
   * Удалить черновик. Проведённую закупку удалить нельзя — только отменить.
   */
  static async remove(id: string): Promise<void> {
    await api.delete(`/purchases/remove/${id}`);
  }

  /**
   * Провести закупку: на каждую позицию создаётся партия с себестоимостью
   * и остатком, растёт Stock. Касса указана — документ ещё и оплачивается.
   */
  static async confirmPurchase(
    purchaseId: string,
    dto: ConfirmPurchaseDto = {}
  ): Promise<Purchase> {
    const res = await api.post<ApiResponse<Purchase>>(
      `/purchases/${purchaseId}/confirm`,
      {
        kassaId: dto.kassaId ?? undefined,
        exchangeRate: dto.exchangeRate ?? undefined,
      }
    );
    return res.data.data;
  }

  /**
   * Отменить проведённую закупку: партии удаляются, товар снимается со
   * склада, деньги возвращаются в кассу. Если из партии уже списывали —
   * бэкенд ответит 409.
   */
  static async cancelPurchase(
    purchaseId: string,
    dto: CancelPurchaseDto = {}
  ): Promise<Purchase> {
    const res = await api.post<ApiResponse<Purchase>>(
      `/purchases/${purchaseId}/cancel`,
      { reason: dto.reason ?? undefined }
    );
    return res.data.data;
  }

  /**
   * Оплатить часть или всю закупку. Черновик оплатить нельзя.
   */
  static async pay(
    purchaseId: string,
    dto: PayPurchaseDto
  ): Promise<Purchase> {
    const res = await api.post<ApiResponse<Purchase>>(
      `/purchases/${purchaseId}/pay`,
      dto
    );
    return PurchaseSchema.parse(res.data.data);
  }

  // ─── Себестоимость ─────────────────────────────────────────────────

  /**
   * Партии: за сколько куплена каждая пачка товара и сколько от неё осталось.
   * order=asc — тот же порядок, в котором будет списывать FIFO.
   */
  static async getBatches(
    query: GetBatchesQueryDto = {}
  ): Promise<{
    items: ProductBatch[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const res = await api.get<ApiResponse<unknown>>('/purchases/batches', {
      params: query,
    });
    return BatchesListResponseSchema.parse(res.data.data);
  }

  /**
   * За сколько куплен вариант товара: средневзвешенная себестоимость,
   * разброс, стоимость остатка и сверка Stock с суммой партий.
   */
  static async getVariantCost(variantId: string): Promise<VariantCost> {
    const res = await api.get<ApiResponse<unknown>>(
      `/purchases/cost/${variantId}`
    );
    return VariantCostSchema.parse(res.data.data);
  }

  /**
   * История закупочных цен варианта — подсказка при заведении накладной.
   */
  static async getPriceHistory(
    variantId: string,
    query: { supplierId?: string; limit?: number } = {}
  ): Promise<PriceHistoryItem[]> {
    const res = await api.get<ApiResponse<unknown>>(
      `/purchases/price-history/${variantId}`,
      { params: query }
    );
    return PriceHistoryResponseSchema.parse(res.data.data);
  }
}
