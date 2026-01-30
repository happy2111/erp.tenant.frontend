"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, Star, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { PatternFormat } from "react-number-format";

export function EditPhonesSection({ initialPhones = [], onChange }: any) {
  const [current, setCurrent] = useState<any[]>(initialPhones); // существующие в БД
  const [added, setAdded] = useState<any[]>([]); // новые
  const [deletedIds, setDeletedIds] = useState<string[]>([]); // ID на удаление

  const [newPhone, setNewPhone] = useState("");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    onChange({
      phonesToAdd: added.map(({ phone, isPrimary, note }) => ({ phone, isPrimary, note })),
      phonesToUpdate: current
        .filter(p => !deletedIds.includes(p.id))
        .map(({ id, phone, isPrimary, note }) => ({ id, phone, isPrimary, note })),
      phonesToDelete: deletedIds
    });
  }, [current, added, deletedIds]);

  const addPhone = () => {
    const cleanPhone = newPhone.replace(/[^\d+]/g, "");
    if (cleanPhone.length < 9) return;

    setAdded(prev => [...prev, { phone: cleanPhone, note: newNote, isPrimary: false }]);
    setNewPhone("");
    setNewNote("");
  };

  const removeExisting = (id: string) => {
    setDeletedIds(prev => [...prev, id]);
  };

  const removeAdded = (idx: number) => {
    setAdded(prev => prev.filter((_, i) => i !== idx));
  };

  const togglePrimary = (id: string, isNew: boolean) => {
    setCurrent(prev => prev.map(p => ({ ...p, isPrimary: !isNew && p.id === id })));
    setAdded(prev => prev.map((p, i) => ({ ...p, isPrimary: isNew && i.toString() === id })));
  };

  return (
    <Card className="border-border/60 bg-card/50 backdrop-blur-md rounded-[2rem]">
      <CardHeader>
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Phone className="size-4 text-primary" /> Telefonlar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Существующие */}
        {current.filter(p => !deletedIds.includes(p.id)).map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3 border rounded-2xl bg-background/50">
            <div className="flex flex-col">
              <span className="text-sm font-bold font-mono">{p.phone}</span>
              <span className="text-[10px] opacity-60">{p.note || "izohsiz"}</span>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="size-8" onClick={() => togglePrimary(p.id, false)}>
                <Star className={cn("size-4", p.isPrimary && "fill-primary text-primary")} />
              </Button>
              <Button size="icon" variant="ghost" className="size-8 hover:text-destructive" onClick={() => removeExisting(p.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Новые (еще не в БД) */}
        {added.map((p, i) => (
          <div key={i} className="flex items-center justify-between p-3 border border-dashed border-primary/30 rounded-2xl bg-primary/5">
            <div className="flex flex-col">
              <span className="text-sm font-bold font-mono">{p.phone}</span>
              <Badge className="w-fit text-[8px] h-4">Yangi</Badge>
            </div>
            <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => removeAdded(i)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}

        <div className="pt-2 border-t space-y-2">
          <PatternFormat
            format="+998 ## ### ## ##"
            customInput={Input}
            value={newPhone}
            onValueChange={(v) => setNewPhone(v.formattedValue)}
            className="bg-background/50 h-10 text-sm"
            placeholder="Yangi raqam"
          />
          <Button className="w-full h-9 bg-primary/10 text-primary hover:bg-primary hover:text-white" onClick={addPhone}>
            <Plus className="mr-2 size-4" /> Qo'shish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}