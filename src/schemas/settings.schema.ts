import { z } from 'zod';

export const ThemeTypeValues = ['LIGHT', 'DARK', 'SYSTEM'] as const;
export type ThemeType = typeof ThemeTypeValues[number];
export const ThemeTypeLabels: Record<ThemeType, string> = {
  LIGHT: 'Yorug‘',
  DARK: 'Qorong‘u',
  SYSTEM: 'Tizim',
}

export const SettingsSchema = z.object({
  organizationId: z.string().uuid().optional().nullable(),
  language: z.string().optional(),
  dateFormat: z.string().optional(),
  enableNotifications: z.boolean().optional(),
  enableAutoRateUpdate: z.boolean().optional(),
  taxPercent: z.coerce.number().optional().default(0),
  baseCurrencyId: z.string().uuid().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  theme: z.enum(ThemeTypeValues).optional(),
  baseCurrency: z
    .object({
      id: z.string().uuid(),
      code: z.string(),
      name: z.string(),
      symbol: z.string(),
    })
    .nullable()
    .optional(),
});

export type Settings = z.infer<typeof SettingsSchema>;

export const UpdateSettingsSchema = z.object({
  baseCurrencyId: z.string().uuid().optional().nullable(),
  language: z.string().optional(),
  dateFormat: z.string().optional(),
  enableNotifications: z.boolean().optional(),
  enableAutoRateUpdate: z.boolean().optional(),
  taxPercent: z.number().optional(),
  logoUrl: z.string().url().optional().nullable(),
  theme: z.enum(ThemeTypeValues).optional(),
});

export type UpdateSettingsDto = z.infer<typeof UpdateSettingsSchema>;