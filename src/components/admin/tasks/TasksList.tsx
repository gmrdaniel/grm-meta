
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { fetchTasks } from "@/services/tasksService";

interface TasksListProps {
  page: number;
  onPageChange: (page: number) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

// Type guard to validate if a string is a valid task status
function isValidStatus(status: string): status is 'pending' | 'in_progress' | 'completed' | 'review' {
  return ['pending', 'in_progress', 'completed', 'review'].includes(status);
}

export function TasksList({ page, onPageChange, statusFilter, onStatusFilterChange }: TasksListProps) {
  const ITEMS_PER_PAGE = 10;
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', page, statusFilter],
    queryFn: () => fetchTasks({ 
      page, 
      limit: ITEMS_PER_PAGE, 
      status: statusFilter !== 'all' && isValidStatus(statusFilter) ? statusFilter : undefined 
    }),
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'review':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading tasks: {(error as Error).message}</div>;
  }

  if (!data || data.tasks.length === 0) {
    return <div className="text-center p-8 text-gray-500">No tasks found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="w-48">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="review">Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>{getStatusBadge(task.status)}</TableCell>
                <TableCell>{task.project_name || '-'}</TableCell>
                <TableCell>{task.stage_name || '-'}</TableCell>
                <TableCell>{format(new Date(task.created_at), 'dd MMM yyyy')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => page > 1 && onPageChange(page - 1)}
              className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, data.totalPages) }).map((_, i) => {
            let pageNumber: number;
            
            if (data.totalPages <= 5) {
              pageNumber = i + 1;
            } else if (page <= 3) {
              pageNumber = i + 1;
            } else if (page >= data.totalPages - 2) {
              pageNumber = data.totalPages - 4 + i;
            } else {
              pageNumber = page - 2 + i;
            }
            
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink 
                  isActive={pageNumber === page}
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          {data.totalPages > 5 && page < data.totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => page < data.totalPages && onPageChange(page + 1)}
              className={page === data.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
