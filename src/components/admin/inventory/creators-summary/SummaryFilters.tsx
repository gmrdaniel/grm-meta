
import { Button } from "@/components/ui/button";
import { X, ArrowUpDown, CheckCircle2, Youtube } from "lucide-react";

interface SummaryFiltersProps {
  tiktokEligibleFilter: boolean;
  youtubeEligibleFilter: boolean;
  sortByEligible: 'asc' | 'desc' | null;
  onToggleTiktokEligibleFilter: () => void;
  onToggleYoutubeEligibleFilter: () => void;
  onToggleSortByEligible: () => void;
  onClearFilters: () => void;
}

export function SummaryFilters({
  tiktokEligibleFilter,
  youtubeEligibleFilter,
  sortByEligible,
  onToggleTiktokEligibleFilter,
  onToggleYoutubeEligibleFilter,
  onToggleSortByEligible,
  onClearFilters
}: SummaryFiltersProps) {
  const hasActiveFilters = tiktokEligibleFilter || youtubeEligibleFilter || sortByEligible !== null;
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={tiktokEligibleFilter ? "default" : "outline"}
        size="sm"
        onClick={onToggleTiktokEligibleFilter}
        className="flex items-center gap-1"
      >
        <svg 
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
        TikTok Elegible
      </Button>

      <Button
        variant={youtubeEligibleFilter ? "default" : "outline"}
        size="sm"
        onClick={onToggleYoutubeEligibleFilter}
        className="flex items-center gap-1"
        title="Seguidores > 100.000 y Engagement > 4%"
      >
        <Youtube className="h-4 w-4" />
        YouTube Elegible
      </Button>
      
      <Button
        variant={sortByEligible ? "default" : "outline"}
        size="sm"
        onClick={onToggleSortByEligible}
        className="flex items-center gap-1"
      >
        <ArrowUpDown className="h-4 w-4" />
        {sortByEligible === 'desc' ? 'Mayor a menor' : sortByEligible === 'asc' ? 'Menor a mayor' : 'Ordenar por popularidad'}
      </Button>
      
      {hasActiveFilters && (
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
  );
}
