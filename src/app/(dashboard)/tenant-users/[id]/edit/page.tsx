import ProtectedRoute from "@/components/auth/protected-route";
import EditTenantUserPage from "@/components/tenant-user/EditTenantUserPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;


  return (
    <ProtectedRoute>
      <EditTenantUserPage id={id} />
    </ProtectedRoute>
  );
}
