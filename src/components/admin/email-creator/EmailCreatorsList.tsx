
import React, { useState } from "react";
import { EmailCreator } from "@/types/email-creator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { GenerateTextModal } from "./GenerateTextModal";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BulkGenerateTextModal } from "./BulkGenerateTextModal";

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

  const handleGenerateClick = (creator: EmailCreator) => {
    setSelectedCreator(creator);
    setIsGenerateModalOpen(true);
  };

  const handleBulkGenerateClick = () => {
    if (selectedItems.length === 0) return;
    setIsBulkGenerateModalOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === creators.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(creators.map(creator => creator.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  // Get selected creators objects array
  const getSelectedCreators = (): EmailCreator[] => {
    return creators.filter(creator => selectedItems.includes(creator.id));
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
              Showing {creators.length} of {total} items
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
          <div className="rounded-md border mb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={selectedItems.length === creators.length && creators.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>TikTok Link</TableHead>
                  <TableHead>Invitation Link</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creators.map((creator) => (
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
                        {creator.tiktok_link.length > 30 
                          ? `${creator.tiktok_link.substring(0, 30)}...` 
                          : creator.tiktok_link}
                        <ExternalLink size={14} />
                      </a>
                    </TableCell>
                    <TableCell>
                      {creator.link_invitation ? (
                        <a 
                          href={creator.link_invitation} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {creator.link_invitation.length > 30 
                            ? `${creator.link_invitation.substring(0, 30)}...` 
                            : creator.link_invitation}
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-gray-400">Not provided</span>
                      )}
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleGenerateClick(creator)}
                        className="flex items-center gap-1"
                        disabled={creator.status === 'completed'}
                      >
                        <Wand2 className="h-4 w-4" />
                        {creator.status === 'completed' ? 'Already Generated' : 'Create Text Notification'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedItems.length > 0 && (
                <div className="flex space-x-2 items-center">
                  <span>{selectedItems.length} item(s) selected</span>
                  {selectedItems.length > 0 && (
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
                  )}
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
    </>
  );
}
