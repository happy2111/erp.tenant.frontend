'use client';

import { CrudField } from "@/components/crud/types";
import { OrganizationCustomer } from "@/schemas/org-customer.schema";

function RolesBadges({ row }: { row: OrganizationCustomer }) {
  const parts: string[] = [];
  if (row.isClient) parts.push("Клиент");
  if (row.isSupplier) parts.push("Поставщик");
  return parts.length ? parts.join(" · ") : "—";
}

export const organizationCustomerFields: CrudField<OrganizationCustomer>[] = [
  {
    name: "firstName",
    label: "Имя",
    required: true,
  },
  {
    name: "lastName",
    label: "Фамилия",
    placeholder: "Необязательно",
  },
  {
    name: "patronymic",
    label: "Отчество",
    placeholder: "Необязательно",
  },
  {
    name: "phone",
    label: "Телефон",
    type: "phone",
    placeholder: "+998901234567 (необязательно)",
  },
  {
    name: "isClient",
    label: "Клиент",
    type: "boolean",
    helperText: "Роль для продаж",
    hiddenInTable: true,
    hiddenInCard: true,
  },
  {
    name: "isSupplier",
    label: "Поставщик",
    type: "boolean",
    helperText: "Роль для закупок",
    hiddenInTable: true,
    hiddenInCard: true,
  },
  {
    name: "roles",
    label: "Роли",
    hiddenInForm: true,
    render: (row) => <RolesBadges row={row} />,
  },
  {
    name: "isBlacklisted",
    label: "Qora roʻyxat",
    type: "boolean",
    render: (row) => (row.isBlacklisted ? "Ha" : "—"),
  },
  {
    name: "createdAt",
    label: "Создано",
    hiddenInForm: true,
    hiddenInCard: true,
    render: (row) => new Date(row.createdAt).toLocaleDateString("ru-RU"),
  },
];
