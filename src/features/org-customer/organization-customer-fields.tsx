import { CrudField } from "@/components/crud/types";
import { OrganizationCustomer } from "@/schemas/org-customer.schema";
import { CustomerTypeValues } from "@/schemas/org-customer.schema";

export const organizationCustomerFields: CrudField<OrganizationCustomer>[] = [
  {
    name: "firstName",
    label: "Имя",
    required: true,
  },
  {
    name: "lastName",
    label: "Фамилия",
    required: true,
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
    placeholder: "+998901234567",
  },
  {
    name: "type",
    label: "Тип",
    type: "select",
    options: CustomerTypeValues.map((v) => ({ label: v === "CLIENT" ? "Клиент" : "Поставщик", value: v })),
    required: true,
  },
  {
    name: "isBlacklisted",
    label: "Чёрный список",
    type: "boolean",
    render: (row) => (row.isBlacklisted ? "Да" : "—"),
  },
  {
    name: "createdAt",
    label: "Создано",
    hiddenInForm: true,
    hiddenInCard: true,
    render: (row) => new Date(row.createdAt).toLocaleDateString("ru-RU"),
  },
];