
import { Layout } from "@/components/Layout";
import { RecurrentTasksManager } from "@/components/admin/recurrent-tasks/RecurrentTasksManager";
import { Helmet } from "react-helmet";

export default function AdminRecurrentTasks() {
  return (
    <Layout>
      <Helmet>
        <title>Tareas Recurrentes | Admin Panel</title>
      </Helmet>
      <RecurrentTasksManager />
    </Layout>
  );
}
