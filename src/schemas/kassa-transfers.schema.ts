import { z } from 'zod';

// ─── Создание перевода между кассами ─────────────────────────────────
export const CreateKassaTransferSchema = z.object({
  fromKassaId: z.string().uuid('Некорректный ID кассы-источника'),
  toKassaId: z.string().uuid('Некорректный ID кассы-получателя'),
  amount: z
    .coerce
    .number({ message: 'Сумма должна быть числом' })
    .positive('Сумма должна быть положительной'),
  rate: z
    .coerce
    .number({ message: 'Курс должен быть числом' })
    .positive('Курс должен быть положительной')
    .default(1),
  description: z.string().max(500).optional().nullable(),
});

export type CreateKassaTransferDto = z.infer<typeof CreateKassaTransferSchema>;

export const GetKassaTransferQuerySchema = z.object({
  search: z.string().optional().catch(''),
  fromKassaId: z.string().uuid().optional().catch(undefined),
  toKassaId: z.string().uuid().optional().catch(undefined),
  sortField: z.string().optional().default('createdAt').optional(),
  order: z.enum(['asc', 'desc']).default('desc').optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
});

export type GetKassaTransferQueryDto = z.infer<typeof GetKassaTransferQuerySchema>;

export const MinimalKassaSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.string(),
});

export const MinimalCurrencySchema = z.object({
  code: z.string(),
});

export const KassaTransferSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  fromKassaId: z.string().uuid(),
  toKassaId: z.string().uuid(),
  fromCurrencyId: z.string().uuid(),
  toCurrencyId: z.string().uuid(),
  amount: z.number(),
  rate: z.number(),
  convertedAmount: z.number(),
  description: z.string().nullable().optional(),
  createdAt: z.coerce.date(),

  // связи (как возвращает бэкенд)
  from_kassa: MinimalKassaSchema.optional().nullable(),
  to_kassa: MinimalKassaSchema.optional().nullable(),
  from_currency: MinimalCurrencySchema.optional().nullable(),
  to_currency: MinimalCurrencySchema.optional().nullable(),
});

export type KassaTransfer = z.infer<typeof KassaTransferSchema>;

export const KassaTransfersListResponseSchema = z.object({
  items: z.array(KassaTransferSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});