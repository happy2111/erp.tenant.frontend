import ProtectedRoute from "@/components/auth/protected-route";
import { TenantUserEdit } from "@/features/tenant-user/TenantUserEdit";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;


  return (
    <ProtectedRoute>
      <TenantUserEdit userId={id} />
    </ProtectedRoute>
  );
}
