
import { Button } from "@/components/ui/button";
import { Filter, X, Check, BarChart2, Video } from "lucide-react";
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
    <div className="flex flex-wrap gap-2">
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
        variant={activeFilters.withoutEngagement ? "default" : "outline"} 
        size="sm"
        onClick={() => toggleFilter('withoutEngagement')}
        className="flex items-center gap-1"
      >
        {activeFilters.withoutEngagement ? <Check className="h-4 w-4" /> : <BarChart2 className="h-4 w-4" />}
        Sin Engagement
      </Button>
      
      <Button 
        variant={activeFilters.withoutVideos ? "default" : "outline"} 
        size="sm"
        onClick={() => toggleFilter('withoutVideos')}
        className="flex items-center gap-1"
      >
        {activeFilters.withoutVideos ? <Check className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        Sin Videos
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
