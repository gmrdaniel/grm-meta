
import React, { useState } from "react";
import { EmailCreator } from "@/types/email-creator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2, ChevronLeft, ChevronRight, ExternalLink, Download, Filter, Eye } from "lucide-react";
import { GenerateTextModal } from "./GenerateTextModal";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BulkGenerateTextModal } from "./BulkGenerateTextModal";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface EmailCreatorsListProps {
  creators: EmailCreator[];
  onRefresh: () => void;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  total: number;
}

export const EmailCreatorsList: React.FC<EmailCreatorsListProps> = ({ 
  creators, 
  onRefresh, 
  page, 
  totalPages, 
  pageSize, 
  onPageChange, 
  onPageSizeChange,
  total
}) => {
  const [selectedCreator, setSelectedCreator] = useState<EmailCreator | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkGenerateModalOpen, setIsBulkGenerateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewTextCreator, setViewTextCreator] = useState<EmailCreator | null>(null);
  const [isViewTextDialogOpen, setIsViewTextDialogOpen] = useState(false);

  const handleGenerateClick = (creator: EmailCreator) => {
    setSelectedCreator(creator);
    setIsGenerateModalOpen(true);
  };

  const handleBulkGenerateClick = () => {
    if (selectedItems.length === 0) return;
    setIsBulkGenerateModalOpen(true);
  };

  const handleViewText = (creator: EmailCreator) => {
    setViewTextCreator(creator);
    setIsViewTextDialogOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredCreators.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredCreators.map(creator => creator.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  const getSelectedCreators = (): EmailCreator[] => {
    return creators.filter(creator => selectedItems.includes(creator.id));
  };
  
  const filteredCreators = creators.filter(creator => {
    if (statusFilter === "all") return true;
    if (statusFilter === "completed") return creator.status === "completed";
    if (statusFilter === "pending") return creator.status !== "completed";
    return true;
  });

  const getTiktokHandle = (tiktokLink: string): string => {
    // Try to extract the handle from URLs like https://www.tiktok.com/@username
    const match = tiktokLink.match(/@([^/?]+)/);
    if (match && match[1]) {
      return `@${match[1]}`;
    }
    
    // If no @ found in the URL, check if it's just a username without @
    if (!tiktokLink.includes("/") && !tiktokLink.includes("@")) {
      return `@${tiktokLink}`;
    }
    
    // Otherwise return the original link
    return tiktokLink;
  };

  const handleDownloadSelected = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one record to download");
      return;
    }

    const selectedCreators = getSelectedCreators();
    
    // Create export data with the specified column order
    const exportData = selectedCreators.map(creator => {
      // Split prompt_output by double line breaks to get paragraphs
      const paragraphs = creator.prompt_output 
        ? creator.prompt_output.split(/\n\s*\n/)
        : [];
      
      // Create a base object with creator info in the specified order
      const baseObject: Record<string, string> = {
        "Full_name": creator.full_name || "",
        "Email": creator.email || "",
        "Link_invitation": creator.link_invitation || "",
      };
      
      // Add each paragraph as a separate column, with placeholders for missing paragraphs
      for (let i = 1; i <= 11; i++) {
        const paragraphIndex = i - 1;
        if (paragraphIndex < paragraphs.length) {
          // Trim whitespace and replace any remaining newlines with spaces
          baseObject[`Paragraph ${i}`] = paragraphs[paragraphIndex].trim().replace(/\n/g, ' ');
        } else {
          // Add empty cell if paragraph doesn't exist
          baseObject[`Paragraph ${i}`] = "";
        }
      }
      
      return baseObject;
    });

    // Create worksheet from the export data
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 25 },  // Full_name
      { wch: 30 },  // Email
      { wch: 35 },  // Link_invitation
      { wch: 60 },  // Paragraph 1
      { wch: 60 },  // Paragraph 2
      { wch: 60 },  // Paragraph 3
      { wch: 60 },  // Paragraph 4
      { wch: 60 },  // Paragraph 5
      { wch: 60 },  // Paragraph 6
      { wch: 60 },  // Paragraph 7
      { wch: 60 },  // Paragraph 8
      { wch: 60 },  // Paragraph 9
      { wch: 60 },  // Paragraph 10
      { wch: 60 },  // Paragraph 11
    ];
    
    worksheet['!cols'] = columnWidths;

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EmailCreators");

    // Generate filename with current date
    const fileName = `email_creators_export_${new Date().toISOString().split("T")[0]}.xlsx`;
    
    // Write the workbook to a file with xlsx extension (Excel format)
    XLSX.writeFile(workbook, fileName, { bookType: 'xlsx' });
    
    toast.success(`${selectedCreators.length} records exported successfully`);
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
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue>
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      {statusFilter === "all" && "All Statuses"}
                      {statusFilter === "completed" && "Completed Only"}
                      {statusFilter === "pending" && "Pending Only"}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed Only</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                </SelectContent>
              </Select>
              {statusFilter !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {statusFilter === "completed" ? "Completed" : "Pending"}
                  <button 
                    onClick={() => setStatusFilter("all")}
                    className="ml-1 hover:bg-gray-200 rounded-full p-1"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
            {selectedItems.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleDownloadSelected}
              >
                <Download className="h-4 w-4" />
                Download Selected ({selectedItems.length})
              </Button>
            )}
          </div>

          <div className="rounded-md border mb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={selectedItems.length === filteredCreators.length && filteredCreators.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>TikTok</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCreators.map((creator) => (
                  <TableRow key={creator.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedItems.includes(creator.id)}
                        onCheckedChange={() => toggleSelectItem(creator.id)}
                        aria-label={`Select ${creator.full_name}`}
                      />
                    </TableCell>
                    <TableCell>{creator.full_name}</TableCell>
                    <TableCell>{creator.email}</TableCell>
                    <TableCell>
                      <a 
                        href={creator.tiktok_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {getTiktokHandle(creator.tiktok_link)}
                        <ExternalLink size={14} />
                      </a>
                    </TableCell>
                    <TableCell>{new Date(creator.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        creator.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        creator.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {creator.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {creator.prompt_output && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewText(creator)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View Text
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateClick(creator)}
                          className="flex items-center gap-1"
                          disabled={creator.status === 'completed'}
                        >
                          <Wand2 className="h-4 w-4" />
                          {creator.status === 'completed' ? 'Already Generated' : 'Create Text'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedItems.length > 0 && (
                <div className="flex space-x-2 items-center">
                  <span>{selectedItems.length} item(s) selected</span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={handleBulkGenerateClick}
                      className="flex items-center gap-1"
                      disabled={selectedItems.every(id => 
                        creators.find(c => c.id === id)?.status === 'completed'
                      )}
                    >
                      <Wand2 className="h-4 w-4" />
                      Generate All Selected
                    </Button>
                    
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadSelected}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download Selected
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
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

      <Dialog open={isViewTextDialogOpen} onOpenChange={setIsViewTextDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generated Text for {viewTextCreator?.full_name}</DialogTitle>
          </DialogHeader>
          {viewTextCreator?.prompt_output ? (
            <div className="whitespace-pre-wrap text-base">
              {viewTextCreator.prompt_output}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No generated text available.
            </div>
          )}
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
