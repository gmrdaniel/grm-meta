
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasksList } from "@/components/admin/tasks/TasksList";
import { TaskDetail } from "@/components/admin/tasks/TaskDetail";

export default function AdminTasks() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold">Tasks Management</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                <TabsTrigger value="list" className="text-sm md:text-base">Task List</TabsTrigger>
                <TabsTrigger 
                  value="detail" 
                  className="text-sm md:text-base"
                  disabled={!selectedTaskId}
                >
                  Task Detail
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="p-4">
                <TasksList 
                  page={currentPage}
                  onPageChange={setCurrentPage}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  onTaskSelect={(taskId) => setSelectedTaskId(taskId)}
                />
              </TabsContent>
              
              <TabsContent value="detail" className="p-4">
                {selectedTaskId ? (
                  <TaskDetail taskId={selectedTaskId} />
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    Select a task to view details
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
