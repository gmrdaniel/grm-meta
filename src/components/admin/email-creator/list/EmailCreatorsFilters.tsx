
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

interface EmailCreatorsFiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}

export const EmailCreatorsFilters: React.FC<EmailCreatorsFiltersProps> = ({
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="flex items-center space-x-2">
        <Select 
          value={statusFilter} 
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                {statusFilter === "all" && "All Statuses"}
                {statusFilter === "completed" && "Completed Only"}
                {statusFilter === "pending" && "Pending Only"}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed Only</SelectItem>
            <SelectItem value="pending">Pending Only</SelectItem>
          </SelectContent>
        </Select>
        {statusFilter !== "all" && (
          <Badge variant="outline" className="flex items-center gap-1">
            {statusFilter === "completed" ? "Completed" : "Pending"}
            <button 
              onClick={() => setStatusFilter("all")}
              className="ml-1 hover:bg-gray-200 rounded-full p-1"
            >
              ×
            </button>
          </Badge>
        )}
      </div>
    </div>
  );
};
