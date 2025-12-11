"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OrganizationUserForm } from "./OrganizationUserForm";
import { useState } from "react";
import { useOrganizationUserStore } from "@/store/organization.user.store";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateOrganizationUserDialog = ({ open, onOpenChange }: Props) => {
  const createUser = useOrganizationUserStore((state) => state.createUser);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>
        <OrganizationUserForm onSubmit={async (data) => {
          await createUser(data);
          onOpenChange(false);
        }} />
      </DialogContent>
    </Dialog>
  );
};
