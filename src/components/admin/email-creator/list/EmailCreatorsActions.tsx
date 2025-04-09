
import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface EmailCreatorsActionsProps {
  selectedItemsCount: number;
  onDownloadSelected: (format: 'xls' | 'csv') => void;
  onBulkGenerateClick: () => void;
  disableBulkGenerate: boolean;
}

export const EmailCreatorsActions: React.FC<EmailCreatorsActionsProps> = ({
  selectedItemsCount,
  onDownloadSelected,
  onBulkGenerateClick,
  disableBulkGenerate,
}) => {
  if (selectedItemsCount === 0) return null;
  
  return (
    <div className="ml-auto">
      <div className="flex gap-2">
        <Button 
          size="sm"
          variant="outline"
          onClick={onBulkGenerateClick}
          className="flex items-center gap-1"
          disabled={disableBulkGenerate}
        >
          Generate All Selected ({selectedItemsCount})
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
            >
              <FileDown className="h-4 w-4" />
              Download Selected ({selectedItemsCount})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onDownloadSelected('xls')}>
              <FileDown className="h-4 w-4 mr-2" />
              Download as Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownloadSelected('csv')}>
              <FileDown className="h-4 w-4 mr-2" />
              Download as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
