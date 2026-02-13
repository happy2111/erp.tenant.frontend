import { InstallmentSettingsPage } from "@/components/settings/InstallmentSettingsPage";
import ProtectedRoute from "@/components/auth/protected-route";

export default function SettingsInstallmentsPage() {
  return (
    <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
      <InstallmentSettingsPage />
    </ProtectedRoute>
  );
}