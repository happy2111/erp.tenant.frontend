import { IntegrationTokensPage } from "@/components/settings/IntegrationTokensPage";
import ProtectedRoute from "@/components/auth/protected-route";

export default function SettingsIntegrationPage() {
  return (
    <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
      <IntegrationTokensPage />
    </ProtectedRoute>
  );
}
