"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, Table as TableIcon } from "lucide-react";
import { CrudViewMode } from "./types";

interface Props {
  value: CrudViewMode;
  onChange: (v: CrudViewMode) => void;
}

export function CrudViewToggle({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      <Button
        variant={value === "table" ? "default" : "outline"}
        size="icon"
        onClick={() => onChange("table")}
      >
        <TableIcon className="h-4 w-4" />
      </Button>

      <Button
        variant={value === "card" ? "default" : "outline"}
        size="icon"
        onClick={() => onChange("card")}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}
