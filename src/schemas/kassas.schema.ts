import { z } from 'zod';

// ─── Типы касс (соответствует enum KassaType на бэкенде) ─────────────
export const KassaTypeValues = [
  'наличные',
  'банк',
  'электронная',
  'карточная',
  'другая',
] as const;

export type KassaType = (typeof KassaTypeValues)[number];

// ─── Создание кассы ──────────────────────────────────────────────────
export const CreateKassaSchema = z.object({
  name: z
    .string()
    .min(1, 'Название кассы обязательно')
    .max(100, 'Название слишком длинное'),
  type: z.string(),
  currencyId: z.string().uuid('Некорректный ID валюты'),
});

export type CreateKassaDto = z.infer<typeof CreateKassaSchema>;

// ─── Обновление кассы ────────────────────────────────────────────────
export const UpdateKassaSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.string().optional(),
});

export type UpdateKassaDto = z.infer<typeof UpdateKassaSchema>;

// ─── Фильтр / запрос списка касс ─────────────────────────────────────
export const GetKassaQuerySchema = z.object({
  search: z.string().optional().catch(''),
  currencyId: z.string().uuid().optional().catch(undefined),
  sortField: z.string().optional().default('createdAt').optional(),
  order: z.enum(['asc', 'desc']).default('desc').optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
});

export type GetKassaQueryDto = z.infer<typeof GetKassaQuerySchema>;

// ─── Ответ — одна касса ──────────────────────────────────────────────
export const KassaSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.string(),
  currencyId: z.string().uuid(),
  balance: z.number(), // Decimal приходит как number
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  // валюта (если include)
  currency: z
    .object({
      id: z.string().uuid(),
      code: z.string(),
      name: z.string(),
      symbol: z.string(),
    })
    .optional()
    .nullable(),
});

export type Kassa = z.infer<typeof KassaSchema>;

// ─── Ответ со списком касс ───────────────────────────────────────────
export const KassasListResponseSchema = z.object({
  items: z.array(KassaSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});