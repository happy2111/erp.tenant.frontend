import { z } from 'zod';

// Предполагаемые значения из бэкенда
export const InstallmentStatusValues = ['PENDING', 'COMPLETED', 'OVERDUE', 'CANCELLED'] as const;
export type InstallmentStatus = typeof InstallmentStatusValues[number];

// ─── Создание рассрочки ──────────────────────────────────────────────
export const CreateInstallmentSchema = z.object({
  saleId: z.string().uuid('Некорректный ID продажи'),
  customerId: z.string().uuid('Некорректный ID клиента'),
  totalAmount: z.number().positive('Сумма рассрочки должна быть положительной'),
  initialPayment: z.number().nonnegative('Первоначальный взнос не может быть отрицательным'),
  totalMonths: z.number().int().positive('Количество месяцев должно быть целым и больше 0'),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export type CreateInstallmentDto = z.infer<typeof CreateInstallmentSchema>;

// ─── Добавление платежа по рассрочке ─────────────────────────────────
export const CreateInstallmentPaymentSchema = z.object({
  installmentId: z.string().uuid('Некорректный ID рассрочки'),
  amount: z
    .number({
      message: 'Сумма должна быть числом',
    })
    .positive('Сумма должна быть положительной')
    .refine(
      (val) => Number.isInteger(val * 100),
      'Допускается не более 2 знаков после запятой'
    ),

  paymentMethod: z.string().optional(),
  kassaId: z.string().uuid('Некорректный ID кассы'),
  note: z.string().optional(),
});

export type CreateInstallmentPaymentDto = z.infer<typeof CreateInstallmentPaymentSchema>;

// ─── Отмена рассрочки ────────────────────────────────────────────────
export const CancelInstallmentSchema = z.object({
  reason: z.string().optional(),
});

export type CancelInstallmentDto = z.infer<typeof CancelInstallmentSchema>;

// ─── Фильтры для списка рассрочек ────────────────────────────────────
export const GetInstallmentsQuerySchema = z.object({
  search: z.string().optional().catch(''),
  customerId: z.string().uuid().optional().catch(undefined),
  status: z.enum(InstallmentStatusValues).optional().catch(undefined),
  overdue: z.enum(['true', 'false']).optional().catch(undefined),
  sortField: z.string().optional().catch('dueDate'),
  order: z.enum(['asc', 'desc']).catch('desc').optional(),
  page: z.coerce.number().min(1).catch(1).optional(),
  limit: z.coerce.number().min(1).max(100).catch(20).optional(),
});

export type GetInstallmentsQueryDto = z.infer<typeof GetInstallmentsQuerySchema>;

// ─── Минимальная структура платежа по рассрочке ──────────────────────
export const InstallmentPaymentSchema = z.object({
  id: z.string().uuid(),
  installmentId: z.string().uuid(),
  amount: z.coerce.number(),
  paidAt: z.coerce.date(),
  paymentMethod: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  createdById: z.string().uuid().nullable().optional(),
}).passthrough();


export type InstallmentPayment = z.infer<typeof InstallmentPaymentSchema>;

// ─── Полная рассрочка (ответ сервера) ────────────────────────────────
export const InstallmentSchema = z.object({
  id: z.string().uuid(),
  saleId: z.string().uuid(),
  customerId: z.string().uuid(),
  totalAmount: z.number(),
  initialPayment: z.number(),
  paidAmount: z.number(),
  remaining: z.number(),
  totalMonths: z.number().int(),
  monthsLeft: z.number().int(),
  monthlyPayment: z.number(),
  dueDate: z.coerce.date(),
  status: z.enum(InstallmentStatusValues),
  notes: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  // расширенные связи (как возвращает бэкенд)
  sale: z.object({
    id: z.string().uuid(),
    invoiceNumber: z.string(),
    totalAmount: z.coerce.number(),
    paidAmount: z.coerce.number(),
    currency: z.any().optional().nullable(),
  }).optional().nullable(),
  customer: z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().nullable().optional(),
  }).optional().nullable(),
  payments: z.array(InstallmentPaymentSchema).default([]),
}).passthrough();

export type Installment = z.infer<typeof InstallmentSchema>;

// ─── Ответ со списком рассрочек ──────────────────────────────────────
export const InstallmentsListResponseSchema = z.object({
  items: z.array(InstallmentSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});