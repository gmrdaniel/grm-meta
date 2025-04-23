
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { TwilioSMSForm } from "@/components/admin/sms/TwilioSMSForm";
import { SMSTemplateForm } from "@/components/admin/sms/SMSTemplateForm";
import { SMSTemplatesList } from "@/components/admin/sms/SMSTemplatesList";
import { SMSLogsList } from "@/components/admin/sms/SMSLogsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminSMS() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">SMS Administration</h1>
            
            <Tabs defaultValue="send" className="space-y-4">
              <TabsList>
                <TabsTrigger value="send">Enviar SMS</TabsTrigger>
                <TabsTrigger value="templates">Plantillas</TabsTrigger>
                <TabsTrigger value="logs">Historial</TabsTrigger>
              </TabsList>

              <TabsContent value="send">
                <TwilioSMSForm />
              </TabsContent>

              <TabsContent value="templates" className="space-y-6">
                <SMSTemplateForm />
                <SMSTemplatesList />
              </TabsContent>

              <TabsContent value="logs">
                <SMSLogsList />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
