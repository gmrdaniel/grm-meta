
import React from "react";
import { Layout } from "@/components/Layout";
import { Header } from "@/components/Header";
import { NotificationsTabs } from "@/components/admin/notifications/NotificationsTabs";

export default function AdminNotificationsPage() {
  return (
    <Layout>
      <Header />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Notification Management</h1>
          <NotificationsTabs />
        </div>
      </div>
    </Layout>
  );
};
