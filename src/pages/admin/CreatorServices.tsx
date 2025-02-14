
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { CreatorServicesTable } from "@/components/creator-services/CreatorServicesTable";

export default function CreatorServices() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <CreatorServicesTable />
          </div>
        </main>
      </div>
    </div>
  );
}
