"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Copy,
  KeyRound,
  BookOpen,
  Plus,
  Ban,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { IntegrationTokensService } from "@/services/integration-tokens.service";
import {
  CreateIntegrationTokenDto,
  CreateIntegrationTokenSchema,
  CreatedIntegrationToken,
  INTEGRATION_SCOPES,
} from "@/schemas/integration-tokens.schema";
import { cn } from "@/lib/utils";

const QUERY_KEY = ["integration-tokens"] as const;

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("uz-UZ", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

async function copyText(text: string, successMsg: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMsg);
  } catch {
    toast.error("Nusxa olishda xatolik");
  }
}

export function IntegrationTokensPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [createdToken, setCreatedToken] =
    useState<CreatedIntegrationToken | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ?? "https://api.erp.applepark.uz"
  ).replace(/\/$/, "");

  const { data: tokens = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => IntegrationTokensService.list(),
  });

  const form = useForm<CreateIntegrationTokenDto>({
    resolver: zodResolver(CreateIntegrationTokenSchema),
    defaultValues: { name: "", expiresAt: "" },
  });

  const createMutation = useMutation({
    mutationFn: IntegrationTokensService.create,
    onSuccess: (data) => {
      setCreatedToken(data);
      setCreateOpen(false);
      form.reset({ name: "", expiresAt: "" });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Token yaratildi — bir marta ko‘rsatiladi");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => IntegrationTokensService.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Token bekor qilindi");
      setRevokeId(null);
    },
  });

  const exampleCurl = useMemo(
    () =>
      `curl -s "${apiBase}/integration/v1/installment-settings" \\
  -H "Authorization: Bearer erp_int_YOUR_TOKEN"`,
    [apiBase],
  );

  const exampleResponse = `{
  "success": true,
  "data": {
    "isActive": true,
    "plans": [
      { "id": "…", "months": 3, "coefficient": "1.150" },
      { "id": "…", "months": 6, "coefficient": "1.250" }
    ],
    "limits": [
      {
        "currencyId": "…",
        "currency": { "symbol": "so'm" },
        "minInitialPayment": "100000",
        "maxAmount": "50000000"
      }
    ]
  }
}`;

  const handleCopy = async (text: string, key: string, msg: string) => {
    await copyText(text, msg);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1500);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse p-10 font-black uppercase">
        Ma’lumotlar yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/40 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3">
            <KeyRound className="size-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
              Integration API
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase opacity-40">
              Backend-to-backend token · Rassrochka jadvallari
            </p>
          </div>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="h-12 rounded-2xl px-6 font-black uppercase text-[10px] tracking-widest"
        >
          <Plus className="size-4" />
          Token yaratish
        </Button>
      </div>

      {createdToken ? (
        <Card className="rounded-3xl border-emerald-500/30 bg-emerald-500/5 shadow-sm">
          <CardContent className="space-y-4 pt-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                Yangi token (faqat hozir ko‘rinadi)
              </p>
              <p className="mt-1 text-sm opacity-70">
                Saqlang — keyin qayta ko‘rsatilmaydi. Token ichida tenant va
                organization allaqachon bog‘langan.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="flex-1 break-all rounded-2xl bg-background/80 px-4 py-3 font-mono text-xs">
                {createdToken.token}
              </code>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-2xl font-bold"
                onClick={() =>
                  handleCopy(createdToken.token, "token", "Token nusxalandi")
                }
              >
                {copiedKey === "token" ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                Nusxa
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl text-xs font-bold uppercase"
              onClick={() => setCreatedToken(null)}
            >
              Yashirish
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest opacity-50">
          Tokenlar
        </h3>
        {tokens.length === 0 ? (
          <Card className="rounded-3xl border-dashed shadow-none">
            <CardContent className="py-10 text-center text-sm opacity-60">
              Hali token yo‘q. Tashqi backend uchun token yarating.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <Card
                key={token.id}
                className={cn(
                  "rounded-3xl border-border/40 shadow-sm",
                  !token.isActive && "opacity-50",
                )}
              >
                <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black tracking-tight">
                        {token.name}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-black uppercase",
                          token.isActive
                            ? "bg-emerald-500/15 text-emerald-700"
                            : "bg-destructive/15 text-destructive",
                        )}
                      >
                        {token.isActive ? "Faol" : "Bekor qilingan"}
                      </span>
                    </div>
                    <p className="font-mono text-xs opacity-50">
                      {token.tokenPrefix}…
                    </p>
                    <p className="text-[11px] opacity-50">
                      Scope: {token.scopes.join(", ") || "—"} · Yaratilgan:{" "}
                      {formatDate(token.createdAt)} · Oxirgi ishlatilish:{" "}
                      {formatDate(token.lastUsedAt)}
                      {token.expiresAt
                        ? ` · Muddati: ${formatDate(token.expiresAt)}`
                        : ""}
                    </p>
                  </div>
                  {token.isActive ? (
                    <Button
                      type="button"
                      variant="destructive"
                      className="h-11 rounded-2xl font-black uppercase text-[10px]"
                      onClick={() => setRevokeId(token.id)}
                    >
                      <Ban className="size-4" />
                      Bekor qilish
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 opacity-50" />
          <h3 className="text-sm font-black uppercase tracking-widest opacity-50">
            API hujjat
          </h3>
        </div>

        <Card className="rounded-3xl border-border/40 shadow-sm">
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2 text-sm leading-relaxed opacity-80">
              <p>
                Tashqi backend faqat <strong>integration token</strong> bilan
                chaqiradi. <code>x-tenant-key</code>, JWT va organization tanlash
                kerak emas — token ichida bog‘langan.
              </p>
              <ul className="list-disc space-y-1 pl-5 text-[13px]">
                <li>
                  Auth:{" "}
                  <code>Authorization: Bearer &lt;token&gt;</code> yoki{" "}
                  <code>x-integration-token</code>
                </li>
                <li>
                  Scope:{" "}
                  <code>{INTEGRATION_SCOPES.INSTALLMENT_SETTINGS_READ}</code>
                </li>
                <li>
                  Endpoint:{" "}
                  <code>GET /integration/v1/installment-settings</code>
                </li>
                <li>
                  Optional query: <code>?currencyId=...</code> (limitlar filtri)
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="flex items-center gap-2 text-[10px] font-black uppercase opacity-50">
                  <Terminal className="size-3.5" />
                  Curl misol
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 rounded-xl text-[10px] font-black uppercase"
                  onClick={() =>
                    handleCopy(exampleCurl, "curl", "Curl nusxalandi")
                  }
                >
                  {copiedKey === "curl" ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  Nusxa
                </Button>
              </div>
              <pre className="overflow-x-auto rounded-2xl bg-muted/60 p-4 font-mono text-[11px] leading-relaxed">
                {exampleCurl}
              </pre>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-[10px] font-black uppercase opacity-50">
                  Javob (Rassrochka jadvallari = plans)
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 rounded-xl text-[10px] font-black uppercase"
                  onClick={() =>
                    handleCopy(exampleResponse, "resp", "Javob nusxalandi")
                  }
                >
                  {copiedKey === "resp" ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  Nusxa
                </Button>
              </div>
              <pre className="overflow-x-auto rounded-2xl bg-muted/60 p-4 font-mono text-[11px] leading-relaxed">
                {exampleResponse}
              </pre>
            </div>

            <p className="text-[11px] opacity-50">
              Base URL: <code>{apiBase}</code>
            </p>
          </CardContent>
        </Card>
      </section>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-[2rem] sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">
              Yangi token
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((values) =>
              createMutation.mutate(values),
            )}
            className="space-y-4 pt-2"
          >
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-50">
                Nom (masalan: Website backend)
              </Label>
              <Input
                {...form.register("name")}
                placeholder="Website"
                className="h-12 rounded-xl border-none bg-muted/50 font-bold"
              />
              {form.formState.errors.name ? (
                <p className="text-[10px] font-bold text-destructive">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-50">
                Muddat (ixtiyoriy)
              </Label>
              <Input
                {...form.register("expiresAt")}
                type="datetime-local"
                className="h-12 rounded-xl border-none bg-muted/50 font-bold"
              />
            </div>
            <p className="text-[11px] opacity-50">
              Scope avtomatik:{" "}
              <code>{INTEGRATION_SCOPES.INSTALLMENT_SETTINGS_READ}</code>
            </p>
            <DialogFooter>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-12 w-full rounded-xl font-black uppercase tracking-widest"
              >
                {createMutation.isPending ? "Yaratilmoqda..." : "Yaratish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(revokeId)}
        onOpenChange={(open) => !open && setRevokeId(null)}
        title="Tokenni bekor qilish"
        description="Token ishlamay qoladi. Tashqi backend bu token bilan API chaqira olmaydi."
        confirmLabel="Bekor qilish"
        cancelLabel="Orqaga"
        onConfirm={async () => {
          if (revokeId) await revokeMutation.mutateAsync(revokeId);
        }}
      />
    </div>
  );
}
