
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

interface NotificationLogsPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export function NotificationLogsPagination({ 
  currentPage, 
  totalPages, 
  setCurrentPage 
}: NotificationLogsPaginationProps) {
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
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
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
                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
