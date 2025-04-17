
import { CreatorFilter } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreatorListHeaderProps {
  totalCount: number;
  pageSize: number;
  setPageSize: (size: number) => void;
  setCurrentPage: (page: number) => void;
}

export function CreatorListHeader({
  totalCount,
  pageSize,
  setPageSize,
  setCurrentPage,
}: CreatorListHeaderProps) {
  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value));
    setCurrentPage(1);
  };

  return (
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-2xl font-bold">Lista de Creadores</h2>
        <div className="flex items-center gap-4">
          <p className="text-gray-500">Total: {totalCount} creadores</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Resultados por página:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="250">250</SelectItem>
                <SelectItem value="500">500</SelectItem>
                <SelectItem value="1000">1,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
