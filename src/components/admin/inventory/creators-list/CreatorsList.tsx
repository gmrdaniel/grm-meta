
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCreators } from "@/services/creatorService";
import { CreatorFilter, CreatorsListProps } from "./types";
import { Creator } from "@/types/creator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreatorRow } from "./CreatorRow";
import { CreatorFilters } from "./CreatorFilters";
import { CreatorPagination } from "./CreatorPagination";
import { CreatorEditDialog } from "./CreatorEditDialog";

export function CreatorsList({ 
  onCreatorSelect, 
  filters = {}, 
  onFilterChange 
}: CreatorsListProps) {
  const [editCreator, setEditCreator] = useState<Creator | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeFilters, setActiveFilters] = useState<CreatorFilter>(filters);

  const { 
    data: creatorsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["creators", currentPage, pageSize, activeFilters],
    queryFn: () => fetchCreators(currentPage, pageSize, activeFilters),
  });

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(activeFilters);
    }
    setCurrentPage(1);
  }, [activeFilters, onFilterChange]);

  const creators = creatorsData?.data || [];
  const totalCount = creatorsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleEdit = (creator: Creator) => {
    if (onCreatorSelect) {
      onCreatorSelect(creator);
    } else {
      setEditCreator(creator);
      setIsEditDialogOpen(true);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value));
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: CreatorFilter) => {
    setActiveFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        Error al cargar los creadores: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Lista de Creadores</h2>
          <p className="text-gray-500">Total: {totalCount} creadores</p>
        </div>
        
        <CreatorFilters 
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />
      </div>
      
      {creators.length === 0 ? (
        <div className="p-8 text-center text-gray-500 border rounded-md">
          No hay creadores que coincidan con los criterios seleccionados
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Creador</TableHead>
                  <TableHead className="w-[300px]">Redes Sociales</TableHead>
                  <TableHead className="w-[180px]">Teléfono</TableHead>
                  <TableHead className="w-[150px]">Fecha</TableHead>
                  <TableHead className="w-[120px]">Estatus</TableHead>
                  <TableHead className="w-[120px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creators.map((creator) => (
                  <CreatorRow 
                    key={creator.id}
                    creator={creator}
                    onCreatorSelect={onCreatorSelect}
                    onEdit={handleEdit}
                    onRefetch={refetch}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          <CreatorPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      <CreatorEditDialog
        creator={editCreator}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
