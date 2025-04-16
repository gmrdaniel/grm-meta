
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCreators } from "@/services/creatorService";
import { CreatorFilter, CreatorsListProps } from "./types";
import { Creator } from "@/types/creator";
import { CreatorFilters } from "./CreatorFilters";
import { CreatorPagination } from "./CreatorPagination";
import { CreatorEditDialog } from "./CreatorEditDialog";
import { CreatorBatchActions } from "./CreatorBatchActions";
import { CreatorListHeader } from "./CreatorListHeader";
import { CreatorsTable } from "./CreatorsTable";
import { CreatorsEmptyState } from "./CreatorsEmptyState";

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
        <CreatorListHeader 
          totalCount={totalCount}
          pageSize={pageSize}
          setPageSize={setPageSize}
          setCurrentPage={setCurrentPage}
        />
        
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
        <CreatorsEmptyState />
      ) : (
        <>
          <CreatorsTable 
            creators={creators}
            onCreatorSelect={onCreatorSelect}
            onEdit={handleEdit}
            onRefetch={refetch}
            selectedCreators={selectedCreators}
            selectAll={selectAll}
            onSelectAll={handleSelectAll}
            onSelectCreator={handleSelectCreator}
          />

          <CreatorPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={(value) => {
              setPageSize(parseInt(value));
              setCurrentPage(1);
            }}
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
