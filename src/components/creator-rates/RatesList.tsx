
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filters } from "./components/Filters";
import { RatesTable } from "./components/RatesTable";
import { useRatesData } from "./hooks/useRatesData";
import type { RatesListProps, FilterState } from "./types";

export function RatesList({ page: initialPage, itemsPerPage: initialItemsPerPage }: RatesListProps) {
  const [filters, setFilters] = useState<FilterState>({
    selectedPlatform: undefined,
    selectedPostType: undefined,
    priceRange: [0, 1000],
    page: initialPage,
    itemsPerPage: initialItemsPerPage
  });

  const { platforms, postTypes, rates, ratesLoading } = useRatesData(filters);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' && { page: 1 }) // Reset page when other filters change
    }));
  };

  const handleReset = () => {
    setFilters({
      selectedPlatform: undefined,
      selectedPostType: undefined,
      priceRange: [0, 1000],
      page: 1,
      itemsPerPage: initialItemsPerPage
    });
  };

  const totalPages = rates?.count ? Math.ceil(rates.count / filters.itemsPerPage) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarifas Existentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <Filters
            filters={filters}
            platforms={platforms}
            postTypes={postTypes}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />

          <RatesTable rates={rates?.data} />

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {rates?.count ? `Total: ${rates.count} resultados` : 'No hay resultados'}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('page', filters.page - 1)}
                disabled={filters.page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {filters.page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={filters.page >= totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
