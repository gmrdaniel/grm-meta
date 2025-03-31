
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCreatorsSummary, SummaryCreator } from "@/services/summaryCreatorService";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RefreshCw, Filter, ArrowUp, ArrowDown } from "lucide-react";
import FechaDesdeTimestamp from "@/components/admin/test/FechaDesdeTimestamp";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type SortField = 'engagement' | 'seguidores_tiktok' | 'eligible';
type SortDirection = 'asc' | 'desc';

export function CreatorsSummary() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterEligible, setFilterEligible] = useState(false);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["creators-summary", page, pageSize, filterEligible],
    queryFn: () => fetchCreatorsSummary(page, pageSize, filterEligible),
  });

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (data && page < Math.ceil(data.count / pageSize)) {
      setPage(page + 1);
    }
  };

  const isEligible = (followers: number | null, engagement: number | null) => {
    if (!followers || !engagement) return false;
    return followers > 100000 && engagement > 4;
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPage(1); // Reset to first page when changing page size
  };

  const handleFilterChange = (checked: boolean) => {
    setFilterEligible(checked);
    setPage(1); // Reset to first page when changing filter
  };
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort direction if already sorting by this field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending order
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const getSortedData = () => {
    if (!data || !data.data || !sortField) return data?.data;
    
    return [...data.data].sort((a, b) => {
      if (sortField === 'engagement') {
        const valueA = a.engagement || 0;
        const valueB = b.engagement || 0;
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      if (sortField === 'seguidores_tiktok') {
        const valueA = a.seguidores_tiktok || 0;
        const valueB = b.seguidores_tiktok || 0;
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      if (sortField === 'eligible') {
        const valueA = isEligible(a.seguidores_tiktok, a.engagement) ? 1 : 0;
        const valueB = isEligible(b.seguidores_tiktok, b.engagement) ? 1 : 0;
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      return 0;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
        <p className="text-red-700">Error al cargar los datos: {error instanceof Error ? error.message : "Error desconocido"}</p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
          <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
        </Button>
      </div>
    );
  }

  const sortedData = getSortedData();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Resumen de Creadores TikTok</h2>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" /> Actualizar
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="filter-eligible" 
              checked={filterEligible} 
              onCheckedChange={handleFilterChange}
            />
            <label htmlFor="filter-eligible" className="text-sm font-medium">
              Solo mostrar TikTok elegibles
            </label>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Mostrar</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500">por página</span>
        </div>
      </div>

      <div className="bg-white rounded-md shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Usuario TikTok</TableHead>
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('seguidores_tiktok')}
              >
                <div className="flex items-center justify-end">
                  Seguidores
                  {renderSortIcon('seguidores_tiktok')}
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('engagement')}
              >
                <div className="flex items-center justify-end">
                  Engagement
                  {renderSortIcon('engagement')}
                </div>
              </TableHead>
              <TableHead>Último Post</TableHead>
              <TableHead className="text-right">Duración Promedio</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('eligible')}
              >
                <div className="flex items-center">
                  Elegible
                  {renderSortIcon('eligible')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData && sortedData.length > 0 ? (
              sortedData.map((creator, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {creator.nombre} {creator.apellido}
                  </TableCell>
                  <TableCell>{creator.correo}</TableCell>
                  <TableCell>{creator.usuario_tiktok || "-"}</TableCell>
                  <TableCell className="text-right">
                    {creator.seguidores_tiktok?.toLocaleString() || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {creator.engagement ? `${creator.engagement.toFixed(2)}%` : "-"}
                  </TableCell>
                  <TableCell>
                    {creator.date_last_post ? (
                      <FechaDesdeTimestamp timestamp={creator.date_last_post} />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {creator.duration_average ? `${creator.duration_average.toFixed(1)}s` : "-"}
                  </TableCell>
                  <TableCell>
                    {isEligible(creator.seguidores_tiktok, creator.engagement) ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">Elegible</Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-500 border-red-500">No Elegible</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No hay datos disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {data ? `Mostrando ${Math.min((page - 1) * pageSize + 1, data.count)} - ${Math.min(page * pageSize, data.count)} de ${data.count} resultados` : ""}
        </div>
        <Pagination>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={page <= 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!data || page >= Math.ceil(data.count / pageSize)}
          >
            Siguiente <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Pagination>
      </div>
    </div>
  );
}
