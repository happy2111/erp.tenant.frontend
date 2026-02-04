import { CrudField } from "@/components/crud/types";
import { Kassa } from "@/schemas/kassas.schema";

export const kassaFields: CrudField<Kassa>[] = [
  {
    name: "name",
    label: "Название кассы",
    required: true,
    placeholder: "Основная касса, Карточки, Банк, Онлайн-платежи...",
  },
  {
    name: "type",
    label: "Тип",
    render: (row) => {
      const typeMap: Record<string, string> = {
        наличные: "Наличные",
        банк: "Банковский счёт",
        электронная: "Электронный кошелёк",
        карточная: "Платёжные карты",
        другая: "Другая",
      };
      return typeMap[row.type] || row.type;
    },
  },
  {
    name: "currency.code",
    label: "Валюта",
    hiddenInForm: true,
    render: (row) => row.currency?.code || row.currencyId || "—",
  },
  {
    name: "balance",
    label: "Текущий баланс",
    hiddenInForm: true,
    render: (row) => {
      const symbol = row.currency?.symbol || "";
      return row.balance?.toLocaleString("ru-RU") + (symbol ? ` ${symbol}` : "");
    },
  },
  {
    name: "createdAt",
    label: "Создано",
    hiddenInForm: true,
    hiddenInCard: true,
    render: (row) =>
      new Date(row.createdAt).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
  },
];