"use client";

import React from "react";
import { GetOrganizationsQueryDto } from "@/schemas/organization.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  filters: GetOrganizationsQueryDto;
  setFilters: (updater: GetOrganizationsQueryDto | ((prev: GetOrganizationsQueryDto) => GetOrganizationsQueryDto)) => void;
};

export function OrganizationsFilters({ filters, setFilters }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div>
        <label className="block text-sm mb-1">Qidiruv</label>
        <Input
          value={filters.search ?? ""}
          onChange={(e) => setFilters({ ...filters, search: e.target.value || null })}
          placeholder="Nomi, email yoki telefon bo'yicha qidirish..."
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Saralash maydoni</label>
        <Select
          value={filters.sortField ?? "createdAt"}
          onValueChange={(value: any) => setFilters({ ...filters, sortField: value as any })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Saralash maydoni" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Yaratilgan vaqti</SelectItem>
            <SelectItem value="name">Nomi</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Telefon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm mb-1">Tartib</label>
        <Select
          value={filters.order ?? "desc"}
          onValueChange={(value: any) => setFilters({ ...filters, order: value as any })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tartib" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">O‘sish</SelectItem>
            <SelectItem value="desc">Kamayish</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => setFilters({ search: null, order: "desc", sortField: "createdAt" })}
        >
          Tozalash
        </Button>
        <Button onClick={() => { /* триггер — fetch вызывается из эффекта в page */ }}>
          Qo'llash
        </Button>
      </div>
    </div>
  );
}
