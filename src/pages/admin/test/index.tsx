
import { Layout } from "@/components/Layout";
import TestHeader from "@/components/admin/testing/TestHeader";
import TestTabs from "@/components/admin/testing/TestTabs";

export default function AdminTestPage() {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <TestHeader />
        <TestTabs />
      </div>
    </Layout>
  );
}
