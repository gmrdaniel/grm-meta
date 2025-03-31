
import { Button } from "@/components/ui/button";
import { Filter, X, Check } from "lucide-react";
import { CreatorFilter } from "./types";

interface CreatorFiltersProps {
  activeFilters: CreatorFilter;
  onFilterChange: (filters: CreatorFilter) => void;
}

export function CreatorFilters({ activeFilters, onFilterChange }: CreatorFiltersProps) {
  const toggleFilter = (filterName: keyof CreatorFilter) => {
    onFilterChange({
      ...activeFilters,
      [filterName]: !activeFilters[filterName],
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
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
        variant={activeFilters.hasTiktokUsername ? "default" : "outline"} 
        size="sm"
        onClick={() => toggleFilter('hasTiktokUsername')}
        className="flex items-center gap-1"
      >
        {activeFilters.hasTiktokUsername ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
        Usuario TikTok
      </Button>
      
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={clearFilters}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
