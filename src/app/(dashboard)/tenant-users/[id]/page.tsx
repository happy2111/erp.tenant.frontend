import ProtectedRoute from "@/components/auth/protected-route";
import {TenantUserDetails} from "@/features/tenant-user/TenantUserDetails";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;

  return (
    <ProtectedRoute>
      {/* 3. Pass the unwrapped id */}
      <TenantUserDetails userId={id} />
    </ProtectedRoute>
  );
}