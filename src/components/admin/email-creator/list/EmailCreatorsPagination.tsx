
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Show pages around current page
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    
    // Always show last page if there's more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    // Return unique sorted pages
    return [...new Set(pages)].sort((a, b) => a - b);
  };
  
  const pageNumbers = getPageNumbers();
  
  // Handle direct page input
  const handlePageInput = (value: string) => {
    const pageNum = parseInt(value, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
  };

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        {selectedItemsCount > 0 && (
          <span>{selectedItemsCount} item(s) selected</span>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center space-x-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(page - 1)}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {pageNumbers.map((pageNum, i) => {
                // Add ellipsis if there's a gap
                if (i > 0 && pageNum > pageNumbers[i - 1] + 1) {
                  return (
                    <React.Fragment key={`ellipsis-${i}`}>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          isActive={page === pageNum}
                          onClick={() => onPageChange(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    </React.Fragment>
                  );
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink 
                      isActive={page === pageNum}
                      onClick={() => onPageChange(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(page + 1)}
                  disabled={page === totalPages}
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          {totalPages > 5 && (
            <div className="flex items-center ml-4">
              <span className="text-sm mr-2">Go to page:</span>
              <Select onValueChange={handlePageInput} value={page.toString()}>
                <SelectTrigger className="w-16">
                  <SelectValue placeholder={page} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
