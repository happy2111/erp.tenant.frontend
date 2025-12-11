"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrgUserRole } from "@/schemas/organization.user.schema";
import {DialogFooter} from "@/components/ui/dialog";

interface Props {
  onSubmit: (data: any) => void;
  defaultValues?: any;
}

export const OrganizationUserForm = ({ onSubmit, defaultValues }: Props) => {
  const { register, handleSubmit } = useForm({ defaultValues });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input placeholder="User ID" {...register("userId", { required: true })} />
      <Select {...register("role", { required: true })}>
        <SelectTrigger>
          <SelectValue placeholder="Select Role" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(OrgUserRole).map((role) => (
            <SelectItem key={role} value={role}>{role}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input placeholder="Position" {...register("position")} />
      <DialogFooter>
        <Button type="submit">Submit</Button>
      </DialogFooter>
    </form>
  );
};
