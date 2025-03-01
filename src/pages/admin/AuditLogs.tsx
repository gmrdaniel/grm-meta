
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SystemLogsCard } from "@/components/system/SystemLogsCard";

export default function AuditLogs() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
            <SystemLogsCard />
          </div>
        </main>
      </div>
    </div>
  );
}
