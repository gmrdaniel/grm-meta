
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { TwilioSMSForm } from "@/components/admin/sms/TwilioSMSForm";
import { SMSTemplateForm } from "@/components/admin/sms/SMSTemplateForm";
import { SMSTemplatesList } from "@/components/admin/sms/SMSTemplatesList";
import { SMSLogsList } from "@/components/admin/sms/SMSLogsList";
import { BulkSMSForm } from "@/components/admin/sms/BulkSMSForm";
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
                <TabsTrigger value="send">Send SMS</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Send</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="send">
                <TwilioSMSForm />
              </TabsContent>

              <TabsContent value="bulk">
                <BulkSMSForm />
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
