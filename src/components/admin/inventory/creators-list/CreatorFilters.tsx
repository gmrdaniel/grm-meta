
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Filter, Search, X, Calendar } from "lucide-react";
import { CreatorFilter } from "./types";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { format, isValid } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface CreatorFiltersProps {
  activeFilters: CreatorFilter;
  onFilterChange: (filters: CreatorFilter) => void;
}

export function CreatorFilters({ activeFilters, onFilterChange }: CreatorFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [emailSearch, setEmailSearch] = useState(activeFilters.email || "");
  const [dateFrom, setDateFrom] = useState<Date | null>(
    activeFilters.dateFrom ? new Date(activeFilters.dateFrom) : null
  );
  const [dateTo, setDateTo] = useState<Date | null>(
    activeFilters.dateTo ? new Date(activeFilters.dateTo) : null
  );

  const toggleFilter = (filterName: keyof CreatorFilter) => {
    const newFilters = { ...activeFilters };
    newFilters[filterName] = !activeFilters[filterName];
    
    if (!newFilters[filterName]) {
      delete newFilters[filterName];
    }
    
    onFilterChange(newFilters);
  };

  const handleEmailSearch = () => {
    const newFilters = { ...activeFilters };
    
    if (emailSearch.trim()) {
      newFilters.email = emailSearch.trim();
    } else {
      delete newFilters.email;
    }
    
    onFilterChange(newFilters);
    setIsOpen(false);
  };

  const handleDateFilter = () => {
    const newFilters = { ...activeFilters };
    
    if (dateFrom && isValid(dateFrom)) {
      newFilters.dateFrom = format(dateFrom, "yyyy-MM-dd");
    } else {
      delete newFilters.dateFrom;
    }
    
    if (dateTo && isValid(dateTo)) {
      newFilters.dateTo = format(dateTo, "yyyy-MM-dd");
    } else {
      delete newFilters.dateTo;
    }
    
    onFilterChange(newFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    onFilterChange({});
    setEmailSearch("");
    setDateFrom(null);
    setDateTo(null);
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="flex gap-2 items-center">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && <Badge variant="secondary" className="ml-1">{Object.keys(activeFilters).length}</Badge>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <h4 className="font-medium">Filtros de creadores</h4>
            <Separator />
            
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Buscar por correo</h5>
              <div className="flex gap-2">
                <Input 
                  placeholder="Correo electrónico" 
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleEmailSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Rango de fechas</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm w-16">Desde:</span>
                  <DatePicker value={dateFrom} onChange={setDateFrom} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm w-16">Hasta:</span>
                  <DatePicker value={dateTo} onChange={setDateTo} />
                </div>
                <Button size="sm" className="w-full mt-1" onClick={handleDateFilter}>
                  Aplicar filtro de fechas
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Filtros de TikTok</h5>
              <div className="space-y-1">
                <Button 
                  variant={activeFilters.tiktokEligible ? "default" : "outline"} 
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => toggleFilter('tiktokEligible')}
                >
                  {activeFilters.tiktokEligible ? <Check className="h-4 w-4 mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
                  TikTok Elegible
                </Button>
                
                <Button 
                  variant={activeFilters.hasTikTokUsername ? "default" : "outline"} 
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => toggleFilter('hasTikTokUsername')}
                >
                  {activeFilters.hasTikTokUsername ? <Check className="h-4 w-4 mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
                  Usuario TikTok
                </Button>
                
                <Button 
                  variant={activeFilters.withoutEngagement ? "default" : "outline"} 
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => toggleFilter('withoutEngagement')}
                >
                  {activeFilters.withoutEngagement ? <Check className="h-4 w-4 mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
                  Sin Engagement
                </Button>
                
                <Button 
                  variant={activeFilters.withoutVideos ? "default" : "outline"} 
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => toggleFilter('withoutVideos')}
                >
                  {activeFilters.withoutVideos ? <Check className="h-4 w-4 mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
                  Sin Videos
                </Button>
                
                <Button 
                  variant={activeFilters.withVideos ? "default" : "outline"} 
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => toggleFilter('withVideos')}
                >
                  {activeFilters.withVideos ? <Check className="h-4 w-4 mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
                  Con Videos
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center gap-1">
                <X className="h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
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
