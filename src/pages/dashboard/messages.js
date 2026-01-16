import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import MessagesInbox from "@/components/MessagesInbox";

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <MessagesInbox />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
