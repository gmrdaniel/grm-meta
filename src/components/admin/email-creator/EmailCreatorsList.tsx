
import React, { useState } from "react";
import { EmailCreator } from "@/types/email-creator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GenerateTextModal } from "./GenerateTextModal";
import { BulkGenerateTextModal } from "./BulkGenerateTextModal";
import {
  EmailCreatorsTable,
  EmailCreatorsFilters,
  EmailCreatorsActions,
  EmailCreatorsPagination,
  TextViewDialog,
  useEmailCreators
} from "./list";

interface EmailCreatorsListProps {
  creators: EmailCreator[];
  onRefresh: () => void;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  total: number;
  onStatusFilterChange: (status: string) => void;
}

export const EmailCreatorsList: React.FC<EmailCreatorsListProps> = ({ 
  creators, 
  onRefresh, 
  page, 
  totalPages, 
  pageSize, 
  onPageChange, 
  onPageSizeChange,
  total,
  onStatusFilterChange
}) => {
  const [selectedCreator, setSelectedCreator] = useState<EmailCreator | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isBulkGenerateModalOpen, setIsBulkGenerateModalOpen] = useState(false);
  
  const {
    selectedItems,
    statusFilter,
    setStatusFilter,
    viewTextCreator,
    isViewTextDialogOpen,
    setIsViewTextDialogOpen,
    filteredCreators,
    toggleSelectAll,
    toggleSelectItem,
    getSelectedCreators,
    handleViewText,
    handleDownloadSelected,
    sortConfig,
    handleSortChange
  } = useEmailCreators(creators);

  // Update the handler to pass the filter change to parent
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    onStatusFilterChange(status);
  };

  const handleGenerateClick = (creator: EmailCreator) => {
    setSelectedCreator(creator);
    setIsGenerateModalOpen(true);
  };

  const handleBulkGenerateClick = () => {
    if (selectedItems.length === 0) return;
    setIsBulkGenerateModalOpen(true);
  };

  if (creators.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Creator List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-md text-muted-foreground">
              No email creators found. Import some creators from the "Import Creators" tab.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Email Creator List</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Showing {filteredCreators.length} of {total} items
            </span>
            <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
                <SelectItem value="500">500 per page</SelectItem>
                <SelectItem value="1000">1000 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-between items-start">
            <EmailCreatorsFilters
              statusFilter={statusFilter}
              setStatusFilter={handleStatusFilterChange}
            />
            
            <EmailCreatorsActions
              selectedItemsCount={selectedItems.length}
              onDownloadSelected={handleDownloadSelected}
              onBulkGenerateClick={handleBulkGenerateClick}
              disableBulkGenerate={selectedItems.every(id => 
                creators.find(c => c.id === id)?.status === 'completed'
              )}
            />
          </div>

          <EmailCreatorsTable
            creators={creators}
            selectedItems={selectedItems}
            toggleSelectAll={toggleSelectAll}
            toggleSelectItem={toggleSelectItem}
            onViewText={handleViewText}
            onGenerateClick={handleGenerateClick}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
          />

          <EmailCreatorsPagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            selectedItemsCount={selectedItems.length}
          />
        </CardContent>
      </Card>

      <GenerateTextModal
        creator={selectedCreator}
        open={isGenerateModalOpen}
        onOpenChange={setIsGenerateModalOpen}
        onSuccess={onRefresh}
      />
      
      <BulkGenerateTextModal
        creators={getSelectedCreators()}
        open={isBulkGenerateModalOpen}
        onOpenChange={setIsBulkGenerateModalOpen}
        onSuccess={onRefresh}
      />

      <TextViewDialog
        creator={viewTextCreator}
        isOpen={isViewTextDialogOpen}
        onOpenChange={setIsViewTextDialogOpen}
      />
    </>
  );
};
