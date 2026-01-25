'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, Mail, Lock, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTenantAuthStore } from '@/store/tenant-auth.store';
import { cn } from '@/lib/utils';

// Схема валидации
const formSchema = z.object({
  loginType: z.enum(['email', 'phone']),
  email: z.string().email("To'g'ri email kiriting").optional().or(z.literal('')),
  phone: z.string().min(9, "Telefon raqami noto'g'ri").optional().or(z.literal('')),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
}).refine((data) => {
  if (data.loginType === 'email') return !!data.email;
  if (data.loginType === 'phone') return !!data.phone;
  return true;
}, {
  message: "Maydonni to'ldiring",
  path: ["email"]
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useTenantAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { loginType: 'email', email: '', phone: '', password: '' },
  });

  // Функция для маскировки телефона (узбекский формат)
  const formatPhone = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    }
    if (phoneNumberLength < 9) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 5)}-${phoneNumber.slice(5)}`;
    }
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 5)}-${phoneNumber.slice(5, 7)}-${phoneNumber.slice(7, 9)}`;
  };

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    const finalLogin = loginType === 'email' ? values.email : `+998${values.phone?.replace(/[^\d]/g, '')}`;

    try {
      const result = await login({
        login: finalLogin!.trim(),
        password: values.password,
      });

      if (result.success) {
        toast.success(result.requiresOrgSelection ? "Tashkilotni tanlang" : "Xush kelibsiz!");
        router.push(result.requiresOrgSelection ? '/select-organization' : '/dashboard');
      } else {
        toast.error(result.error || "Kirishda xatolik yuz berdi");
      }
    } catch (err) {
      toast.error("Server bilan bog'lanishda xatolik");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

        {/* Переключатель типов входа */}
        <Tabs
          defaultValue="email"
          className="w-full"
          onValueChange={(v) => {
            setLoginType(v as 'email' | 'phone');
            form.setValue('loginType', v as 'email' | 'phone');
          }}
        >
          <TabsList className="grid w-full grid-cols-2 bg-background/30 backdrop-blur-md border border-border/40 p-1">
            <TabsTrigger value="email" className="text-xs transition-all data-[state=active]:bg-background/80">Email</TabsTrigger>
            <TabsTrigger value="phone" className="text-xs transition-all data-[state=active]:bg-background/80">Telefon</TabsTrigger>
          </TabsList>
        </Tabs>

        {loginType === 'email' ? (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="animate-in fade-in slide-in-from-left-2 duration-300">
                <FormLabel className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">Email Manzil</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input placeholder="example@mail.com" {...field} className="pl-10 bg-background/40 border-border/40 focus:bg-background/60" />
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="animate-in fade-in slide-in-from-right-2 duration-300">
                <FormLabel className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">Telefon Raqami</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">+998</span>
                    <Input
                      placeholder="(90) 123-45-67"
                      {...field}
                      value={formatPhone(field.value || '')}
                      onChange={(e) => field.onChange(e.target.value.replace(/[^\d]/g, '').slice(0, 9))}
                      className="pl-14 bg-background/40 border-border/40 focus:bg-background/60"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">Parol</FormLabel>
              <FormControl>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...field}
                    className="pl-10 h-11 bg-background/40 border-border/40 focus:bg-background/60 transition-all"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-11 bg-primary hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 active:scale-[0.98]"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kirish'}
        </Button>
      </form>
    </Form>
  );
}