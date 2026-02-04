import ProtectedRoute from "@/components/auth/protected-route";
import {TenantUserDetails} from "@/components/tenant-user/pages/TenantUserDetails";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;

  return (
    <ProtectedRoute>
      {/* 3. Pass the unwrapped id */}
      <TenantUserDetails userId={id} />
    </ProtectedRoute>
  );
}