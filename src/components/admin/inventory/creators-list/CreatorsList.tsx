
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
import { CreatorBatchActions } from "./CreatorBatchActions";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [selectedCreators, setSelectedCreators] = useState<Creator[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const { 
    data: creatorsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["creators", currentPage, pageSize, activeFilters],
    queryFn: () => fetchCreators(currentPage, pageSize, activeFilters),
  });

  const creators = creatorsData?.data || [];
  const totalCount = creatorsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Reset selected creators when page changes
  useEffect(() => {
    setSelectedCreators([]);
    setSelectAll(false);
  }, [currentPage, pageSize, activeFilters]);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(activeFilters);
    }
    setCurrentPage(1);
  }, [activeFilters, onFilterChange]);

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

  const handleSelectCreator = (creator: Creator) => {
    setSelectedCreators(prev => {
      const isSelected = prev.some(c => c.id === creator.id);
      if (isSelected) {
        return prev.filter(c => c.id !== creator.id);
      } else {
        return [...prev, creator];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCreators([]);
    } else {
      setSelectedCreators([...creators]);
    }
    setSelectAll(!selectAll);
  };

  const clearSelection = () => {
    setSelectedCreators([]);
    setSelectAll(false);
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
          <div className="flex items-center gap-4">
            <p className="text-gray-500">Total: {totalCount} creadores</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Resultados por página:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <CreatorFilters 
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />
      </div>
      
      <CreatorBatchActions
        selectedCreators={selectedCreators}
        onSuccess={refetch}
        clearSelection={clearSelection}
      />
      
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
                  <TableHead className="w-[40px]">
                    <Checkbox 
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                      aria-label="Seleccionar todos"
                    />
                  </TableHead>
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
                    isSelected={selectedCreators.some(c => c.id === creator.id)}
                    onSelectChange={() => handleSelectCreator(creator)}
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

