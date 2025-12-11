'use client'; // Если вы еще не добавили, добавьте эту директиву

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from 'react';

// 💡 1. Импортируем наш Zustаnd Store
import { useTenantAuthStore } from "@/store/auth.store"; // Убедитесь, что путь верный

export function LoginForm({
                            className,
                            ...props
                          }: React.ComponentProps<"div">) {

  const login = useTenantAuthStore((state) => state.login);
  const loading = useTenantAuthStore((state) => state.loading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await login({ login: email, password });

    // if (success) {
    //   // router.push('/dashboard');
    // }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email or phone below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 💡 5. Привязываем обработчик к форме */}
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email yoki Telefon</FieldLabel>
                <Input
                  id="login"
                  type="text"
                  placeholder="m@example.com / +998934474009"
                  required
                  value={email} // Привязка значения
                  onChange={(e) => setEmail(e.target.value)} // Обработка ввода
                  disabled={loading} // Блокируем во время загрузки
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password} // Привязка значения
                  onChange={(e) => setPassword(e.target.value)} // Обработка ввода
                  disabled={loading} // Блокируем во время загрузки
                />
              </Field>
              <Field>
                {/* 💡 6. Кнопка с состоянием загрузки */}
                <Button type="submit" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}