
import React from "react";
import { EmailCreator } from "@/types/email-creator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { EmailCreatorItem } from "./EmailCreatorItem";

interface EmailCreatorsTableProps {
  creators: EmailCreator[];
  selectedItems: string[];
  toggleSelectAll: () => void;
  toggleSelectItem: (id: string) => void;
  onViewText: (creator: EmailCreator) => void;
  onGenerateClick: (creator: EmailCreator) => void;
}

export const EmailCreatorsTable: React.FC<EmailCreatorsTableProps> = ({
  creators,
  selectedItems,
  toggleSelectAll,
  toggleSelectItem,
  onViewText,
  onGenerateClick,
}) => {
  const allSelected = selectedItems.length === creators.length && creators.length > 0;
  
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
            <TableHead>Email</TableHead>
            <TableHead>TikTok</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Created At</TableHead>
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
