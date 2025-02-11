
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

export default function CreatorBankDetail() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Datos bancarios</h1>
            <div className="bg-white p-6 rounded-lg shadow">
              {/* Bank details form will be added here in future iterations */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
