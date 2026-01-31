import { CrudField } from "@/components/crud/types";
import { Currency } from "@/schemas/currency.schema";

export const currencyFields: CrudField<Currency>[] = [
  {
    name: "code",
    label: "Код",
    required: true,
    placeholder: "USD, EUR, UZS...",
  },
  {
    name: "name",
    label: "Название",
    required: true,
    placeholder: "Доллар США, Евро, Узбекский сум...",
  },
  {
    name: "symbol",
    label: "Символ",
    required: true,
    placeholder: "$, €, so'm, ₽...",
  },
  {
    name: "createdAt",
    label: "Создано",
    hiddenInForm: true,
    hiddenInCard: true,
    render: (row) =>
      row.createdAt
        ? new Date(row.createdAt).toLocaleDateString("ru-RU")
        : "—",
  },
];