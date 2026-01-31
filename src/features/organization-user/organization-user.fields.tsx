import { CrudField } from "@/components/crud/types";
import { OrganizationUser } from "@/schemas/organization-user.schema";

export const organizationUserFields: CrudField<OrganizationUser>[] = [
  {
    name: "user.profile.firstName",
    label: "Имя",
    type: "text",
    required: true,
    placeholder: "Введите имя",
    hiddenInForm: true,

  },
  {
    name: "user.profile.lastName",
    label: "Фамилия",
    type: "text",
    required: true,
    placeholder: "Введите фамилию",
    hiddenInForm: true,

  },
  {
    name: "user.profile.patronymic",
    label: "Отчество",
    type: "text",
    placeholder: "Введите отчество (если есть)",
    hiddenInForm: true,

  },
  {
    name: "user.email",
    label: "Email",
    type: "email",
    placeholder: "example@company.uz",
    hiddenInForm: true,

  },
  {
    name: "role",
    label: "Роль",
    type: "select",
    required: true,
    options: [
      { value: "OWNER", label: "Владелец" },
      { value: "ADMIN", label: "Администратор" },
      { value: "MANAGER", label: "Менеджер" },
      { value: "EMPLOYEE", label: "Сотрудник" },
      { value: "CASHIER", label: "Кассир" },
    ],
  },
  {
    name: "position",
    label: "Должность",
    type: "text",
    placeholder: "Например: Главный бухгалтер",
  },
  {
    name: "user.phone_numbers",
    label: "Телефоны",
    type: "phone_array", // предполагается, что у вас есть кастомный компонент для массива телефонов
    hiddenInForm: true, // обычно телефон редактируется через профиль пользователя
    render: (row: OrganizationUser) => {
      const phones = row.user?.phone_numbers || [];
      if (phones.length === 0) return "—";
      return phones.map((p) => (
        <div key={p.phone} className="text-sm">
        {p.phone} {p.isPrimary && <span className="text-green-600">(основной)</span>}
        </div>
      ));
      },
    },
  {
    name: "user.isActive",
    label: "Активен",
    type: "boolean",
    hiddenInForm: true,
    render: (row: OrganizationUser) => (
      <span className={row.user?.isActive ? "text-green-600" : "text-red-600"}>
        {row.user?.isActive ? "Да" : "Нет"}
        </span>
    ),
  },
  {
    name: "createdAt",
    label: "Создано",
    type: "date",
    hiddenInForm: true,
    hiddenInCard: true,
    render: (row: OrganizationUser) =>
      new Date(row.createdAt).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
  },
];