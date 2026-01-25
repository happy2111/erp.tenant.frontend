'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {Building2, Loader2, ChevronRight} from 'lucide-react';
import { useTenantAuthStore } from '@/store/tenant-auth.store';
import { cn } from '@/lib/utils';

export function OrganizationSelector() {
  const router = useRouter();
  const { pendingOrganizations, selectOrganization } = useTenantAuthStore();
  const [loadingOrgId, setLoadingOrgId] = useState<string | null>(null);

  const handleSelect = async (orgUserId: string) => {
    setLoadingOrgId(orgUserId);
    const success = await selectOrganization(orgUserId);

    if (success) {
      toast.success("Tashkilot muvaffaqiyatli tanlandi");
      router.push('/dashboard');
    } else {
      toast.error("Tashkilotni tanlashda xatolik yuz berdi");
      setLoadingOrgId(null);
    }
  };

  if (!pendingOrganizations || pendingOrganizations.length === 0) {
    return (
      <div className="py-10 text-center animate-in fade-in zoom-in duration-300">
        <p className="text-muted-foreground">Tashkilotlar topilmadi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="text-center space-y-2">

        <h1 className="text-3xl font-bold tracking-tight">Tashkilotni tanlang</h1>
        <p className="text-muted-foreground text-balance">
          Siz bir nechta tashkilotga tegishlisiz. Iltimos, davom etish uchun birini tanlang
        </p>
      </div>

      <div className="grid gap-3">
        {pendingOrganizations.map((org) => (
          <div
            key={org.orgUserId}
            onClick={() => !loadingOrgId && handleSelect(org.orgUserId)}
            className={cn(
              "group relative flex items-center gap-4 p-4 rounded-xl border border-border/50 transition-all duration-300",
              "hover:bg-primary/5 hover:border-primary/30 hover:translate-x-1 cursor-pointer",
              loadingOrgId === org.orgUserId && "opacity-70 grayscale"
            )}
          >
            {/* Иконка с эффектом мягкого свечения */}
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-6 h-6 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                {org.orgName}
              </div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                Rol: {org.role}
              </div>
            </div>

            <div className="flex items-center">
              {loadingOrgId === org.orgUserId ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}