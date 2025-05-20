import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/Sidebar";
import InvitationsList from "@/components/admin/invitations/InvitationsList";
import InvitationForm from "@/components/admin/invitations/InvitationForm";
import { Plus } from "lucide-react";
import ImportInvitations from "@/components/admin/invitations/ImportInvitations";
import ImportProcessedCreators from "@/components/admin/invitations/ImportProcessedCreators";

const InvitationsPage = () => {

  const [activeTab, setActiveTab] = useState("list");

  const handleCreateClick = () => {
    setActiveTab("create");
  };

  const handleInvitationCreated = () => {
    setActiveTab("list");
  };


  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Creator Invitations</h1>
          {activeTab === "list" && (
            <Button onClick={handleCreateClick}>
              <Plus size={18} className="mr-2" />
              Create Invitation
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="list">Invitations List</TabsTrigger>
            <TabsTrigger value="create">Create Invitation</TabsTrigger>
            <TabsTrigger value="import">Import Invitations</TabsTrigger>
            <TabsTrigger value="import_meta">Import Meta Processed Invitations</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>All Invitations</CardTitle>
              </CardHeader>
              <CardContent>
                <InvitationsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Invitation</CardTitle>
              </CardHeader>
              <CardContent>
                <InvitationForm onSuccess={handleInvitationCreated} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>Import Invitations</CardTitle>
              </CardHeader>
              <CardContent>
                <ImportInvitations onSuccess={handleInvitationCreated} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="import_meta">
            <Card>
              <CardHeader>
                <CardTitle>Import Meta Processed Creators</CardTitle>
              </CardHeader>
              <CardContent>
                <ImportProcessedCreators />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InvitationsPage;
