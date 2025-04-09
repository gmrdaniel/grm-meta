
import { Layout } from "@/components/Layout";
import { NotificationLogsTab } from "@/components/admin/admin-notifications/logs/NotificationLogsTab";

export default function LogNotificationPage() {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Notification Logs</h1>
          <p className="text-muted-foreground">View and manage notification logs</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <NotificationLogsTab />
        </div>
      </div>
    </Layout>
  );
}
