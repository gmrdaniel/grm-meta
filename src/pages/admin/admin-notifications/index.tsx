
import { Layout } from "@/components/Layout";
import { NotificationsAdminTabs } from "@/components/admin/admin-notifications/NotificationsAdminTabs";
import { HelmetProvider, Helmet } from "react-helmet-async";

export default function AdminNotificationsPage() {
  return (
    <Layout>
      <HelmetProvider>
        <Helmet>
          <title>Admin Notifications | Dashboard</title>
        </Helmet>
      </HelmetProvider>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Notifications Management</h1>
        <NotificationsAdminTabs />
      </div>
    </Layout>
  );
}
