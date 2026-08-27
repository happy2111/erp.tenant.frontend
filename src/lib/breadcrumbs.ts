import { PRODUCT_LABELS } from "@/lib/product-labels";

export const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Boshqaruv paneli",

  organizations: "Tashkilotlar",
  customers: "Mijozlar",
  users: "Foydalanuvchilar",
  "convert-to-user": "Foydalanuvchiga aylantirish",

  products: "Mahsulotlar",
  "product-variants": PRODUCT_LABELS.variant.plural,
  "product-instances": PRODUCT_LABELS.instance.plural,

  categories: "Kategoriyalar",
  attributes: PRODUCT_LABELS.attributes.page,
  kassas: "Kassalar",
  "kassa-transfers": "Kassa o‘tkazmalari",

  pos: "POS",
  sales: "Sotuvlar",
  purchases: "Xaridlar",
  batches: "Partiyalar",
  settings: "Sozlamalar",

  create: "Yaratish",
  edit: "Tahrirlash",
}
