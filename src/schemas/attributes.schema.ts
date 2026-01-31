// src/schemas/attributes.schema.ts
import { z } from 'zod';

// ─── Создание характеристики ─────────────────────────────────────────
export const CreateAttributeSchema = z.object({
  key: z
    .string()
    .min(1, 'Ключ обязателен')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Ключ может содержать только буквы, цифры, _ и -'),
  name: z
    .string()
    .min(2, 'Название должно быть минимум 2 символа')
    .max(100, 'Название слишком длинное'),
});

export type CreateAttributeDto = z.infer<typeof CreateAttributeSchema>;

// ─── Обновление характеристики ───────────────────────────────────────
export const UpdateAttributeSchema = z.object({
  key: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  name: z
    .string()
    .min(2)
    .max(100)
    .optional(),
}).refine(
  (data) => data.key !== undefined || data.name !== undefined,
  { message: 'Необходимо указать хотя бы одно поле для обновления' }
);

export type UpdateAttributeDto = z.infer<typeof UpdateAttributeSchema>;

// ─── Параметры запроса списка ────────────────────────────────────────
export const GetAttributesQuerySchema = z.object({
  search: z.string().optional().catch(''),
  sortField: z.string().optional().catch('name').optional(),
  order: z.enum(['asc', 'desc']).catch('asc').optional(),
  page: z.coerce.number().min(1).catch(1).optional(),
  limit: z.coerce.number().min(1).max(100).catch(20).optional(),
});

export type GetAttributesQueryDto = z.infer<typeof GetAttributesQuerySchema>;

// ─── Значение характеристики (AttributeValue) ────────────────────────
export const AttributeValueSchema = z.object({
  id: z.string().uuid(),
  attributeId: z.string().uuid(),
  value: z.string().min(1),
});

export type AttributeValue = z.infer<typeof AttributeValueSchema>;

// ─── Полная характеристика (с значениями) ────────────────────────────
export const AttributeSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  values: z.array(AttributeValueSchema).default([]),
});

export type Attribute = z.infer<typeof AttributeSchema>;

// ─── Ответ со списком характеристик ──────────────────────────────────
export const AttributesListResponseSchema = z.object({
  items: z.array(AttributeSchema),
  total: z.number(),
});