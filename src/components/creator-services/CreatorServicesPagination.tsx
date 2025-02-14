
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface CreatorServicesPaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
}

export function CreatorServicesPagination({
  page,
  totalPages,
  setPage,
}: CreatorServicesPaginationProps) {
  return (
    <div className="flex items-center justify-end space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(1)}
        disabled={page === 1}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(page + 1)}
        disabled={page >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(totalPages)}
        disabled={page >= totalPages}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
