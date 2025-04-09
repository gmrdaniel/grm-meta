
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailCreatorsList } from "@/components/admin/email-creator/EmailCreatorsList";
import { ImportEmailCreators } from "@/components/admin/email-creator/ImportEmailCreators";
import { getEmailCreators } from "@/services/emailCreatorService";
import { EmailCreator } from "@/types/email-creator";

export default function AdminCreateEmail() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [creators, setCreators] = useState<EmailCreator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const handleImportComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  // Handle status filter changes
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status === "all" ? null : status);
    setPage(1); // Reset to first page when changing filter
  };

  useEffect(() => {
    const fetchCreators = async () => {
      setIsLoading(true);
      try {
        const response = await getEmailCreators({ 
          page, 
          pageSize,
          status: statusFilter || undefined
        });
        setCreators(response.data);
        setTotalPages(response.totalPages);
        setTotal(response.total);
      } catch (error) {
        console.error("Error fetching creators:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreators();
  }, [refreshTrigger, page, pageSize, statusFilter]);

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
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-b-transparent"></div>
                </div>
              ) : (
                <EmailCreatorsList 
                  creators={creators}
                  onRefresh={handleRefresh}
                  page={page}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  total={total}
                  onStatusFilterChange={handleStatusFilterChange}
                />
              )}
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
