
import { SystemLogsCard } from "@/components/system/SystemLogsCard";

export default function AuditLogs() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      <SystemLogsCard />
    </div>
  );
}
