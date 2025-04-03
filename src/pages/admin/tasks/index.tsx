
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasksList } from "@/components/admin/tasks/TasksList";
import { TaskDetail } from "@/components/admin/tasks/TaskDetail";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminTasks() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  
  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
    setActiveTab("detail");
  };
  
  return (
    <Layout>
      <Header />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold">Tasks Management</h1>
            <div className="mt-4 md:mt-0">
              <Button asChild>
                <Link to="/admin/tasks/create" className="flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Create Task
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="mb-6">
                <TabsList className="w-full max-w-xs">
                  <TabsTrigger value="list" className="flex-1">Task List</TabsTrigger>
                  <TabsTrigger 
                    value="detail" 
                    className="flex-1"
                    disabled={!selectedTaskId}
                  >
                    Task Detail
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="list">
                <TasksList 
                  page={currentPage}
                  onPageChange={setCurrentPage}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  onTaskSelect={handleTaskSelect}
                />
              </TabsContent>
              
              <TabsContent value="detail">
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
