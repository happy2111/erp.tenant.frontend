import { CrudField } from "@/components/crud/types";
import { OrganizationWithUserRole } from "@/schemas/organization.schema";

export const organizationFields: CrudField<OrganizationWithUserRole>[] = [
  {
    name: "name",
    label: "Название",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "example@company.uz",
    required: false,
  },
  {
    name: "phone",
    label: "Телефон",
    placeholder: "+998901234567",
    type: "phone",
  },
  {
    name: "address",
    label: "Адрес",
    type: "textarea",
  },
  {
    name: "createdAt",
    label: "Создано",
    hiddenInCard: true,
    hiddenInForm: true,
    render: (row) => new Date(row.createdAt).toLocaleDateString("ru-RU"),
  },
  // // Можно добавить кастомный рендер для ролей
  // {
  //   name: "org_users",
  //   label: "Роль",
  //   hiddenInTable: false,
  //   render: (row) => row.org_users?.[0]?.role || "—",
  // },
];