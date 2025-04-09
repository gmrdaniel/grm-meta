
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EmailCreatorsPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedItemsCount: number;
}

export const EmailCreatorsPagination: React.FC<EmailCreatorsPaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  selectedItemsCount,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        {selectedItemsCount > 0 && (
          <span>{selectedItemsCount} item(s) selected</span>
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
  );
};
