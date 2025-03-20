
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
}

export function CreatorServicesPagination({ page, totalPages, setPage }: PaginationProps) {
  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm">
        Página {page} de {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
