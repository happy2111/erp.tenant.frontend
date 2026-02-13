import { z } from 'zod';

// ─── Один план рассрочки ─────────────────────────────────────────────
export const InstallmentPlanSchema = z.object({
  id: z.string().uuid(),
  months: z.number().int().positive(),
  coefficient: z.coerce.number().positive(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type InstallmentPlan = z.infer<typeof InstallmentPlanSchema>;


// ─── Лимит рассрочки по валюте ─────────────────────────────────────
export const InstallmentLimitSchema = z.object({
  id: z.string().uuid(),
  currencyId: z.string().uuid(),
  minInitialPayment: z.coerce.number().nullable().optional(),
  maxAmount: z.coerce.number().nullable().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  currency: z.object({
    symbol: z.string().optional().nullable(),
  }).optional().nullable(),
});

export type InstallmentLimit = z.infer<typeof InstallmentLimitSchema>;

// ─── Создание/обновление лимита рассрочки ─────────────────────────
export const UpsertInstallmentLimitSchema = z.object({
  currencyId: z.string().uuid(),
  minInitialPayment: z.number().nullable().optional().default(null),
  maxAmount: z.number().nullable().optional().default(null),
});

export type UpsertInstallmentLimitDto = z.infer<typeof UpsertInstallmentLimitSchema>;


// ─── Создание плана рассрочки ────────────────────────────────────────
export const CreateInstallmentPlanSchema = z.object({
  months: z
    .number()
    .int()
    .positive('Количество месяцев должно быть целым и больше 0'),
  coefficient: z
    .number()
    .positive('Коэффициент должен быть больше 0 (например 1.15)'),
});

export type CreateInstallmentPlanDto = z.infer<typeof CreateInstallmentPlanSchema>;

// ─── Обновление плана рассрочки ──────────────────────────────────────
export const UpdateInstallmentPlanSchema = z.object({
  months: z.number().int().positive().optional(),
  coefficient: z.number().positive().optional(),
});

export type UpdateInstallmentPlanDto = z.infer<typeof UpdateInstallmentPlanSchema>;

// ─── Глобальные настройки рассрочки организации ──────────────────────
export const InstallmentSettingSchema = z.object({
  isActive: z.boolean(),
  penaltyPercent: z.coerce.number().nullable().optional(),
  penaltyFixed: z.number().nullable().optional(),
  plans: z.array(InstallmentPlanSchema).default([]),
  installment_limits: z.array(InstallmentLimitSchema).default([]),
});

export type InstallmentSetting = z.infer<typeof InstallmentSettingSchema>;

// ─── Обновление глобальных настроек рассрочки ────────────────────────
export const UpdateInstallmentSettingSchema = z.object({
  isActive: z.boolean().optional(),
  penaltyPercent: z.number().nullable().optional(),
  penaltyFixed: z.number().nullable().optional(),
});

export type UpdateInstallmentSettingDto = z.infer<typeof UpdateInstallmentSettingSchema>;
