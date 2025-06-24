import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectsList } from "@/components/admin/projects/ProjectsList";
import { ProjectForm } from "@/components/admin/projects/ProjectForm";
import ProjectCreatorsList from "@/components/admin/projects/ProjectCreatorsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProjectProcessedCreatorsList from "./ProjectProcessedCreatorsList";

export default function AdminProjects() {
  const [activeTab, setActiveTab] = useState("list");


return (
  <div className="flex h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold mb-6">Project Management</h1>

          <Tabs
            defaultValue="list"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="list">Projects List</TabsTrigger>
              <TabsTrigger value="create">Create Project</TabsTrigger>
              <TabsTrigger value="profile_projects">Creators by Project</TabsTrigger>
              <TabsTrigger value="import_meta">Import processed creators</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-6">
              <ProjectsList />
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <ProjectForm onSuccess={() => setActiveTab("list")} />
            </TabsContent>

            <TabsContent value="profile_projects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Creators</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectCreatorsList />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="import_meta">
              <Card>
                <CardHeader>
                  <CardTitle>Import Processed Creators</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectProcessedCreatorsList />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  </div>
);

}