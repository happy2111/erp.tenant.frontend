"use client";

import React from "react";
import { Organization } from "@/schemas/organization.schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

type Props = {
  organizations: Organization[];
  loading: boolean;
  visibleColumns: { [k: string]: boolean };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function OrganizationTable({ organizations, loading, visibleColumns, onEdit, onDelete }: Props) {
  if (loading) {
    return (
      <div className="w-full py-20 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.name && <TableHead>Nomi</TableHead>}
            {visibleColumns.email && <TableHead>Email</TableHead>}
            {visibleColumns.phone && <TableHead>Telefon</TableHead>}
            {visibleColumns.address && <TableHead>Manzil</TableHead>}
            {visibleColumns.createdAt && <TableHead>Yaratilgan</TableHead>}
            {visibleColumns.actions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {organizations.map((org) => (
            <TableRow key={org.id}>
              {visibleColumns.name && <TableCell>{org.name}</TableCell>}
              {visibleColumns.email && <TableCell>{org.email ?? "-"}</TableCell>}
              {visibleColumns.phone && <TableCell>{org.phone ?? "-"}</TableCell>}
              {visibleColumns.address && <TableCell>{org.address ?? "-"}</TableCell>}
              {visibleColumns.createdAt && (
                <TableCell>{format(new Date(org.createdAt), "yyyy-MM-dd HH:mm")}</TableCell>
              )}
              {visibleColumns.actions && (
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(org.id)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(org.id)}>Delete</Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
