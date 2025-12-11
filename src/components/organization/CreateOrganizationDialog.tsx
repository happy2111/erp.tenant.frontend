"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { OrganizationForm } from "./OrganizationForm";
import { useOrganizationStore } from "@/store/organization.store";
import { toast } from "sonner";
import { CreateOrganizationDto } from "@/schemas/organization.schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateOrganizationDialog({ open, onOpenChange }: Props) {
  const createOrganization = useOrganizationStore(s => s.createOrganization);

  const handleSubmit = async (values: Partial<CreateOrganizationDto>) => {
    const res = await createOrganization(values as CreateOrganizationDto);
    if (res) {
      toast.success("Tashkilot yaratildi");
      onOpenChange(false);
    } else {
      toast.error("Xatolik yuz berdi");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yangi tashkilot</DialogTitle>
        </DialogHeader>

        <OrganizationForm onSubmit={handleSubmit} submitLabel="Yaratish" />

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
