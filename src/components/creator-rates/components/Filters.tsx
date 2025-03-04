
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { FilterState } from "../types";

interface FiltersProps {
  filters: FilterState;
  platforms?: { id: string; name: string; }[];
  postTypes?: { id: string; name: string; }[];
  countries?: { name: string; value: string; }[];
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onReset: () => void;
}

export function Filters({ filters, platforms, postTypes, countries, onFilterChange, onReset }: FiltersProps) {
  const { selectedPlatform, selectedPostType, selectedCountry, priceRange, itemsPerPage } = filters;

  return (
    <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Platform Filter */}
        <div className="space-y-2">
          <Label>Red Social</Label>
          <Select value={selectedPlatform} onValueChange={(value) => onFilterChange('selectedPlatform', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una red social" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {platforms?.map((platform) => (
                <SelectItem key={platform.id} value={platform.id}>
                  {platform.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Post Type Filter */}
        <div className="space-y-2">
          <Label>Tipo de Publicación</Label>
          <Select value={selectedPostType} onValueChange={(value) => onFilterChange('selectedPostType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {postTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country Filter */}
        <div className="space-y-2">
          <Label>País</Label>
          <Select value={selectedCountry} onValueChange={(value) => onFilterChange('selectedCountry', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un país" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {countries?.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Rango de Precios (USD)</Label>
          <div className="pt-2">
            <Slider
              value={priceRange}
              min={0}
              max={1000}
              step={10}
              onValueChange={(value: number[]) => onFilterChange('priceRange', [value[0], value[1]])}
            />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Results Per Page */}
        <div className="space-y-2">
          <Label>Resultados por página</Label>
          <Select 
            value={String(itemsPerPage)} 
            onValueChange={(value) => onFilterChange('itemsPerPage', Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona cantidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onReset}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Limpiar Filtros
        </Button>
      </div>
    </div>
  );
}
