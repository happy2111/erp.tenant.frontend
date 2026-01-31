// src/schemas/attribute-values.schema.ts
import { z } from 'zod';
import { AttributeSchema } from './attributes.schema'; // предполагаем, что схема атрибута уже есть

// ─── Создание значения характеристики ────────────────────────────────
export const CreateAttributeValueSchema = z.object({
  attributeId: z.string().uuid('Некорректный ID атрибута'),
  value: z
    .string()
    .min(1, 'Значение не может быть пустым')
    .max(100, 'Значение слишком длинное (максимум 100 символов)'),
});

export type CreateAttributeValueDto = z.infer<typeof CreateAttributeValueSchema>;

// ─── Обновление значения характеристики ──────────────────────────────
export const UpdateAttributeValueSchema = z.object({
  attributeId: z.string().uuid().optional(),
  value: z
    .string()
    .min(1)
    .max(100)
    .optional(),
}).refine(
  (data) => data.attributeId !== undefined || data.value !== undefined,
  { message: 'Необходимо указать хотя бы одно поле для обновления' }
);

export type UpdateAttributeValueDto = z.infer<typeof UpdateAttributeValueSchema>;

// ─── Параметры запроса списка значений ───────────────────────────────
export const GetAttributeValuesQuerySchema = z.object({
  search: z.string().optional().catch(''),
  attributeId: z.string().uuid().optional().catch(undefined),
  sortField: z.string().optional().catch('value').optional(),
  order: z.enum(['asc', 'desc']).catch('asc').optional(),
  page: z.coerce.number().min(1).catch(1).optional(),
  limit: z.coerce.number().min(1).max(100).catch(20).optional(),
});

export type GetAttributeValuesQueryDto = z.infer<typeof GetAttributeValuesQuerySchema>;

// ─── Значение характеристики (ответ) ─────────────────────────────────
export const AttributeValueSchema = z.object({
  id: z.string().uuid(),
  attributeId: z.string().uuid(),
  value: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  // включаем связанный атрибут (как в сервисе бэкенда)
  attribute: AttributeSchema.pick({
    id: true,
    key: true,
    name: true,
  }).optional()
    .nullable(),
});

export type AttributeValue = z.infer<typeof AttributeValueSchema>;

// ─── Ответ со списком значений ───────────────────────────────────────
export const AttributeValuesListResponseSchema = z.object({
  items: z.array(AttributeValueSchema),
  total: z.number(),
});