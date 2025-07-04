import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TikTokImportTemplate } from "./import-templates/TikTokImportTemplate";
import { BulkInvitationsHistory } from "./BulkInvitationsHistory";
import { toast } from "sonner";

interface ImportCreatorsProps {
  onSuccess?: () => void;
}

export function ImportCreators({ onSuccess }: ImportCreatorsProps) {
  const [activeTab, setActiveTab] = useState("templates");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Import Creators</h2>
        <p className="text-gray-500">
          Import creators using predefined templates or view import history
        </p>
      </div>

      <Tabs
        defaultValue="templates"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle>TikTok User</CardTitle>
                <CardDescription>
                  Imports creators with their basic information and TikTok
                  username.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Includes: full name, last name, email, TikTok username.
                </p>
                <Button
                  onClick={() => setActiveTab("tiktok-template")}
                  variant="outline"
                  className="w-full"
                >
                  Use template
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-400">Coming Soon</CardTitle>
                <CardDescription className="text-gray-400">
                  More Import Templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">
                  Templates for Other Creator Types
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Not available
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <BulkInvitationsHistory />
        </TabsContent>

        <TabsContent value="tiktok-template" className="pt-4">
          <TikTokImportTemplate
            onSuccess={() => {
              setActiveTab("history");
              if (onSuccess) onSuccess();
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
