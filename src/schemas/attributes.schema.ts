// src/schemas/attributes.schema.ts
import { z } from 'zod';

const keySchema = z
  .string()
  .min(1, 'Kalit majburiy')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Kalit faqat harflar, raqamlar, _ va - dan iborat bo‘lishi mumkin');

const nameSchema = z
  .string()
  .min(2, 'Nom kamida 2 belgidan iborat bo‘lishi kerak')
  .max(100, 'Nom juda uzun');

// ─── Создание характеристики ─────────────────────────────────────────
export const CreateAttributeSchema = z
  .object({
    key: keySchema,
    name: nameSchema,
    isRequired: z.boolean().default(false),
    isForVariant: z.boolean().default(true),
    isForInstance: z.boolean().default(false),
  })
  .refine((data) => data.isForVariant || data.isForInstance, {
    message: 'Qamrovni tanlang: variant va/yoki namuna',
    path: ['isForVariant'],
  });

export type CreateAttributeDto = z.infer<typeof CreateAttributeSchema>;

// ─── Обновление характеристики ───────────────────────────────────────
export const UpdateAttributeSchema = z
  .object({
    key: keySchema.optional(),
    name: nameSchema.optional(),
    isRequired: z.boolean().optional(),
    isForVariant: z.boolean().optional(),
    isForInstance: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.key !== undefined ||
      data.name !== undefined ||
      data.isRequired !== undefined ||
      data.isForVariant !== undefined ||
      data.isForInstance !== undefined,
    { message: 'Yangilash uchun kamida bitta maydonni ko‘rsating' },
  );

export type UpdateAttributeDto = z.infer<typeof UpdateAttributeSchema>;

// ─── Параметры запроса списка ────────────────────────────────────────
export const GetAttributesQuerySchema = z.object({
  search: z.string().optional().catch(''),
  isForVariant: z.boolean().optional(),
  isForInstance: z.boolean().optional(),
  sortField: z.string().optional().catch('name').optional(),
  order: z.enum(['asc', 'desc']).catch('asc').optional(),
  page: z.coerce.number().min(1).catch(1).optional(),
  limit: z.coerce.number().min(1).max(100).catch(20).optional(),
});

export type GetAttributesQueryDto = z.infer<typeof GetAttributesQuerySchema>;

/** Вкладка списка характеристик → searchParam `scope` */
export type AttributeScope = 'variant' | 'instance';

export const AttributeScopeSchema = z.enum(['variant', 'instance']);

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
  isRequired: z.boolean(),
  isForVariant: z.boolean().default(true),
  isForInstance: z.boolean().default(false),
  values: z.array(AttributeValueSchema).default([]),
});

export type Attribute = z.infer<typeof AttributeSchema>;

// ─── Ответ со списком характеристик ──────────────────────────────────
export const AttributesListResponseSchema = z.object({
  items: z.array(AttributeSchema),
  total: z.number(),
});
