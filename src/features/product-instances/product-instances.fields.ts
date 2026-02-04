import { CrudField } from "@/components/crud/types";
import { ProductInstance } from "@/schemas/product-instances.schema";

export const productInstanceFields: CrudField<ProductInstance>[] = [
  {
    name: "serialNumber",
    label: "Серийный номер",
    required: true,
  },
  {
    name: "currentStatus",
    label: "Статус",
    render: (row) => {
      const statusMap: Record<string, string> = {
        IN_STOCK: "В наличии",
        SOLD: "Продано",
        RETURNED: "Возвращён",
        LOST: "Утерян",
      };
      return statusMap[row.currentStatus] || row.currentStatus;
    },
  },
  {
    name: "productVariant.title",
    label: "Вариант товара",
    render: (row) => row.productVariant?.title || "—",
  },
  {
    name: "productVariant.product.name",
    label: "Товар",
    render: (row) => row.productVariant?.product?.name || "—",
  },
  {
    name: "current_owner",
    label: "Текущий владелец",
    render: (row) =>
      row.current_owner
        ? `${row.current_owner.firstName} ${row.current_owner.lastName} (${row.current_owner.phone})`
        : "—",
  },
  {
    name: "createdAt",
    label: "Создан",
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