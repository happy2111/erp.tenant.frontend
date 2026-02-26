"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface Props {
  user: {
    email: string;
    isActive: boolean;
  };
  onChange: (payload: AccountPayload) => void;
}

export type AccountPayload = {
  email?: string;
  isActive?: boolean;
  password?: string;
};

export function UserAccountSection({ user, onChange }: Props) {
  const [email, setEmail] = useState(user.email);
  const [isActive, setIsActive] = useState(user.isActive);
  const [password, setPassword] = useState("");

  useEffect(() => {
    onChange({
      email: email !== user.email ? email : undefined,
      isActive: isActive !== user.isActive ? isActive : undefined,
      password: password || undefined,
    });
  }, [email, isActive, password]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm uppercase text-muted-foreground">
          Аккаунт
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex items-center justify-between border rounded-md p-3">
          <span className="text-sm font-medium">Активен</span>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <Input
          type="password"
          placeholder="Новый пароль (необязательно)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}
