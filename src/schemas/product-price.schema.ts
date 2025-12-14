import { z } from "zod";
import { Product } from "./product.schema";
import { Currency } from "./currency.schema";
import { Organization } from "./organization.schema";

// UUID валидация
const uuidSchema = z.string().uuid({ message: "Неверный формат UUID" });

// Enum для типов цен (обновленный согласно Prisma schema)
export enum PriceType {
  CASH = "CASH", // Цена при оплате наличными / сразу
  INSTALLMENT = "INSTALLMENT", // Рассрочка (например, на 6/12 месяцев)
  WHOLESALE = "WHOLESALE", // Оптовая цена, при больших объёмах
  ONLINE = "ONLINE", // цена в интернет-магазине (Click / Telegram)
  SPECIAL = "SPECIAL", // индивидуальная скидка / промо
}

// Enum для типов клиентов
export enum CustomerType {
  CLIENT = "CLIENT",
  SUPPLIER = "SUPPLIER",
}

export const createProductPriceSchema = z.object({
  productId: uuidSchema,
  organizationId: uuidSchema.optional(),
  priceType: z.nativeEnum(PriceType)
    .refine((val) => val !== undefined, {
      message: "Выберите тип цены",
    }),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: "Цена должна быть числом в формате 123.45",
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Цена должна быть больше 0",
    }),
  currencyId: uuidSchema,
  customerType: z.nativeEnum(CustomerType).optional(),
});

export type CreateProductPriceDto = z.infer<typeof createProductPriceSchema>;

export const updateProductPriceSchema = createProductPriceSchema.partial();

export type UpdateProductPriceDto = z.infer<typeof updateProductPriceSchema>;

export const productPriceFilterSchema = z.object({
  productId: uuidSchema.optional(),
  priceType: z.nativeEnum(PriceType).optional(),
  customerType: z.nativeEnum(CustomerType).optional(),
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().default(10).optional(),
});

export type ProductPriceFilterDto = z.infer<typeof productPriceFilterSchema>;

export interface ProductPrice {
  id: string;
  productId: string;
  organizationId?: string;
  priceType: PriceType;
  amount: string; // decimal as string
  currencyId: string;
  customerType?: CustomerType;
  createdAt?: string;
  updatedAt?: string;

  // Relations (included in API responses)
  product?: Product;
  currency?: Currency;
  organization?: Organization;
}

export interface PaginatedProductPrices {
  data: ProductPrice[];
  total: number;
  page: number;
  limit: number;
}

// Хелпер для получения читаемого названия типа цены
export function getPriceTypeLabel(priceType: PriceType): string {
  const labels: Record<PriceType, string> = {
    [PriceType.CASH]: "Наличные",
    [PriceType.INSTALLMENT]: "Рассрочка",
    [PriceType.WHOLESALE]: "Оптовая",
    [PriceType.ONLINE]: "Онлайн",
    [PriceType.SPECIAL]: "Специальная",
  };
  return labels[priceType] || priceType;
}

// Хелпер для получения читаемого названия типа клиента
export function getCustomerTypeLabel(customerType?: CustomerType): string {
  if (!customerType) return "Все клиенты";

  const labels: Record<CustomerType, string> = {
    [CustomerType.CLIENT]: "Клиент",
    [CustomerType.SUPPLIER]: "Поставщик",
  };
  return labels[customerType];
}