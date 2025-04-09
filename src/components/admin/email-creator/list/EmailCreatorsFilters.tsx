
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, FileText } from "lucide-react";

interface EmailCreatorsFiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  sourceFileFilter: string;
  setSourceFileFilter: (value: string) => void;
  uniqueSourceFiles: string[];
}

export const EmailCreatorsFilters: React.FC<EmailCreatorsFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  sourceFileFilter,
  setSourceFileFilter,
  uniqueSourceFiles,
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
      
      <div className="flex items-center space-x-2">
        <Select 
          value={sourceFileFilter} 
          onValueChange={setSourceFileFilter}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue>
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                {sourceFileFilter === "all" ? "All Source Files" : sourceFileFilter}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Source Files</SelectItem>
            {uniqueSourceFiles.map(source => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {sourceFileFilter !== "all" && (
          <Badge variant="outline" className="flex items-center gap-1">
            {sourceFileFilter}
            <button 
              onClick={() => setSourceFileFilter("all")}
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
