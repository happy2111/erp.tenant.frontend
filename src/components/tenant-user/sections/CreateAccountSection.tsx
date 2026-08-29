"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  Building2,
  Mail,
  Lock,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { TenantUserService } from "@/services/tenant-user.service";
import {
  CheckUserExistenceResponse,
  TenantUser
} from "@/schemas/tenant-user.schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function generatePassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const all = upper + lower + digits;
  const pick = (set: string) => set[Math.floor(Math.random() * set.length)]!;
  const chars = [pick(upper), pick(lower), pick(digits)];
  for (let i = chars.length; i < length; i += 1) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join("");
}

function generateEmail(seed?: string): string {
  const slug =
    (seed || "user")
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 12) || "user";
  const rand = Math.random().toString(36).slice(2, 8);
  return `${slug}.${rand}@ap.local`;
}

export function CreateAccountSection({
  onChange,
  initialData,
  emailSeed,
}: {
  onChange: (v: any) => void;
  initialData?: TenantUser | undefined;
  emailSeed?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialData?.email || "");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState<boolean>(initialData?.isActive || true);

  const [debouncedEmail] = useDebounce(email, 600);
  const [isChecking, setIsChecking] = useState(false);
  const [existingUser, setExistingUser] = useState<CheckUserExistenceResponse | null>(null);

  useEffect(() => {
    onChange({
      email: email || undefined,
      ...(password.trim().length > 0 ? { password } : {}),
      isActive,
    });
  }, [email, password, isActive, onChange]);

  useEffect(() => {
    const checkEmail = async () => {
      if (!debouncedEmail || !debouncedEmail.includes("@")) {
        setExistingUser(null);
        return;
      }

      try {
        setIsChecking(true);
        const data = await TenantUserService.checkExistence(debouncedEmail);
        if (data) {
          setExistingUser(data);
          toast.warning("Ushbu email bazada mavjud");
        }
      } catch {
        setExistingUser(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkEmail();
  }, [debouncedEmail]);

  return (
    <Card className="border-sidebar-border/60 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Lock className="size-4 text-primary" />
          Akkaunt ma&apos;lumotlari
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Mail className="size-4" />
          </div>
          <Input
            type="email"
            autoComplete="new-email"
            placeholder="ixtiyoriy"
            className="pl-10 pr-10 bg-background/50 border-border/60 focus-visible:ring-primary placeholder:text-muted-foreground/40"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {isChecking && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="size-4 animate-spin text-primary" />
            </div>
          )}
        </div>

        <div className="relative">
          <Input
            type="password"
            placeholder="ixtiyoriy"
            className="bg-background/50 border-border/60 focus-visible:ring-primary placeholder:text-muted-foreground/40"
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-[11px] gap-1.5"
            onClick={() => setEmail(generateEmail(emailSeed))}
          >
            <Sparkles className="size-3" />
            Email
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-[11px] gap-1.5"
            onClick={() => setPassword(generatePassword())}
          >
            <Sparkles className="size-3" />
            Parol
          </Button>
        </div>

        <div className="flex items-center justify-between border border-border/60 rounded-xl p-3 bg-background/30">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Status</span>
            <span className="text-[10px] text-muted-foreground">Foydalanuvchi tizimga kira oladi</span>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        {existingUser && (
          <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[12px] font-bold text-amber-800 uppercase">E-mail band!</h4>
                  <p className="text-[11px] text-amber-700/80">
                    Ushbu pochta manzili bilan foydalanuvchi allaqachon ro&apos;yxatdan o&apos;tgan.
                  </p>
                </div>
              </div>

              <div className="bg-background/60 rounded-lg p-2 border border-amber-500/10">
                <div className="flex flex-wrap gap-1">
                  {existingUser.organizations.map((org, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px] bg-background">
                      <Building2 className="size-2.5 mr-1" />
                      {org.organizationName}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-[11px] border-amber-500/30 text-amber-700 hover:bg-amber-100 gap-2"
                onClick={() => router.push(`/tenant-users/${existingUser.userId}`)}
              >
                Profilni ko&apos;rish <ExternalLink className="size-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
