import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationForm } from "@/components/organization/OrganizationForm";
import { Separator } from "@/components/ui/separator";

export default function CreateOrganizationPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--color-background)] p-4 sm:p-6 lg:p-12">
      {/* Карточка для формы, стилизованная в соответствии с вашими переменными */}
      <Card
        className="w-full max-w-lg border-[var(--color-border)] shadow-2xl bg-[var(--color-card)] text-[var(--color-card-foreground)]"
        style={{
          borderRadius: 'var(--radius-lg)'
        } as React.CSSProperties}
      >
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-extrabold text-[var(--color-primary)]">
            Новая Организация
          </CardTitle>
          <CardDescription className="text-[var(--color-muted-foreground)]">
            Заполните обязательные поля, чтобы зарегистрировать вашу организацию.
          </CardDescription>
          <Separator className="bg-[var(--color-border)] mt-4" />
        </CardHeader>
        <CardContent>
          <OrganizationForm />
        </CardContent>
      </Card>
    </div>
  );
}