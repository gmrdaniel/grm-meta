
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Check, ChevronsUpDown } from "lucide-react";
import { CreatorFilter } from "./types";
import { UserFilter } from "./UserFilter";
import { RadioUserFilter } from "./RadioUserFilter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              Filtros
              {activeFilterCount > 0 && (
                <Badge className="ml-1 bg-primary text-primary-foreground" variant="default">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronsUpDown className="h-4 w-4 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60">
            <DropdownMenuLabel>Filtros de Creadores</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              <DropdownMenuItem 
                onClick={() => toggleFilter('tiktokEligible')}
                className="flex items-center justify-between cursor-pointer"
              >
                TikTok Elegible
                {activeFilters.tiktokEligible && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => toggleFilter('hasTikTokUsername')}
                className="flex items-center justify-between cursor-pointer"
              >
                Usuario TikTok
                {activeFilters.hasTikTokUsername && <Check className="h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => toggleFilter('hasYouTubeUsername')}
                className="flex items-center justify-between cursor-pointer"
              >
                Usuario YouTube
                {activeFilters.hasYouTubeUsername && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              <DropdownMenuItem 
                onClick={() => toggleFilter('withoutEngagement')}
                className="flex items-center justify-between cursor-pointer"
              >
                Sin Engagement
                {activeFilters.withoutEngagement && <Check className="h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => toggleFilter('withoutVideos')}
                className="flex items-center justify-between cursor-pointer"
              >
                Sin Videos
                {activeFilters.withoutVideos && <Check className="h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => toggleFilter('withVideos')}
                className="flex items-center justify-between cursor-pointer"
              >
                Con Videos
                {activeFilters.withVideos && <Check className="h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => toggleFilter('withoutYouTube')}
                className="flex items-center justify-between cursor-pointer"
              >
                Sin YouTube
                {activeFilters.withoutYouTube && <Check className="h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => toggleFilter('withoutYouTubeEngagement')}
                className="flex items-center justify-between cursor-pointer"
              >
                Sin Engagement YT
                {activeFilters.withoutYouTubeEngagement && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            {hasFilters && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={clearFilters}
                  className="flex items-center gap-1 cursor-pointer text-destructive"
                >
                  <X className="h-4 w-4" />
                  Limpiar todos los filtros
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
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

      {/* User filter using radio buttons */}
      <RadioUserFilter 
        value={activeFilters.assignedToUser || null} 
        onChange={handleUserFilterChange} 
      />

      {hasFilters && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            // Skip rendering badge for assignedToUser as it's shown in the RadioUserFilter
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
          
          {/* Add badge for assignedToUser if it exists */}
          {activeFilters.assignedToUser && (
            <Badge 
              variant="secondary"
              className="flex items-center gap-1"
            >
              Usuario: {activeFilters.assignedToUser}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleUserFilterChange(null)} 
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
