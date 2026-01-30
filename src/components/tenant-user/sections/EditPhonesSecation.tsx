"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, Star, Trash2, Plus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { PatternFormat } from "react-number-format";

export function EditPhonesSection({ initialPhones = [], onChange }: any) {
  const [current, setCurrent] = useState<any[]>(initialPhones); // Существующие
  const [added, setAdded] = useState<any[]>([]); // Новые
  const [deletedIds, setDeletedIds] = useState<string[]>([]); // Удаленные

  const [newPhone, setNewPhone] = useState("");
  const [newNote, setNewNote] = useState("");

  // Синхронизация с родителем
  useEffect(() => {
    onChange({
      phonesToAdd: added.map(({ phone, isPrimary, note }) => ({ phone, isPrimary, note })),
      phonesToUpdate: current
        .filter(p => !deletedIds.includes(p.id))
        .map(({ id, phone, isPrimary, note }) => ({ id, phone, isPrimary, note })),
      phonesToDelete: deletedIds
    });
  }, [current, added, deletedIds, onChange]);

  const addPhone = () => {
    const cleanPhone = newPhone.replace(/[^\d+]/g, "");
    if (cleanPhone.length < 9) return;

    setAdded(prev => [...prev, {
      phone: cleanPhone,
      note: newNote,
      isPrimary: current.length === 0 && added.length === 0 // первый номер по умолчанию основной
    }]);
    setNewPhone("");
    setNewNote("");
  };

  const removeExisting = (id: string) => {
    setDeletedIds(prev => [...prev, id]);
  };

  const removeAdded = (idx: number) => {
    setAdded(prev => prev.filter((_, i) => i !== idx));
  };

  // Логика переключения основного номера (только один во всем списке)
  const setPrimary = (id: string, isNew: boolean) => {
    setCurrent(prev => prev.map(p => ({
      ...p,
      isPrimary: !isNew && p.id === id
    })));
    setAdded(prev => prev.map((p, i) => ({
      ...p,
      isPrimary: isNew && i.toString() === id
    })));
  };

  return (
    <Card className="border-sidebar-border/60 bg-card/50 backdrop-blur-sm rounded-[2rem] overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Phone className="size-4 text-primary" />
          Telefon raqamlari
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Список существующих номеров */}
        {current.filter(p => !deletedIds.includes(p.id)).map((p) => (
          <div key={p.id} className="group flex items-center justify-between p-3 border border-border/40 rounded-2xl bg-background/40 transition-all hover:bg-background/60">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono tracking-tight">{p.phone}</span>
                {p.isPrimary && <Badge className="h-4 text-[8px] px-1.5 bg-primary/20 text-primary border-none">Asosiy</Badge>}
              </div>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MessageSquare className="size-3 opacity-50" /> {p.note || "izohsiz"}
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className={cn("size-8 rounded-xl", p.isPrimary ? "text-primary bg-primary/10" : "opacity-40 hover:opacity-100")}
                onClick={() => setPrimary(p.id, false)}
              >
                <Star className={cn("size-4", p.isPrimary && "fill-current")} />
              </Button>
              <Button size="icon" variant="ghost" className="size-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeExisting(p.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Список новых (добавленных) номеров */}
        {added.map((p, i) => (
          <div key={i} className="flex items-center justify-between p-3 border border-dashed border-primary/30 rounded-2xl bg-primary/5">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-primary">{p.phone}</span>
                <Badge variant="outline" className="h-4 text-[8px] px-1.5 border-primary/30 text-primary">Yangi</Badge>
              </div>
              <span className="text-[10px] text-primary/60 italic">{p.note || "izohsiz"}</span>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className={cn("size-8 rounded-xl", p.isPrimary ? "text-primary bg-primary/10" : "text-primary/40")}
                onClick={() => setPrimary(i.toString(), true)}
              >
                <Star className={cn("size-4", p.isPrimary && "fill-current")} />
              </Button>
              <Button size="icon" variant="ghost" className="size-8 rounded-xl text-destructive hover:bg-destructive/10" onClick={() => removeAdded(i)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Форма добавления нового номера */}
        <div className="mt-4 p-3 rounded-2xl border border-sidebar-border/40 bg-sidebar-accent/20 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <PatternFormat
              format="+998 ## ### ## ##"
              customInput={Input}
              value={newPhone}
              onValueChange={(v) => setNewPhone(v.formattedValue)}
              className="bg-background/60 border-border/40 h-9 text-sm rounded-xl focus-visible:ring-primary"
              placeholder="Raqam"
            />
            <Input
              placeholder="Izoh (masalan: Ish)"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="bg-background/60 border-border/40 h-9 text-sm rounded-xl focus-visible:ring-primary"
            />
          </div>
          <Button
            disabled={newPhone.replace(/[^\d]/g, "").length < 12}
            className="w-full h-9 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-bold text-xs"
            onClick={addPhone}
          >
            <Plus className="mr-2 size-4" /> RAQAM QO'SHISH
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}