
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Check } from "lucide-react";
import { CreatorFilter } from "./types";
import { UserFilter } from "./UserFilter";

interface CreatorFiltersProps {
  activeFilters: CreatorFilter;
  onFilterChange: (filters: CreatorFilter) => void;
}

export function CreatorFilters({ activeFilters, onFilterChange }: CreatorFiltersProps) {
  const toggleFilter = (filterName: keyof CreatorFilter) => {
    const newFilters = { ...activeFilters };
    
    // Check if the property exists and toggle it, or set it to true if it doesn't exist
    if (newFilters[filterName] === true) {
      delete newFilters[filterName];
    } else {
      // Only set boolean value for non-assignedToUser filters
      if (filterName !== 'assignedToUser') {
        newFilters[filterName] = true;
      }
    }
    
    onFilterChange(newFilters);
  };

  const handleUserFilterChange = (userId: string | null) => {
    const newFilters = { ...activeFilters };
    if (userId) {
      newFilters.assignedToUser = userId;
    } else {
      delete newFilters.assignedToUser;
    }
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="space-y-2">
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
          variant={activeFilters.hasYouTubeUsername ? "default" : "outline"} 
          size="sm"
          onClick={() => toggleFilter('hasYouTubeUsername')}
          className="flex items-center gap-1"
        >
          {activeFilters.hasYouTubeUsername ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          Usuario YouTube
        </Button>

        <Button 
          variant={activeFilters.withoutEngagement ? "default" : "outline"} 
          size="sm"
          onClick={() => toggleFilter('withoutEngagement')}
          className="flex items-center gap-1"
        >
          {activeFilters.withoutEngagement ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          Sin Engagement
        </Button>

        <Button 
          variant={activeFilters.withoutVideos ? "default" : "outline"} 
          size="sm"
          onClick={() => toggleFilter('withoutVideos')}
          className="flex items-center gap-1"
        >
          {activeFilters.withoutVideos ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          Sin Videos
        </Button>

        <Button 
          variant={activeFilters.withVideos ? "default" : "outline"} 
          size="sm"
          onClick={() => toggleFilter('withVideos')}
          className="flex items-center gap-1"
        >
          {activeFilters.withVideos ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          Con Videos
        </Button>

        <Button 
          variant={activeFilters.withoutYouTube ? "default" : "outline"} 
          size="sm"
          onClick={() => toggleFilter('withoutYouTube')}
          className="flex items-center gap-1"
        >
          {activeFilters.withoutYouTube ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          Sin YouTube
        </Button>

        <Button 
          variant={activeFilters.withoutYouTubeEngagement ? "default" : "outline"} 
          size="sm"
          onClick={() => toggleFilter('withoutYouTubeEngagement')}
          className="flex items-center gap-1"
        >
          {activeFilters.withoutYouTubeEngagement ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          Sin Engagement YT
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <UserFilter 
          value={activeFilters.assignedToUser || null} 
          onChange={handleUserFilterChange} 
        />
        
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

      {hasFilters && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            // Skip rendering badge for assignedToUser as it's shown in the dropdown
            if (key === 'assignedToUser') return null;
            
            return (
              <Badge 
                key={key} 
                variant="secondary"
                className="flex items-center gap-1"
              >
                {key === 'tiktokEligible' && 'TikTok Elegible'}
                {key === 'hasTikTokUsername' && 'Usuario TikTok'}
                {key === 'hasYouTubeUsername' && 'Usuario YouTube'}
                {key === 'withoutEngagement' && 'Sin Engagement'}
                {key === 'withoutVideos' && 'Sin Videos'}
                {key === 'withVideos' && 'Con Videos'}
                {key === 'withoutYouTube' && 'Sin YouTube'}
                {key === 'withoutYouTubeEngagement' && 'Sin Engagement YT'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleFilter(key as keyof CreatorFilter)} 
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
