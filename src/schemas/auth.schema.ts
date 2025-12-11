import { z } from "zod";

export const tenantLoginSchema = z.object({
  login: z
    .string()
    .min(1, { message: "Email или телефон обязателен" }), // аналог IsString
  password: z
    .string()
    .min(8, { message: "Пароль должен быть минимум 8 символов" })
    .max(255, { message: "Пароль слишком длинный" }),
});

export type TenantLoginDto = z.infer<typeof tenantLoginSchema>;
