"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {FunnelPlus, Eraser, Check, X} from "lucide-react";
import { AttributesService } from "@/services/attributes.service";
import {DialogClose} from "@/components/ui/dialog";

interface ProductFilterDialogProps {
  onApply: (selectedAttributes: Record<string, string[]>) => void;
  onClear: () => void;
}

export const PosFilter = ({ onApply, onClear }: ProductFilterDialogProps) => {
  const [attributes, setAttributes] = useState<any[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const loadAttributes = async () => {
    try {
      setLoading(true);
      const data = await AttributesService.getAllAdmin({ limit: 100 });
      setAttributes(data.items);
    } catch (error) {
      console.error("Failed to load attributes", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleValue = (attrKey: string, valueId: string) => {
    setSelectedValues((prev) => {
      const currentAttrValues = prev[attrKey] || [];
      if (currentAttrValues.includes(valueId)) {
        return { ...prev, [attrKey]: currentAttrValues.filter((id) => id !== valueId) };
      } else {
        return { ...prev, [attrKey]: [...currentAttrValues, valueId] };
      }
    });
  };

  const handleClear = () => {
    setSelectedValues({});
    onClear();
  };

  const totalSelected = Object.values(selectedValues).flat().length;

  return (
    <Sheet onOpenChange={(open) => open && loadAttributes()}>

      <SheetTrigger asChild>
        <Button className="h-12 w-12 rounded-full ml-2 relative overflow-hidden group">
          <FunnelPlus className="size-5 transition-transform group-hover:scale-110" />
          {totalSelected > 0 && (
            <span className="absolute top-2 right-2 size-2 bg-primary-foreground rounded-full animate-pulse" />
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        showCloseButton={false}
        className="w-full sm:max-w-md bg-card/50 backdrop-blur-2xl border-l border-border/50 flex flex-col p-0 h-full">
        <SheetClose asChild>
          <Button className="absolute bg-primary top-4 right-4 h-10 w-10 rounded-full hover:bg-muted/30 transition">
            <X className="size-5 text-gray-500" />
          </Button>
        </SheetClose>
        <SheetHeader className="p-6 pb-2 flex-shrink-0">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-2xl font-bold tracking-tight">Filtrlar</SheetTitle>
            {totalSelected > 0 && (
              <Badge variant="secondary" className="rounded-full px-3 py-1 bg-primary/10 text-primary border-none">
                {totalSelected} ta
              </Badge>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-grow overflow-y-auto px-6">
          <div className="py-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 w-full bg-muted/50 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-4">
                {attributes.map((attr) => {
                  const selectedInThisAttr = selectedValues[attr.key]?.length || 0;

                  return (
                    <AccordionItem
                      key={attr.id}
                      value={attr.id}
                      className="border-none bg-secondary/30 rounded-2xl px-4 overflow-hidden"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm uppercase tracking-wider">
                            {attr.name}
                          </span>
                          {selectedInThisAttr > 0 && (
                            <Badge className="h-5 min-w-5 rounded-full px-1 justify-center bg-primary text-[10px]">
                              {selectedInThisAttr}
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="pb-4">
                        <div className="grid grid-cols-1 gap-2 pt-2">
                          {attr.values.length > 0 ? (
                            attr.values.map((val: any) => {
                              const isChecked = selectedValues[attr.key]?.includes(val.id);
                              return (
                                <div
                                  key={val.id}
                                  onClick={() => toggleValue(attr.key, val.id)}
                                  className={`
                                    group flex items-center justify-between p-3 rounded-xl cursor-pointer
                                    transition-all duration-200 border
                                    ${isChecked
                                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/10"
                                    : "bg-background/50 border-border/50 hover:border-primary/50"}
                                  `}
                                >
                                  <Label className="cursor-pointer font-medium text-sm p-0">{val.value}</Label>
                                  <div className={`
                                    size-5 rounded-full border flex items-center justify-center transition-all
                                    ${isChecked ? "bg-primary-foreground border-primary-foreground" : "border-muted-foreground/30 bg-background"}
                                  `}>
                                    {isChecked && <Check className="size-3 text-primary" strokeWidth={4} />}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-muted-foreground italic p-2">Qiymatlar mavjud emas</p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="p-6 bg-background/60 backdrop-blur-xl border-t border-border/50 flex-shrink-0">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-2xl border-border/50 hover:bg-destructive/10 hover:text-destructive group"
              onClick={handleClear}
            >
              <Eraser className="mr-2 size-4 transition-transform group-hover:-rotate-12" />
              Tozalash
            </Button>
            <SheetClose asChild>
              <Button
                className="flex-[2] h-12 rounded-2xl shadow-xl shadow-primary/20"
                onClick={() => onApply(selectedValues)}
              >
                Natijani ko'rsatish
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};