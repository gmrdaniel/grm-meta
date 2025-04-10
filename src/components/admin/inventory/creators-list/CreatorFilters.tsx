
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreatorFilter } from "./types";
import { Badge } from "@/components/ui/badge";

interface CreatorFiltersProps {
  activeFilters: CreatorFilter;
  onFilterChange: (filters: CreatorFilter) => void;
}

export function CreatorFilters({ activeFilters, onFilterChange }: CreatorFiltersProps) {
  const handleFilterChange = (filterKey: keyof CreatorFilter) => {
    onFilterChange({
      ...activeFilters,
      [filterKey]: !activeFilters[filterKey],
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const activeFiltersCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filtros</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="flex items-center gap-2">
              <Checkbox 
                id="elegible-tiktok"
                checked={activeFilters.tiktokEligible || false}
                onCheckedChange={() => handleFilterChange('tiktokEligible')}
              />
              <Label htmlFor="elegible-tiktok" className="flex-1 cursor-pointer">
                Elegibles TikTok
              </Label>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Checkbox 
                id="has-tiktok"
                checked={activeFilters.hasTikTokUsername || false}
                onCheckedChange={() => handleFilterChange('hasTikTokUsername')}
              />
              <Label htmlFor="has-tiktok" className="flex-1 cursor-pointer">
                Con usuario TikTok
              </Label>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Checkbox 
                id="has-youtube"
                checked={activeFilters.hasYouTubeUsername || false}
                onCheckedChange={() => handleFilterChange('hasYouTubeUsername')}
              />
              <Label htmlFor="has-youtube" className="flex-1 cursor-pointer">
                Con usuario YouTube
              </Label>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Checkbox 
                id="without-engagement"
                checked={activeFilters.withoutEngagement || false}
                onCheckedChange={() => handleFilterChange('withoutEngagement')}
              />
              <Label htmlFor="without-engagement" className="flex-1 cursor-pointer">
                Sin engagement
              </Label>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Checkbox 
                id="without-videos"
                checked={activeFilters.withoutVideos || false}
                onCheckedChange={() => handleFilterChange('withoutVideos')}
              />
              <Label htmlFor="without-videos" className="flex-1 cursor-pointer">
                Sin videos descargados
              </Label>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Checkbox 
                id="without-youtube"
                checked={activeFilters.withoutYouTube || false}
                onCheckedChange={() => handleFilterChange('withoutYouTube')}
              />
              <Label htmlFor="without-youtube" className="flex-1 cursor-pointer">
                Sin datos YouTube
              </Label>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Checkbox 
                id="without-youtube-engagement"
                checked={activeFilters.withoutYouTubeEngagement || false}
                onCheckedChange={() => handleFilterChange('withoutYouTubeEngagement')}
              />
              <Label htmlFor="without-youtube-engagement" className="flex-1 cursor-pointer">
                Sin engagement YouTube
              </Label>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={clearFilters}
            disabled={activeFiltersCount === 0}
            className="justify-center text-center"
          >
            Limpiar filtros
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
