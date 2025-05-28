import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import ImportCampaign from "@/components/admin/campaigns/SendCampaign";
import { CampaignStats } from "@/components/admin/campaigns/CampaignStats";

export default function CampaignPage() {
  const [activeTab, setActiveTab] = useState("statistics");

  return (
    <Layout>
      <div className="container max-w-full py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Campañas</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
            <TabsTrigger value="send">Enviar Campaña</TabsTrigger>
          </TabsList>

          <TabsContent value="statistics">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Campañas</CardTitle>
              </CardHeader>
              <CardContent>
                <CampaignStats />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Campaña</CardTitle>
              </CardHeader>
              <CardContent>
                <ImportCampaign />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}