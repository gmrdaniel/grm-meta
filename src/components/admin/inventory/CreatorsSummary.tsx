import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Check, X, Calendar, Users, Clock, ArrowUp, ArrowDown, ListOrdered, Download } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { exportToCsv, formatExportData } from "./export-utils";

interface SummaryCreator {
  nombre: string;
  apellido: string;
  correo: string;
  usuario_tiktok: string;
  seguidores_tiktok: number;
  engagement: number;
  duration_average: number;
  date_last_post: number;
}

interface CreatorsSummaryProps {
  // Add props here if needed
}

export function CreatorsSummary({}: CreatorsSummaryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tiktokEligibleFilter, setTiktokEligibleFilter] = useState(false);
  const [sortByEligible, setSortByEligible] = useState<'asc' | 'desc' | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const fetchSummaryCreators = async () => {
    try {
      let query = supabase
        .from('summary_creator')
        .select('*');
      
      if (tiktokEligibleFilter) {
        query = query
          .gte('seguidores_tiktok', 100000)
          .gte('engagement', 4);
      }
      
      if (sortByEligible) {
        if (sortByEligible === 'desc') {
          query = query.order('seguidores_tiktok', { ascending: false }).order('engagement', { ascending: false });
        } else {
          query = query.order('seguidores_tiktok', { ascending: true }).order('engagement', { ascending: true });
        }
      } else {
        query = query.order('seguidores_tiktok', { ascending: false });
      }
      
      const { data, error } = await query
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      
      if (error) throw error;
      
      let countQuery = supabase
        .from('summary_creator')
        .select('*', { count: 'exact', head: true });
      
      if (tiktokEligibleFilter) {
        countQuery = countQuery
          .gte('seguidores_tiktok', 100000)
          .gte('engagement', 4);
      }
      
      const { count: totalCount, error: countError } = await countQuery;
        
      if (countError) throw countError;
      
      return {
        data: data as SummaryCreator[],
        count: totalCount || 0
      };
    } catch (error) {
      console.error('Error fetching summary creators:', error);
      throw error;
    }
  };
  
  const { data: creatorsData, isLoading, error, refetch } = useQuery({
    queryKey: ['summary-creators', currentPage, pageSize, tiktokEligibleFilter, sortByEligible],
    queryFn: fetchSummaryCreators
  });
  
  const creators = creatorsData?.data || [];
  const totalCount = creatorsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  const formatFollowers = (count?: number) => {
    if (count === undefined || count === null) return "N/A";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };
  
  const formatEngagement = (rate?: number) => {
    if (rate === undefined || rate === null) return "N/A";
    return `${rate.toFixed(2)}%`;
  };
  
  const formatDuration = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return format(new Date(timestamp * 1000), "MMM d, yyyy");
  };

  const isEligibleForTikTok = (creator: SummaryCreator) => {
    return creator.seguidores_tiktok >= 100000 && creator.engagement >= 4;
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };
  
  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value));
    setCurrentPage(1);
  };
  
  const toggleTiktokEligibleFilter = () => {
    setTiktokEligibleFilter(prev => !prev);
    setCurrentPage(1);
  };

  const toggleSortByEligible = () => {
    if (sortByEligible === null) {
      setSortByEligible('desc');
    } else if (sortByEligible === 'desc') {
      setSortByEligible('asc');
    } else {
      setSortByEligible(null);
    }
    setCurrentPage(1);
  };
  
  const exportEligibleCreators = async () => {
    setIsExporting(true);
    try {
      let query = supabase
        .from('summary_creator')
        .select('*')
        .gte('seguidores_tiktok', 100000)
        .gte('engagement', 4);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.info("No hay creadores elegibles para exportar");
        return;
      }
      
      const formattedData = formatExportData(data as SummaryCreator[]);
      exportToCsv(formattedData, "creadores_elegibles_tiktok");
      
      toast.success(`${data.length} creadores elegibles exportados correctamente`);
    } catch (error) {
      console.error('Error exporting eligible creators:', error);
      toast.error("Error al exportar creadores elegibles");
    } finally {
      setIsExporting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        Error al cargar los datos de creadores: {(error as Error).message}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold">Resumen de Creadores</h2>
          <p className="text-gray-500">Total: {totalCount} creadores</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-500">Resultados por página:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button 
              variant={sortByEligible !== null ? "default" : "outline"} 
              size="sm"
              onClick={toggleSortByEligible}
              className="flex items-center gap-1"
            >
              {sortByEligible === 'desc' && <ArrowDown className="h-4 w-4" />}
              {sortByEligible === 'asc' && <ArrowUp className="h-4 w-4" />}
              {sortByEligible === null && <ListOrdered className="h-4 w-4" />}
              Ordenar por elegibilidad
            </Button>
            
            <Button 
              variant={tiktokEligibleFilter ? "default" : "outline"} 
              size="sm"
              onClick={toggleTiktokEligibleFilter}
              className="flex items-center gap-1"
            >
              {tiktokEligibleFilter ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
              Elegible x TikTok
            </Button>
            
            {(tiktokEligibleFilter || sortByEligible !== null) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setTiktokEligibleFilter(false);
                  setSortByEligible(null);
                }}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportEligibleCreators}
            disabled={isExporting}
            className="flex items-center gap-1 self-end"
          >
            {isExporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Exportar Elegibles TikTok
          </Button>
        </div>
      </div>
      
      {creators.length === 0 ? (
        <div className="p-8 text-center text-gray-500 border rounded-md">
          No hay creadores que coincidan con los criterios seleccionados
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  <TableHead className="w-[250px]">Creador</TableHead>
                  <TableHead>TikTok</TableHead>
                  <TableHead>Seguidores</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Elegible x TikTok</TableHead>
                  <TableHead>Duración Prom.</TableHead>
                  <TableHead>Último Post</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creators.map((creator, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center font-medium">
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{creator.nombre} {creator.apellido}</div>
                        <div className="text-sm text-muted-foreground">{creator.correo}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {creator.usuario_tiktok ? (
                        <a 
                          href={`https://tiktok.com/@${creator.usuario_tiktok}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          @{creator.usuario_tiktok}
                        </a>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        {formatFollowers(creator.seguidores_tiktok)}
                      </div>
                    </TableCell>
                    <TableCell>{formatEngagement(creator.engagement)}</TableCell>
                    <TableCell>
                      {isEligibleForTikTok(creator) ? (
                        <Badge className="bg-green-500">Elegible</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">No elegible</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {formatDuration(creator.duration_average)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {formatDate(creator.date_last_post)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-end mt-4">
            {totalPages > 1 && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                
                <div className="flex items-center mx-2">
                  <span className="text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
