
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

interface NotificationSettingsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const NotificationSettingsPagination = ({
  currentPage,
  totalPages,
  onPageChange
}: NotificationSettingsPaginationProps) => {
  if (totalPages <= 1) return null;

  // Generate page numbers
  let pageNumbers = [];
  const maxDisplayPages = 5;
  
  if (totalPages <= maxDisplayPages) {
    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    // Always show first and last page, and a few pages around current
    if (currentPage <= 3) {
      pageNumbers = [1, 2, 3, 4, 5, '...', totalPages];
    } else if (currentPage >= totalPages - 2) {
      pageNumbers = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pageNumbers = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
  }

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        
        {pageNumbers.map((page, index) => (
          <PaginationItem key={index}>
            {page === '...' ? (
              <span className="px-4 py-2">...</span>
            ) : (
              <PaginationLink
                isActive={currentPage === page}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
