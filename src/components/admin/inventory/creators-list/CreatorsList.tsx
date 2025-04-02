
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
import { Button } from "@/components/ui/button";
import { Check, Filter, Video, X } from "lucide-react";

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

  const toggleFilter = (filterName: keyof CreatorFilter) => {
    setActiveFilters(prev => {
      // Clear other mutually exclusive filters if needed
      const newFilters = { ...prev };
      
      // If turning on 'withVideos', turn off 'withoutVideos'
      if (filterName === 'withVideos' && !prev[filterName]) {
        delete newFilters.withoutVideos;
      }
      
      // If turning on 'withoutVideos', turn off 'withVideos'
      if (filterName === 'withoutVideos' && !prev[filterName]) {
        delete newFilters.withVideos;
      }
      
      // Toggle the requested filter
      newFilters[filterName] = !prev[filterName];
      
      if (!newFilters[filterName]) {
        delete newFilters[filterName];
      }
      
      return newFilters;
    });
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
        
        <div className="flex gap-2">
          <Button 
            variant={activeFilters.tiktokEligible ? "default" : "outline"} 
            size="sm"
            onClick={() => toggleFilter('tiktokEligible')}
            className="flex items-center gap-1"
          >
            {activeFilters.tiktokEligible ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
            TikTok Elegible
          </Button>
          
          <Button 
            variant={activeFilters.hasTikTokUsername ? "default" : "outline"} 
            size="sm"
            onClick={() => toggleFilter('hasTikTokUsername')}
            className="flex items-center gap-1"
          >
            {activeFilters.hasTikTokUsername ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
            Usuario TikTok
          </Button>
          
          <Button 
            variant={activeFilters.withVideos ? "default" : "outline"} 
            size="sm"
            onClick={() => toggleFilter('withVideos')}
            className="flex items-center gap-1"
          >
            {activeFilters.withVideos ? <Check className="h-4 w-4" /> : <Video className="h-4 w-4" />}
            Con Videos
          </Button>
          
          <Button 
            variant={activeFilters.withoutVideos ? "default" : "outline"} 
            size="sm"
            onClick={() => toggleFilter('withoutVideos')}
            className="flex items-center gap-1"
          >
            {activeFilters.withoutVideos ? <Check className="h-4 w-4" /> : <Video className="h-4 w-4 line-through" />}
            Sin Videos
          </Button>
          
          {Object.keys(activeFilters).length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setActiveFilters({})}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>
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
