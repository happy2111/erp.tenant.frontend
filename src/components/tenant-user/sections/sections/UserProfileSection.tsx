"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

type Profile = {
  firstName: string;
  lastName: string;
  patronymic?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string | null;
};

interface Props {
  profile: Profile;
  onChange: (payload: ProfilePayload) => void;
}

export type ProfilePayload = {
  profile?: {
    firstName?: string;
    lastName?: string;
    patronymic?: string | null;
    gender?: "MALE" | "FEMALE" | "OTHER";
    dateOfBirth?: string | null;
  };
};

export function UserProfileSection({ profile, onChange }: Props) {
  const [state, setState] = useState(profile);

  useEffect(() => {
    onChange({
      profile: {
        firstName: state.firstName,
        lastName: state.lastName,
        patronymic: state.patronymic,
        gender: state.gender,
        dateOfBirth: state.dateOfBirth,
      },
    });
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm uppercase text-muted-foreground">
          Личные данные
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          placeholder="Имя"
          value={state.firstName}
          onChange={(e) =>
            setState((s) => ({ ...s, firstName: e.target.value }))
          }
        />

        <Input
          placeholder="Фамилия"
          value={state.lastName}
          onChange={(e) =>
            setState((s) => ({ ...s, lastName: e.target.value }))
          }
        />

        <Input
          placeholder="Отчество"
          value={state.patronymic ?? ""}
          onChange={(e) =>
            setState((s) => ({ ...s, patronymic: e.target.value || null }))
          }
        />

        <Select
          value={state.gender}
          onValueChange={(v) =>
            setState((s) => ({ ...s, gender: v as any }))
          }
        >
          {/* Trigger — это сама кнопка, на которую нажимают */}
          <SelectTrigger>
            <SelectValue placeholder="Выберите пол" />
          </SelectTrigger>

          {/* Content — это выпадающий список, внутри которого ОБЯЗАТЕЛЬНО лежат Items */}
          <SelectContent>
            <SelectItem value="MALE">Мужской</SelectItem>
            <SelectItem value="FEMALE">Женский</SelectItem>
            <SelectItem value="OTHER">Другое</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={state.dateOfBirth ?? ""}
          onChange={(e) =>
            setState((s) => ({
              ...s,
              dateOfBirth: e.target.value || null,
            }))
          }
        />
      </CardContent>
    </Card>
  );
}
