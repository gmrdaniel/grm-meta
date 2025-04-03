
import { ArrowDown, ArrowUp, Check, Filter, ListOrdered, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SummaryFiltersProps {
  tiktokEligibleFilter: boolean;
  youtubeEligibleFilter: boolean;
  tiktokOrYoutubeEligibleFilter: boolean;
  sortByEligible: 'asc' | 'desc' | null;
  onToggleTiktokEligibleFilter: () => void;
  onToggleYoutubeEligibleFilter: () => void;
  onToggleTiktokOrYoutubeEligibleFilter: () => void;
  onToggleSortByEligible: () => void;
  onClearFilters: () => void;
}

export function SummaryFilters({
  tiktokEligibleFilter,
  youtubeEligibleFilter,
  tiktokOrYoutubeEligibleFilter,
  sortByEligible,
  onToggleTiktokEligibleFilter,
  onToggleYoutubeEligibleFilter,
  onToggleTiktokOrYoutubeEligibleFilter,
  onToggleSortByEligible,
  onClearFilters
}: SummaryFiltersProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={sortByEligible !== null ? "default" : "outline"} 
          size="sm"
          onClick={onToggleSortByEligible}
          className="flex items-center gap-1"
        >
          {sortByEligible === 'desc' && <ArrowDown className="h-4 w-4" />}
          {sortByEligible === 'asc' && <ArrowUp className="h-4 w-4" />}
          {sortByEligible === null && <ListOrdered className="h-4 w-4" />}
          Ordenar por elegibilidad
        </Button>
        
        <Button 
          variant={tiktokEligibleFilter ? "default" : "outline"} 
          size="sm"
          onClick={onToggleTiktokEligibleFilter}
          className="flex items-center gap-1"
        >
          {tiktokEligibleFilter ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          Elegible x TikTok
        </Button>

        <Button 
          variant={youtubeEligibleFilter ? "default" : "outline"} 
          size="sm"
          onClick={onToggleYoutubeEligibleFilter}
          className="flex items-center gap-1"
        >
          {youtubeEligibleFilter ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          Elegible x YouTube
        </Button>

        <Button 
          variant={tiktokOrYoutubeEligibleFilter ? "default" : "outline"} 
          size="sm"
          onClick={onToggleTiktokOrYoutubeEligibleFilter}
          className="flex items-center gap-1"
        >
          {tiktokOrYoutubeEligibleFilter ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          Elegible x TikTok o YouTube
        </Button>
        
        {(tiktokEligibleFilter || youtubeEligibleFilter || tiktokOrYoutubeEligibleFilter || sortByEligible !== null) && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
