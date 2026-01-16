import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import ProfileManagement from "@/components/ProfileManagement";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProfileManagement />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
