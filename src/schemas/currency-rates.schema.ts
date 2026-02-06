import { z } from 'zod';

export const CreateCurrencyRateSchema = z.object({
  baseCurrency: z
    .string()
    .min(3, 'Код базовой валюты должен быть минимум 3 символа')
    .max(10, 'Код базовой валюты слишком длинный')
    .regex(/^[A-Z]{3,10}$/, 'Код должен состоять только из заглавных букв'),

  targetCurrency: z
    .string()
    .min(3, 'Код целевой валюты должен быть минимум 3 символа')
    .max(10, 'Код целевой валюты слишком длинный')
    .regex(/^[A-Z]{3,10}$/, 'Код должен состоять только из заглавных букв'),

  rate: z
    .string(),
  date: z
    .string()
    .transform((value) => {
      // value = "2026-02-05"
      return new Date(value).toISOString();
    })
});

export type CreateCurrencyRateDto = z.infer<typeof CreateCurrencyRateSchema>;

export const UpdateCurrencyRateSchema = CreateCurrencyRateSchema.partial();

export type UpdateCurrencyRateDto = z.infer<typeof UpdateCurrencyRateSchema>;

export const GetCurrencyRateQuerySchema = z.object({
  baseCurrency: z.string().optional().catch(''),
  targetCurrency: z.string().optional().catch(''),
  sortField: z.string().optional().default('date').optional(),
  order: z.enum(['asc', 'desc']).default('desc').optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
});

export type GetCurrencyRateQueryDto = z.infer<typeof GetCurrencyRateQuerySchema>;

export const CurrencyRateSchema = z.object({
  id: z.string().uuid(),
  baseCurrency: z.string(),
  targetCurrency: z.string(),
  rate: z.string().or(z.number()),
  date: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type CurrencyRate = z.infer<typeof CurrencyRateSchema>;

export const CurrencyRatesListResponseSchema = z.object({
  items: z.array(CurrencyRateSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});