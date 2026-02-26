"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Star } from "lucide-react";
import {Phone} from "@/schemas/tenant-user.schema";


type UserPhone =  Phone & {
  id: string;
}

interface Props {
  phones: UserPhone[];
  onChange: (state: PhonesState) => void;
}

export type PhonesState = {
  phonesToAdd: Omit<UserPhone, "id">[];
  phonesToUpdate: UserPhone[];
  phonesToDelete: string[];
};

export function UserPhonesSection({ phones, onChange }: Props) {
  const [current, setCurrent] = useState<UserPhone[]>(phones);
  const [phonesToAdd, setPhonesToAdd] = useState<Omit<UserPhone, "id">[]>([]);
  const [phonesToDelete, setPhonesToDelete] = useState<string[]>([]);

  const [newPhone, setNewPhone] = useState("");
  const [newNote, setNewNote] = useState("");

  /** синхронизация наверх */
  useEffect(() => {
    onChange({
      phonesToAdd,
      phonesToUpdate: current.filter((p) => !phonesToDelete.includes(p.id)),
      phonesToDelete,
    });
  }, [current, phonesToAdd, phonesToDelete, onChange]);

  const setPrimary = (id: string) => {
    setCurrent((prev) =>
      prev.map((p) => ({ ...p, isPrimary: p.id === id })),
    );
    setPhonesToAdd((prev) =>
      prev.map((p) => ({ ...p, isPrimary: false })),
    );
  };

  const removePhone = (id?: string) => {
    if (id) {
      setPhonesToDelete((prev) => [...prev, id]);
      setCurrent((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const addPhone = () => {
    if (!newPhone.trim()) return;

    const isFirst = current.length === 0 && phonesToAdd.length === 0;

    setPhonesToAdd((prev) => [
      ...prev,
      {
        phone: newPhone,
        note: newNote || undefined,
        isPrimary: isFirst,
      },
    ]);

    setNewPhone("");
    setNewNote("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm uppercase text-muted-foreground">
          Телефоны
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* существующие */}
        {current.map((p) => (
          <div
            key={p.id}
            className="flex gap-3 items-start border rounded-lg p-3"
          >
            <div className="flex-1">
              <div className="flex gap-2 items-center">
                <span className="font-medium">{p.phone}</span>
                {p.isPrimary && (
                  <Badge variant="secondary" className="text-[10px]">
                    Основной
                  </Badge>
                )}
              </div>

              <Input
                className="mt-2"
                defaultValue={p.note ?? ""}
                placeholder="Пометка"
                onBlur={(e) =>
                  setCurrent((prev) =>
                    prev.map((x) =>
                      x.id === p.id ? { ...x, note: e.target.value } : x,
                    ),
                  )
                }
              />
            </div>

            <div className="flex gap-2">
              {!p.isPrimary && (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setPrimary(p.id)}
                >
                  <Star className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="icon"
                variant="destructive"
                onClick={() => removePhone(p.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* новые */}
        {phonesToAdd.map((p, i) => (
          <div
            key={i}
            className="flex justify-between items-center p-3 border rounded-lg bg-accent/20"
          >
            <div className={"flex flex-col"}>
              <div className="font-medium">{p.phone}</div>
              <div className="text-xs text-muted-foreground">
                {p.note || "Без пометки"}
              </div>
            </div>
            {p.isPrimary && (
              <Badge variant="secondary" className="text-[10px]">
                Основной
              </Badge>
            )}
          </div>
        ))}

        {/* add */}
        <div className="border-t pt-4 space-y-2">
          <Input
            placeholder="+998 90 123 45 67"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
          <Input
            placeholder="Пометка"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <Button className="w-full" onClick={addPhone}>
            Добавить телефон
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
