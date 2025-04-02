
import { SummaryHeader } from './SummaryHeader';
import { SummaryFilters } from './SummaryFilters';
import { SummaryTable } from './SummaryTable';
import { SummaryPagination } from './SummaryPagination';
import { useCreatorsSummary } from './useCreatorsSummary';

interface CreatorsSummaryProps {
  // Add props here if needed
}

export function CreatorsSummary({}: CreatorsSummaryProps) {
  const {
    creators,
    totalCount,
    currentPage,
    pageSize,
    isLoading,
    error,
    tiktokEligibleFilter,
    sortByEligible,
    isExporting,
    handlePageChange,
    handlePageSizeChange,
    toggleTiktokEligibleFilter,
    toggleSortByEligible,
    clearFilters,
    exportEligibleCreators
  } = useCreatorsSummary();
  
  const totalPages = Math.ceil(totalCount / pageSize);
  
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
        Error al cargar los datos de creadores: {(error as Error).message}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-4">
        <SummaryHeader
          totalCount={totalCount}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          isExporting={isExporting}
          onExport={exportEligibleCreators}
        />
        
        <SummaryFilters
          tiktokEligibleFilter={tiktokEligibleFilter}
          sortByEligible={sortByEligible}
          onToggleTiktokEligibleFilter={toggleTiktokEligibleFilter}
          onToggleSortByEligible={toggleSortByEligible}
          onClearFilters={clearFilters}
        />
      </div>
      
      <SummaryTable 
        creators={creators}
        currentPage={currentPage}
        pageSize={pageSize}
      />
      
      <SummaryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
