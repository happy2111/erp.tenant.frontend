import { CrudField } from "@/components/crud/types";
import { Sale } from "@/schemas/sales.schema";

export const saleFields: CrudField<Sale>[] = [
  {
    name: "invoiceNumber",
    hiddenInForm: true,
    label: "Номер счёта / Чек",
    render: (row) => row.invoiceNumber || "—",
  },
  {
    name: "customer",
    label: "Клиент",
    render: (row) =>
      row.customer
        ? `${row.customer.firstName || ""} ${row.customer.lastName || ""} ${
          row.customer.phone ? `(${row.customer.phone})` : ""
        }`
        : "Без клиента / Розница",
  },
  {
    name: "totalAmount",
    label: "Сумма",
    render: (row) =>
      row.totalAmount?.toLocaleString("ru-RU") +
      (row.currency?.symbol ? ` ${row.currency.symbol}` : ""),
  },
  {
    name: "paidAmount",
    label: "Оплачено",
    render: (row) =>
      row.paidAmount?.toLocaleString("ru-RU") +
      (row.currency?.symbol ? ` ${row.currency.symbol}` : ""),
  },
  {
    name: "status",
    label: "Статус",
    type: "select",
    options: [
      { label: "Черновик", value: "DRAFT" },
      { label: "Ожидает оплаты", value: "PENDING" },
      { label: "Оплачено", value: "PAID" },
      { label: "Отменено", value: "CANCELLED" },
    ],
    render: (row) => {
      const statusMap: Record<string, { label: string; color: string }> = {
        DRAFT: { label: "Черновик", color: "text-yellow-600" },
        PENDING: { label: "Ожидает оплаты", color: "text-orange-600" },
        PAID: { label: "Оплачено", color: "text-green-600" },
        CANCELLED: { label: "Отменено", color: "text-red-600" },
      };
      const s = statusMap[row.status] || { label: row.status, color: "" };
      return <span className={s.color}>{s.label}</span>;
    },
  },
  {
    name: "kassa.name",
    label: "Касса",
    render: (row) => row.kassa?.name || "—",
  },
  {
    name: "responsible.email",
    label: "Ответственный",
    render: (row) => row.responsible?.email || "—",
  },
  {
    name: "items.length",
    label: "Позиций",
    render: (row) => row.items?.length || 0,
  },
  {
    name: "createdAt",
    label: "Создано",
    hiddenInForm: true,
    hiddenInCard: true,
    render: (row) => {
      if (!row.createdAt) return "—";

      return new Date(row.createdAt).toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
  },
];