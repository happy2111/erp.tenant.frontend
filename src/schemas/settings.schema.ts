import { z } from 'zod';

export const ThemeTypeValues = ['LIGHT', 'DARK', 'SYSTEM'] as const;
export type ThemeType = typeof ThemeTypeValues[number];
export const ThemeTypeLabels: Record<ThemeType, string> = {
  LIGHT: 'Yorug‘',
  DARK: 'Qorong‘u',
  SYSTEM: 'Tizim',
}

// ─── Как выбирать партию при списании ────────────────────────────────
export const BatchSelectionModeValues = [
  'AUTO_FIFO',
  'AUTO_FEFO',
  'MANUAL_ALLOWED',
] as const;

export type BatchSelectionMode = (typeof BatchSelectionModeValues)[number];

export const BatchSelectionModeLabels: Record<BatchSelectionMode, string> = {
  AUTO_FIFO: 'FIFO — avval kelgani avval ketadi',
  AUTO_FEFO: 'FEFO — muddati avval tugaydigani ketadi',
  MANUAL_ALLOWED: 'Qo‘lda tanlash',
};

export const BatchSelectionModeHints: Record<BatchSelectionMode, string> = {
  AUTO_FIFO:
    'Tannarx eng eski partiyadan olinadi. Muddati yo‘q tovarlar uchun standart.',
  AUTO_FEFO:
    'Yaroqlilik muddati avval tugaydigan partiya birinchi yechiladi. Oziq-ovqat va dorilar uchun.',
  MANUAL_ALLOWED:
    'Sotuvchi partiyani o‘zi tanlaydi. Nazorat ko‘p, xato ehtimoli ham ko‘p.',
};

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
  batchSelectionMode: z.enum(BatchSelectionModeValues).optional(),
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
  batchSelectionMode: z.enum(BatchSelectionModeValues).optional(),
});

export type UpdateSettingsDto = z.infer<typeof UpdateSettingsSchema>;