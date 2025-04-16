
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Filter, X } from "lucide-react";
import { CreatorFilter } from "./types";

interface CreatorFiltersProps {
  activeFilters: CreatorFilter;
  onFilterChange: (filters: CreatorFilter) => void;
}

export function CreatorFilters({ 
  activeFilters, 
  onFilterChange 
}: CreatorFiltersProps) {
  
  const toggleFilter = (filterName: keyof CreatorFilter) => {
    // We need to make sure we're handling the selectedUser property correctly
    if (filterName === 'selectedUser') {
      return; // Don't toggle this filter directly
    }
    
    onFilterChange({
      ...activeFilters,
      [filterName]: !activeFilters[filterName]
    });
  };
  
  const clearFilters = () => {
    // Preserve the selectedUser when clearing other filters
    const selectedUser = activeFilters.selectedUser;
    onFilterChange(selectedUser ? { selectedUser } : {});
  };
  
  const hasFilters = Object.keys(activeFilters).some(key => 
    key !== 'selectedUser' && activeFilters[key as keyof CreatorFilter]
  );
  
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
        variant={activeFilters.hasTikTokUsername ? "default" : "outline"} 
        size="sm"
        onClick={() => toggleFilter('hasTikTokUsername')}
        className="flex items-center gap-1"
      >
        {activeFilters.hasTikTokUsername ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
        Usuario TikTok
      </Button>
      
      {hasFilters && (
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
