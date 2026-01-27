import { CrudField } from "@/components/crud/types";
import { TenantUser } from "@/schemas/tenant-user.schema";

export const tenantUserFields: CrudField<TenantUser>[] = [
  {
    name: "profile.firstName",
    label: "Имя",
    type: "text",
    required: true,
    placeholder: "Мухаммад Юсуф",
  },
  {
    name: "profile.lastName",
    label: "Фамилия",
    type: "text",
    required: true,
    placeholder: "Абдурахимов",
  },
  {
    name: "profile.patronymic",
    label: "Отчество",
    type: "text",
    placeholder: "Юсуфович",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "user@example.com",
  },
  {
    name: "profile.gender",
    label: "Пол",
    type: "select",
    options: [
      { value: "MALE", label: "Мужской" },
      { value: "FEMALE", label: "Женский" },
      { value: "OTHER", label: "Другой" },
    ],
  },
  {
    name: "profile.dateOfBirth",
    label: "Дата рождения",
    type: "date",
  },
  {
    name: "phone_numbers",
    label: "Телефоны",
    type: "phone_array",
    required: true,
    render: (row: TenantUser) => {
      const phones = row.phone_numbers || [];
      if (phones.length === 0) return "—";
      return phones.map((p) => (
        <div key={p.id} className={`text-sm ${p.isPrimary && "font-bold text-green-600"}`}>
        {p.phone}
        </div>
      ));
      },
    },
  {
    name: "isActive",
    label: "Активен",
    type: "boolean",
    render: (row: TenantUser) => (
      <span className={row.isActive ? "text-green-600" : "text-red-600"}>
        {row.isActive ? "Да" : "Нет"}
        </span>
    ),
  },
  {
    name: "createdAt",
    label: "Создано",
    type: "date",
    hiddenInForm: true,
    hiddenInCard: true,
    render: (row: TenantUser) =>
      new Date(row.createdAt).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
  },
];