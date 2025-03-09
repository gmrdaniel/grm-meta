
import { useState } from "react";
import { Category } from "./types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CategoriesTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onStatusChange: (id: string, newStatus: 'active' | 'inactive') => void;
  pageCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function CategoriesTable({
  categories,
  isLoading,
  onEdit,
  onStatusChange,
  pageCount,
  page,
  pageSize,
  onPageChange,
}: CategoriesTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table className="border">
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="w-[300px]">Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de Creación</TableHead>
            <TableHead>Última Actualización</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No hay categorías disponibles
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={category.status === "active"}
                      onCheckedChange={(checked) =>
                        onStatusChange(
                          category.id,
                          checked ? "active" : "inactive"
                        )
                      }
                    />
                    <span
                      className={
                        category.status === "active"
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      {category.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(category.created_at), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  {format(new Date(category.updated_at), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(category)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pageCount > 1 && (
        <Pagination className="justify-center">
          <PaginationContent>
            <PaginationItem>
              {page === 0 ? (
                <PaginationPrevious 
                  onClick={() => {}} 
                  aria-disabled="true"
                  className="opacity-50 pointer-events-none"
                />
              ) : (
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(page - 1, 0))}
                />
              )}
            </PaginationItem>
            {Array.from({ length: pageCount }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  isActive={page === index}
                  onClick={() => onPageChange(index)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              {page === pageCount - 1 ? (
                <PaginationNext 
                  onClick={() => {}} 
                  aria-disabled="true"
                  className="opacity-50 pointer-events-none"
                />
              ) : (
                <PaginationNext
                  onClick={() => onPageChange(Math.min(page + 1, pageCount - 1))}
                />
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
