
import { Button } from "@/components/ui/button";
import { Check, Filter, X, Ban, VideoOff } from "lucide-react";
import { FilterBarProps } from "./types";

export function FilterBar({ activeFilters, toggleFilter, clearFilters }: FilterBarProps) {
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
        variant={activeFilters.hasTiktokUsername ? "default" : "outline"} 
        size="sm"
        onClick={() => toggleFilter('hasTiktokUsername')}
        className="flex items-center gap-1"
      >
        {activeFilters.hasTiktokUsername ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
        Usuario TikTok
      </Button>
      
      <Button 
        variant={activeFilters.noEngagement ? "default" : "outline"} 
        size="sm"
        onClick={() => toggleFilter('noEngagement')}
        className="flex items-center gap-1"
      >
        {activeFilters.noEngagement ? <Check className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
        Sin Engagement
      </Button>
      
      <Button 
        variant={activeFilters.noVideos ? "default" : "outline"} 
        size="sm"
        onClick={() => toggleFilter('noVideos')}
        className="flex items-center gap-1"
      >
        {activeFilters.noVideos ? <Check className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        Sin Videos
      </Button>
      
      {Object.keys(activeFilters).length > 0 && (
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
