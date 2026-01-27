"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
export function CreateProfileSection({ onChange }: { onChange: (v: any) => void }) {
  const [state, setState] = useState({
    // Основное
    firstName: "",
    lastName: "",
    patronymic: "",
    gender: undefined as string | undefined,
    dateOfBirth: "",

    // Паспортные данные
    passportSeries: "",
    passportNumber: "",
    issuedBy: "",
    issuedDate: "",
    expiryDate: "",

    // Адрес и локация
    country: "O'zbekiston",
    region: "",
    city: "",
    district: "",
    address: "",
    registration: "",
  });

  useEffect(() => {
    // Преобразуем даты в ISO формат для бэкенда при отправке
    const formatToISO = (dateStr: string) => dateStr ? new Date(dateStr).toISOString() : undefined;

    onChange({
      ...state,
      dateOfBirth: formatToISO(state.dateOfBirth),
      issuedDate: formatToISO(state.issuedDate),
      expiryDate: formatToISO(state.expiryDate),
      // Убираем пустые строки, заменяя их на undefined для опциональных полей
      patronymic: state.patronymic || undefined,
      passportSeries: state.passportSeries || undefined,
      passportNumber: state.passportNumber || undefined,
      // ... и так далее для остальных опциональных полей
    });
  }, [state]);

  const labelStyle = "text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60 ml-1 mb-1.5 block";

  return (
    <div className="space-y-6">
      <Card className="bg-card/30 backdrop-blur-xl border-border/60 shadow-xl rounded-[2rem] overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm uppercase tracking-widest font-black opacity-70">
            Shaxsiy ma&apos;lumotlar (Профиль)
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 pt-4">
          {/* Группа 1: ФИО */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelStyle}>Ism *</label>
              <Input
                placeholder="Muhammad"
                value={state.firstName}
                onChange={(e) => setState(s => ({ ...s, firstName: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelStyle}>Familiya *</label>
              <Input
                placeholder="Abduraximov"
                value={state.lastName}
                onChange={(e) => setState(s => ({ ...s, lastName: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelStyle}>Otasining ismi</label>
              <Input
                placeholder="Yusufovich"
                value={state.patronymic}
                onChange={(e) => setState(s => ({ ...s, patronymic: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Jinsi</label>
              <Select value={state.gender} onValueChange={(v) => setState(s => ({ ...s, gender: v }))}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Erkak (Male)</SelectItem>
                  <SelectItem value="FEMALE">Ayol (Female)</SelectItem>
                  <SelectItem value="OTHER">Boshqa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={labelStyle}>Tug&apos;ilgan sana</label>
              <Input
                type="date"
                value={state.dateOfBirth}
                onChange={(e) => setState(s => ({ ...s, dateOfBirth: e.target.value }))}
              />
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* Группа 2: Паспорт */}
          <div>
            <h3 className={labelStyle + " text-primary mb-4"}>Pasport ma&apos;lumotlari</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className={labelStyle}>Seriya</label>
                <Input
                  placeholder="AA"
                  maxLength={2}
                  className="uppercase"
                  value={state.passportSeries}
                  onChange={(e) => setState(s => ({ ...s, passportSeries: e.target.value.toUpperCase() }))}
                />
              </div>
              <div className="md:col-span-1">
                <label className={labelStyle}>Raqam</label>
                <Input
                  placeholder="1234567"
                  value={state.passportNumber}
                  onChange={(e) => setState(s => ({ ...s, passportNumber: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelStyle}>Kim tomonidan berilgan</label>
                <Input
                  placeholder="IIB tomonidan..."
                  value={state.issuedBy}
                  onChange={(e) => setState(s => ({ ...s, issuedBy: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className={labelStyle}>Berilgan sana</label>
                <Input
                  type="date"
                  value={state.issuedDate}
                  onChange={(e) => setState(s => ({ ...s, issuedDate: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelStyle}>Amal qilish muddati</label>
                <Input
                  type="date"
                  value={state.expiryDate}
                  onChange={(e) => setState(s => ({ ...s, expiryDate: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* Группа 3: Адрес */}
          <div>
            <h3 className={labelStyle + " text-primary mb-4"}>Manzil va hudud</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelStyle}>Mamlakat</label>
                <Input
                  value={state.country}
                  onChange={(e) => setState(s => ({ ...s, country: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelStyle}>Viloyat / Hudud</label>
                <Input
                  placeholder="Toshkent sh."
                  value={state.region}
                  onChange={(e) => setState(s => ({ ...s, region: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelStyle}>Shahar / Tuman</label>
                <Input
                  placeholder="Mirzo Ulug'bek t."
                  value={state.city}
                  onChange={(e) => setState(s => ({ ...s, city: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <label className={labelStyle}>Doimiy yashash manzili</label>
                <Input
                  placeholder="Ko'cha, uy, xonadon..."
                  value={state.address}
                  onChange={(e) => setState(s => ({ ...s, address: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelStyle}>Ro&apos;yxatdan o&apos;tgan manzili (Propiska)</label>
                <Input
                  placeholder="Pasport bo'yicha manzil..."
                  value={state.registration}
                  onChange={(e) => setState(s => ({ ...s, registration: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}