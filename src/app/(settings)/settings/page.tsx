import { MainSettingsPage } from "@/components/settings/MainSettingsPage";
import ProtectedRoute from "@/components/auth/protected-route";

export default function SettingsMainPage() {
  return (
    <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
      <MainSettingsPage />
    </ProtectedRoute>
  );
}