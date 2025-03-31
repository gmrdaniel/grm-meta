
import { useState, useEffect } from "react";
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
import { Filter, Check, X, Calendar, Users, Clock } from "lucide-react";
import { format } from "date-fns";

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
  
  const fetchSummaryCreators = async () => {
    try {
      let query = supabase
        .from('summary_creator')
        .select('*');
      
      // Apply TikTok eligibility filter if enabled
      if (tiktokEligibleFilter) {
        query = query.gte('seguidores_tiktok', 100000);
      }
      
      const { data, error, count } = await query
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)
        .order('seguidores_tiktok', { ascending: false });
      
      if (error) throw error;
      
      // Get total count for pagination
      const { count: totalCount, error: countError } = await supabase
        .from('summary_creator')
        .select('*', { count: 'exact', head: true });
        
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
    queryKey: ['summary-creators', currentPage, pageSize, tiktokEligibleFilter],
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
        Error al cargar los datos de creadores: {error.message}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold">Resumen de Creadores</h2>
          <p className="text-gray-500">Total: {totalCount} creadores</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={tiktokEligibleFilter ? "default" : "outline"} 
            size="sm"
            onClick={toggleTiktokEligibleFilter}
            className="flex items-center gap-1"
          >
            {tiktokEligibleFilter ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
            TikTok Elegible
          </Button>
          
          {tiktokEligibleFilter && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setTiktokEligibleFilter(false)}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
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
                  <TableHead className="w-[250px]">Creador</TableHead>
                  <TableHead>TikTok</TableHead>
                  <TableHead>Seguidores</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Duración Prom.</TableHead>
                  <TableHead>Último Post</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creators.map((creator, index) => (
                  <TableRow key={index}>
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
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
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
