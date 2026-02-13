import { z } from "zod";

export const createCurrencySchema = z.object({
  code: z
    .string()
    .min(2, { message: "Код валюты должен содержать минимум 2 символа" })
    .max(10, { message: "Код валюты не должен превышать 10 символов" })
    .regex(/^[A-Z]{3}$/, {
      message: "Код валюты должен состоять из 3 заглавных букв (например, USD, EUR)"
    }),
  name: z
    .string()
    .min(1, { message: "Название валюты обязательно" }),
  symbol: z
    .string()
    .min(1, { message: "Символ валюты обязателен" }),
});

export type CreateCurrencyDto = z.infer<typeof createCurrencySchema>;

export const updateCurrencySchema = createCurrencySchema.partial();

export type UpdateCurrencyDto = z.infer<typeof updateCurrencySchema>;

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CurrencyWithId = Currency & { id: string };

export const COMMON_CURRENCIES: Currency[] = [
  { id: "usd", code: "USD", name: "Доллар США", symbol: "$" },
  { id: "eur", code: "EUR", name: "Евро", symbol: "€" },
  { id: "rub", code: "RUB", name: "Российский рубль", symbol: "₽" },
  { id: "uzs", code: "UZS", name: "Узбекский сум", symbol: "so'm" },
  { id: "kzt", code: "KZT", name: "Казахстанский тенге", symbol: "₸" },
  { id: "cny", code: "CNY", name: "Китайский юань", symbol: "¥" },
];

export function formatCurrency(
  amount: number,
  currencyCode: string,
  locale: string = 'ru-RU'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencySymbol(code: string): string {
  const currency = COMMON_CURRENCIES.find(c => c.code === code);
  return currency?.symbol || code;
}