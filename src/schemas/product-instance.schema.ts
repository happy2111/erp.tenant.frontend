// Enum статуса экземпляра продукта (дублируем из бэкенда)
export enum ProductStatus {
  IN_STOCK = 'IN_STOCK',
  SOLD = 'SOLD',
  LOST = 'LOST',
  RETURNED = 'RETURNED',
}

// Основная модель экземпляра продукта
export interface ProductInstance {
  id: string;
  serialNumber: string;
  productVariantId: string | null;
  organizationId: string;
  currentOwnerId: string | null;
  currentStatus: ProductStatus;
  createdAt: string;
  updatedAt: string;

  // Включаемые отношения (опционально, зависит от ответа API)
  productVariant?: {
    id: string;
    name: string;
    product: {
      id: string;
      name: string;
    };
  } | null;
  current_owner?: {
    id: string;
    name: string;
    phone?: string;
  } | null;
  transactions?: ProductTransaction[];
}

// Транзакция продукта (для истории)
export interface ProductTransaction {
  id: string;
  date: string;
  action: string;
  description: string | null;
  fromCustomerId: string | null;
  toCustomerId: string | null;
  toOrganizationId: string | null;
  saleId: string | null;
}

// Пагинированный ответ
export interface PaginatedProductInstances {
  data: ProductInstance[];
  total: number;
  page: number;
  limit: number;
}

// DTO для создания
export interface CreateProductInstanceDto {
  productVariantId?: string | null;
  serialNumber: string;
  organizationId: string;
  currentOwnerId?: string | null;
  currentStatus?: ProductStatus;
}

// DTO для обновления
export interface UpdateProductInstanceDto {
  productVariantId?: string | null;
  currentStatus?: ProductStatus;
}

// DTO для фильтрации и пагинации
export interface ProductInstanceFilterDto {
  productVariantId?: string;
  serialNumber?: string;
  status?: ProductStatus;
  currentOwnerId?: string;
  organizationId?: string;
  page?: number;
  limit?: number;
}

// DTO для продажи
export interface SellInstanceDto {
  instanceId: string;
  saleId?: string | null;
  customerId: string;
  description?: string | null;
}

// DTO для возврата
export interface ReturnInstanceDto {
  instanceId: string;
  fromCustomerId?: string | null;
  toOrganizationId?: string | null;
  description?: string | null;
}

// DTO для перемещения между организациями
export interface TransferInstanceDto {
  instanceId: string;
  toOrganizationId: string;
  description?: string | null;
}

// DTO для перепродажи
export interface ResellInstanceDto {
  instanceId: string;
  saleId?: string | null;
  newCustomerId: string;
  description?: string | null;
}

// DTO для пометки как утерянный
export interface MarkLostDto {
  instanceId: string;
  description?: string | null;
}