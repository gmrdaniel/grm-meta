
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
  } from "@/components/ui/select";
  
  interface PageSizeSelectorProps {
    pageSize: number;
    setPageSize: (size: number) => void;
  }
  
  export function PageSizeSelector({ pageSize, setPageSize }: PageSizeSelectorProps) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Items per page:</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => setPageSize(parseInt(value))}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }