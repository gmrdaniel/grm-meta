
import { Layout } from "@/components/Layout";
import { NotificationsAdminTabs } from "@/components/admin/admin-notifications/NotificationsAdminTabs";
import { Helmet } from "react-helmet";

export default function AdminNotificationsPage() {
  return (
    <Layout>
      <Helmet>
        <title>Admin Notifications | Dashboard</title>
      </Helmet>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Notifications Management</h1>
        <NotificationsAdminTabs />
      </div>
    </Layout>
  );
}
