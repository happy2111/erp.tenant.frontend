import { CrudField } from "@/components/crud/types";
import { ProductVariant } from "@/schemas/product-variants.schema";

export const productVariantFields: CrudField<ProductVariant>[] = [
  {
    name: "title",
    label: "Название варианта",
    required: true,
    placeholder: "Чёрный / 128 ГБ, Белый / 256 ГБ, 42 EU...",
  },
  {
    name: "images.length",
    label: "Фото",
    hiddenInForm: true,
    render: (row) => row.images?.length || 0,
  },
  {
    name: "sku",
    label: "SKU",
    placeholder: "IPH14P-128-BLK, NK-AM-42-WHT...",
  },
  {
    name: "barcode",
    label: "Штрихкод",
    placeholder: "4601234567890...",
  },
  {
    name: "defaultPrice",
    label: "Цена по умолчанию",
    type: "number",
    render: (row) =>
      row.defaultPrice !== null && row.defaultPrice !== undefined
        ? `${row.defaultPrice.toLocaleString("ru-RU")} ${
          row?.currency?.symbol || "UZS"
        }`
        : "—",
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