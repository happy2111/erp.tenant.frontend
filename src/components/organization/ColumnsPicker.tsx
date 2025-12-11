"use client";

import React, {Dispatch, SetStateAction} from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

type OrganizationColumns = {
  name: boolean;
  email: boolean;
  phone: boolean;
  address: boolean;
  createdAt: boolean;
  actions: boolean;
};

type Props = {
  visible: OrganizationColumns;
  setVisible: Dispatch<SetStateAction<OrganizationColumns>>;
};

type Visible = {
  [k: string]: boolean;
};



export function ColumnsPicker({ visible, setVisible }: Props) {
  const toggle = (key: keyof OrganizationColumns) =>
    setVisible(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">Ko‘rsatmalr</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Ko'rsatish ustunlari</h3>

          {Object.keys(visible as OrganizationColumns).map((key) => {
            const typedKey = key as keyof OrganizationColumns;
            return (
              <label key={key} className="flex items-center justify-between">
                <span className="capitalize text-sm">{key}</span>
                <Checkbox checked={visible[typedKey]} onCheckedChange={() => toggle(typedKey)} />
              </label>
            );
          })}

          <div className="flex gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() =>
                setVisible({
                  name: true,
                  email: true,
                  phone: true,
                  address: true,
                  createdAt: true,
                  actions: true,
                })
              }
            >
              Hammasi
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setVisible({
                  name: true,
                  email: false,
                  phone: false,
                  address: false,
                  createdAt: true,
                  actions: true,
                })
              }
            >
              Minimal
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
