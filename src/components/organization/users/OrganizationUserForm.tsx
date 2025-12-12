"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import {
  CreateOrganizationUserWithUserSchema,
  OrgUserRole,
} from "@/schemas/organization.user.schema";
import { Label } from "@/components/ui/label";
import { z } from "zod";


type FormInput = z.input<typeof CreateOrganizationUserWithUserSchema>;

type FormValues = Omit<FormInput, 'organizationId'>;

interface Props {
  onSubmit: (data: FormValues) => void;
  defaultValues?: Partial<FormValues>;
  isLoading: boolean;
}

export const OrganizationUserForm = ({ onSubmit, defaultValues, isLoading }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control
  } = useForm<FormValues>({
    resolver: zodResolver(CreateOrganizationUserWithUserSchema.omit({ organizationId: true })),
    defaultValues: {
      role: defaultValues?.role || OrgUserRole.enum.SELLER,
      position: defaultValues?.position || '',
      user: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone_numbers: [{ phone: '', isPrimary: true, note: '' }],
        profile: { firstName: '', lastName: '' }
      }
    } as any
  });

  const roleFieldName = 'role';

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <h3 className="text-lg font-semibold border-b pb-2">Organization Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role">Role</Label>
          <Controller
            control={control}
            name={roleFieldName}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(OrgUserRole.enum).map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
        </div>
        <div>
          <Label htmlFor="position">Position (Optional)</Label>
          <Input
            id="position"
            placeholder="e.g., Chief Accountant"
            {...register("position")}
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2">New User Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="First Name"
            {...register("user.profile.firstName")}
          />
          {errors.user?.profile?.firstName && <p className="text-red-500 text-sm">{errors.user.profile.firstName.message}</p>}
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Last Name"
            {...register("user.profile.lastName")}
          />
          {errors.user?.profile?.lastName && <p className="text-red-500 text-sm">{errors.user.profile.lastName.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Email (optional)"
          {...register("user.email")}
        />
        {errors.user?.email && <p className="text-red-500 text-sm">{errors.user.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Password"
          {...register("user.password")}
        />
        {errors.user?.password && <p className="text-red-500 text-sm">{errors.user.password.message}</p>}
      </div>

      {/* 3. Primary Phone Number (Simplified for this example) */}
      <h3 className="text-lg font-semibold border-b pb-2">Contact</h3>
      <div>
        <Label htmlFor="phone">Primary Phone (+99890xxxxxxx)</Label>
        <Input
          id="phone"
          placeholder="+998901234567"
          // 🔑 FIX: Removed manual { required: true } since Zod handles it
          {...register("user.phone_numbers.0.phone")}
        />
        {/* We keep the hidden input, but ensure the Zod output type is correct.
           The phone_numbers array is validated to have at least one entry by Zod. */}
        <input type="hidden" {...register("user.phone_numbers.0.isPrimary", { value: true })} />
        {errors.user?.phone_numbers && <p className="text-red-500 text-sm">A primary phone number is required and must be valid.</p>}
      </div>

      <DialogFooter className="pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create User"}
        </Button>
      </DialogFooter>
    </form>
  );
};