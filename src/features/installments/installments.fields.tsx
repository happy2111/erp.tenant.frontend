import { CrudField } from "@/components/crud/types";
import { Installment } from "@/schemas/installments.schema";

export const installmentFields: CrudField<Installment>[] = [
  {
    name: "sale.invoiceNumber",
    label: "Продажа / Чек",
    render: (row) => row.sale?.invoiceNumber || "—",
  },
  {
    name: "customer",
    label: "Клиент",
    render: (row) =>
      row.customer
        ? `${row.customer.firstName || ""} ${row.customer.lastName || ""} ${
          row.customer.phone ? `(${row.customer.phone})` : ""
        }`
        : "—",
  },
  {
    name: "totalAmount",
    label: "Общая сумма",
    render: (row) =>
      row.totalAmount?.toLocaleString("ru-RU") +
      (row.sale?.currency?.symbol ? ` ${row.sale.currency.symbol}` : ""),
  },
  {
    name: "paidAmount",
    label: "Оплачено",
    render: (row) =>
      row.paidAmount?.toLocaleString("ru-RU") +
      (row.sale?.currency?.symbol ? ` ${row.sale.currency.symbol}` : ""),
  },
  {
    name: "remaining",
    label: "Остаток",
    render: (row) =>
      row.remaining?.toLocaleString("ru-RU") +
      (row.sale?.currency?.symbol ? ` ${row.sale.currency.symbol}` : ""),
  },
  {
    name: "totalMonths",
    label: "Месяцев",
    render: (row) => `${row.totalMonths} мес.`,
  },
  {
    name: "monthsLeft",
    label: "Осталось",
    render: (row) => `${row.monthsLeft} мес.`,
  },
  {
    name: "monthlyPayment",
    label: "Ежемесячный платёж",
    render: (row) =>
      row.monthlyPayment?.toLocaleString("ru-RU") +
      (row.sale?.currency?.symbol ? ` ${row.sale.currency.symbol}` : ""),
  },
  {
    name: "dueDate",
    label: "Следующий платёж",
    render: (row) =>
      row.dueDate
        ? new Date(row.dueDate).toLocaleDateString("ru-RU")
        : "—",
  },
  {
    name: "status",
    label: "Статус",
    render: (row) => {
      const statusMap: Record<string, { label: string; color: string }> = {
        PENDING: { label: "Ожидает", color: "text-orange-600" },
        COMPLETED: { label: "Завершена", color: "text-green-600" },
        OVERDUE: { label: "Просрочена", color: "text-red-600" },
        CANCELLED: { label: "Отменена", color: "text-gray-600" },
      };
      const s = statusMap[row.status] || { label: row.status, color: "" };
      return <span className={s.color}>{s.label}</span>;
    },
  },
  {
    name: "payments.length",
    label: "Платежей",
    render: (row) => row.payments?.length || 0,
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