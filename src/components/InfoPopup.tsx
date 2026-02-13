"use client"

import React from "react"
import { HelpCircle, ExternalLink } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface InfoLink {
  label: string
  url: string
}

interface InfoPopupProps {
  title: string
  description: string
  links?: InfoLink[]
  className?: string
}

export function InfoPopup({ title, description, links, className }: InfoPopupProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-full w-5 h-5 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
            className
          )}
        >
          <HelpCircle size={16} strokeWidth={2.5} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 rounded-[1.5rem] p-5 shadow-xl border-none bg-card/95 backdrop-blur-md">
        <div className="space-y-3">
          <h4 className="font-black italic uppercase tracking-tighter text-sm">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            {description}
          </p>

          {links && links.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase italic text-primary hover:underline"
                >
                  {link.label}
                  <ExternalLink size={10} />
                </a>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}