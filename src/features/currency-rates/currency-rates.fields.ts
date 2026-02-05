import { CrudField } from "@/components/crud/types";
import { CurrencyRate } from "@/schemas/currency-rates.schema";

export const currencyRateFields: CrudField<CurrencyRate>[] = [
  {
    name: "baseCurrency",
    label: "Из валюты",
    required: true,
    placeholder: "USD, EUR, RUB...",
  },
  {
    name: "targetCurrency",
    label: "В валюту",
    required: true,
    placeholder: "UZS, KZT, RUB...",
  },
  {
    name: "rate",
    label: "Курс",
    required: true,
    render: (row) => row.rate?.toFixed(6) || "—",
  },
  {
    name: "date",
    label: "Дата курса",
    render: (row) =>
      row.date
        ? new Date(row.date).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        : "—",
  },
  {
    name: "createdAt",
    label: "Создано",
    hiddenInForm: true,
    hiddenInCard: true,
    render: (row) =>
      new Date(row.createdAt).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
];