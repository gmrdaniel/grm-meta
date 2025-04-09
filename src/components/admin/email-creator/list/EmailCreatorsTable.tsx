
import React from "react";
import { EmailCreator } from "@/types/email-creator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { EmailCreatorItem } from "./EmailCreatorItem";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface EmailCreatorsTableProps {
  creators: EmailCreator[];
  selectedItems: string[];
  toggleSelectAll: () => void;
  toggleSelectItem: (id: string) => void;
  onViewText: (creator: EmailCreator) => void;
  onGenerateClick: (creator: EmailCreator) => void;
  sortConfig: SortConfig | null;
  onSortChange: (key: string) => void;
}

export const EmailCreatorsTable: React.FC<EmailCreatorsTableProps> = ({
  creators,
  selectedItems,
  toggleSelectAll,
  toggleSelectItem,
  onViewText,
  onGenerateClick,
  sortConfig,
  onSortChange,
}) => {
  const allSelected = selectedItems.length === creators.length && creators.length > 0;
  
  const renderSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) {
      return null;
    }
    return sortConfig.direction === 'asc' ? 
      <ArrowUpIcon className="ml-2 h-4 w-4 inline" /> : 
      <ArrowDownIcon className="ml-2 h-4 w-4 inline" />;
  };

  const SortableHeader = ({ columnKey, label }: { columnKey: string, label: string }) => (
    <Button 
      variant="ghost" 
      onClick={() => onSortChange(columnKey)}
      className="font-medium text-muted-foreground hover:text-foreground p-0 h-auto"
    >
      {label}
      {renderSortIcon(columnKey)}
    </Button>
  );
  
  return (
    <div className="rounded-md border mb-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>TikTok</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>
              <SortableHeader columnKey="created_at" label="Created At" />
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {creators.map((creator) => (
            <EmailCreatorItem
              key={creator.id}
              creator={creator}
              isSelected={selectedItems.includes(creator.id)}
              onSelectItem={toggleSelectItem}
              onViewText={onViewText}
              onGenerateClick={onGenerateClick}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
