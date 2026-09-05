"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { PhoneLinkService } from "@/services/phone-link.service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, Smartphone } from "lucide-react";

function formatCountdown(expiresAt: string | null): string {
  if (!expiresAt) {
    return "—";
  }

  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) {
    return "00:00";
  }

  const totalSec = Math.floor(diffMs / 1000);
  const min = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const sec = (totalSec % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

export function PhoneLinkPage() {
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("—");

  const createMutation = useMutation({
    mutationFn: PhoneLinkService.createPairing,
    onSuccess: (data) => {
      setExpiresAt(data.expiresAt);
      setQrUrl(data.qrUrl);
      setCode(data.code);
      toast.success("Yangi QR yaratildi");
    },
    onError: () => {
      toast.error("QR yaratishda xatolik");
    },
  });

  useEffect(() => {
    createMutation.mutate();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(formatCountdown(expiresAt));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const isExpired = useMemo(() => {
    if (!expiresAt) {
      return false;
    }
    return new Date(expiresAt).getTime() <= Date.now();
  }, [expiresAt, countdown]);

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tighter">Telefon ulash</h2>
        <p className="text-muted-foreground text-sm">
          Mobil ilovada Kirish → QR skaner orqali ulanish
        </p>
      </div>

      <div className="w-full max-w-[420px] rounded-[20px] border border-black/8 bg-white p-6 text-[#111] shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          <h3 className="text-lg font-bold tracking-tight">Telefon ulash</h3>
        </div>
        <p className="mb-5 text-[13px] leading-snug text-[#6b7280]">
          Kod 10 daqiqa · bir marta · apiKey yo&apos;q
        </p>

        <div className="flex items-start gap-5">
          <div className="flex h-[148px] w-[148px] shrink-0 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white p-2.5">
            {qrUrl ? (
              <QRCodeSVG value={qrUrl} size={128} level="M" includeMargin={false} />
            ) : (
              <div className="h-[128px] w-[128px] animate-pulse rounded bg-black/5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1.5 text-[15px] font-bold">ApplePark</div>
            {code ? (
              <div className="mb-3 font-mono text-xs tracking-widest text-[#6b7280]">{code}</div>
            ) : null}
            <div className="mb-3.5 text-xs text-[#6b7280]">
              Amal qiladi:{" "}
              <em className="font-semibold not-italic tabular-nums text-[#111]">
                {isExpired ? "Muddati tugagan" : countdown}
              </em>
            </div>
            <ol className="list-decimal space-y-1 pl-4 text-xs leading-relaxed text-[#374151]">
              <li>Ilovada Kirish bosing</li>
              <li>QR skanerlang</li>
              <li>Hisob bilan kiring</li>
            </ol>
          </div>
        </div>

        <Button
          type="button"
          className="mt-4 h-10 w-full rounded-[10px] bg-black text-sm font-semibold text-white hover:bg-black/90"
          disabled={createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${createMutation.isPending ? "animate-spin" : ""}`} />
          Yangi QR yaratish
        </Button>
      </div>
    </div>
  );
}
