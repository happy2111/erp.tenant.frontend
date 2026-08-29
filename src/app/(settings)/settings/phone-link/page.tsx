import { PhoneLinkPage } from "@/components/settings/PhoneLinkPage";
import ProtectedRoute from "@/components/auth/protected-route";

export default function SettingsPhoneLinkPage() {
  return (
    <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
      <PhoneLinkPage />
    </ProtectedRoute>
  );
}
