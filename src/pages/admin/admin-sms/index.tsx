
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { TwilioSMSForm } from "@/components/admin/sms/TwilioSMSForm";

export default function AdminSMS() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">SMS Administration</h1>
            <TwilioSMSForm />
          </div>
        </main>
      </div>
    </div>
  );
}
