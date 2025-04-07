
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailCreatorsList } from "@/components/admin/email-creator/EmailCreatorsList";
import { ImportEmailCreators } from "@/components/admin/email-creator/ImportEmailCreators";
import { getEmailCreators } from "@/services/emailCreatorService";

export default function AdminCreateEmail() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleImportComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // This will re-fetch the creators whenever the refreshTrigger changes
  const emailCreators = getEmailCreators();

  return (
    <div className="flex h-screen bg-gray-50">
      <Layout>
        <Header />
        <div className="container mx-auto py-6 max-w-7xl">
          <h1 className="text-2xl font-bold mb-6">Email Creator Management</h1>
          
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">Creators List</TabsTrigger>
              <TabsTrigger value="import">Import Creators</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-4">
              <EmailCreatorsList creators={emailCreators} />
            </TabsContent>
            
            <TabsContent value="import" className="space-y-4">
              <ImportEmailCreators onImportComplete={handleImportComplete} />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </div>
  );
}
