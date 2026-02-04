import { CrudField } from "@/components/crud/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from "lucide-react";

export const kassaHistoryFields: CrudField<any>[] = [
  {
    name: "type",
    label: "Operatsiya",
    render: (row) => {
      if (row.type === "TRANSFER") {
        return (
          <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
          <ArrowRightLeft className="size-4" />
            </div>
            <span className="font-bold">O'tkazma</span>
        </div>
      );
      }
      return row.direction === "IN" ? (
        <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
        <ArrowDownLeft className="size-4" />
          </div>
          <span className="font-bold text-emerald-600">Kirim</span>
        </div>
    ) : (
        <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600">
        <ArrowUpRight className="size-4" />
          </div>
          <span className="font-bold text-rose-600">Chiqim</span>
        </div>
    );
    },
  },
  {
    name: "amount",
    label: "Summa",
    render: (row) => (
      <div className="font-mono font-black text-sm">
        {row.direction === "OUT" ? "-" : "+"}
  {row.amount.toLocaleString()} {row.currency?.symbol || row.currency?.code}
  </div>
),
},
{
  name: "description",
    label: "Izoh",
  render: (row) => (
  <div className="max-w-[250px] truncate opacity-70 italic text-xs">
    {row.description}
    </div>
),
},
{
  name: "createdAt",
    label: "Sana",
  render: (row) => (
  <div className="text-[10px] font-medium opacity-60 uppercase">
    {format(new Date(row.createdAt), "dd.MM.yyyy HH:mm")}
  </div>
),
},
];