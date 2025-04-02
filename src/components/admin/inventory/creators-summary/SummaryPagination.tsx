
import { Button } from "@/components/ui/button";

interface SummaryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function SummaryPagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: SummaryPaginationProps) {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-end mt-4">
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        
        <div className="flex items-center mx-2">
          <span className="text-sm">
            Página {currentPage} de {totalPages}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
