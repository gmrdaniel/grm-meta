
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
  DropdownMenuLabel,
  DropdownMenuItem,
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
    
    if (newFilters[filterName] === true) {
      delete newFilters[filterName];
    } else {
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
              <DropdownMenuItem asChild>
                <button 
                  onClick={() => toggleFilter('tiktokEligible')}
                  className="flex w-full items-center justify-between cursor-pointer px-2 py-1.5 text-sm"
                >
                  TikTok Elegible
                  {activeFilters.tiktokEligible && <Check className="h-4 w-4" />}
                </button>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <button 
                  onClick={() => toggleFilter('hasTikTokUsername')}
                  className="flex w-full items-center justify-between cursor-pointer px-2 py-1.5 text-sm"
                >
                  Usuario TikTok
                  {activeFilters.hasTikTokUsername && <Check className="h-4 w-4" />}
                </button>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <button 
                  onClick={() => toggleFilter('hasYouTubeUsername')}
                  className="flex w-full items-center justify-between cursor-pointer px-2 py-1.5 text-sm"
                >
                  Usuario YouTube
                  {activeFilters.hasYouTubeUsername && <Check className="h-4 w-4" />}
                </button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <button 
                  onClick={() => toggleFilter('withoutEngagement')}
                  className="flex w-full items-center justify-between cursor-pointer px-2 py-1.5 text-sm"
                >
                  Sin Engagement
                  {activeFilters.withoutEngagement && <Check className="h-4 w-4" />}
                </button>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <button 
                  onClick={() => toggleFilter('withoutVideos')}
                  className="flex w-full items-center justify-between cursor-pointer px-2 py-1.5 text-sm"
                >
                  Sin Videos
                  {activeFilters.withoutVideos && <Check className="h-4 w-4" />}
                </button>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <button 
                  onClick={() => toggleFilter('withVideos')}
                  className="flex w-full items-center justify-between cursor-pointer px-2 py-1.5 text-sm"
                >
                  Con Videos
                  {activeFilters.withVideos && <Check className="h-4 w-4" />}
                </button>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <button 
                  onClick={() => toggleFilter('withoutYouTube')}
                  className="flex w-full items-center justify-between cursor-pointer px-2 py-1.5 text-sm"
                >
                  Sin YouTube
                  {activeFilters.withoutYouTube && <Check className="h-4 w-4" />}
                </button>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <button 
                  onClick={() => toggleFilter('withoutYouTubeEngagement')}
                  className="flex w-full items-center justify-between cursor-pointer px-2 py-1.5 text-sm"
                >
                  Sin Engagement YT
                  {activeFilters.withoutYouTubeEngagement && <Check className="h-4 w-4" />}
                </button>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <button 
                  onClick={() => toggleFilter('withoutTikTokFollowers')}
                  className="flex w-full items-center justify-between cursor-pointer px-2 py-1.5 text-sm"
                >
                  Sin seguidores TikTok
                  {activeFilters.withoutTikTokFollowers && <Check className="h-4 w-4" />}
                </button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            {hasFilters && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button 
                    onClick={clearFilters}
                    className="flex w-full items-center gap-1 cursor-pointer text-destructive px-2 py-1.5 text-sm"
                  >
                    <X className="h-4 w-4" />
                    Limpiar todos los filtros
                  </button>
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

      <RadioUserFilter 
        value={activeFilters.assignedToUser || null} 
        onChange={handleUserFilterChange} 
      />

      {hasFilters && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(activeFilters).map(([key, value]) => {
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
                {key === 'withoutTikTokFollowers' && 'Sin seguidores TikTok'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleFilter(key as keyof CreatorFilter)} 
                />
              </Badge>
            );
          })}
          
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
