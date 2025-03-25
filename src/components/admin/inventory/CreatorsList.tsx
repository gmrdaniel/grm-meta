import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchCreators, updateCreator } from "@/services/creatorService";
import { 
  fetchTikTokUserInfo, 
  updateCreatorTikTokInfo, 
  fetchAndSaveTikTokPosts 
} from "@/services/tiktokVideoService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Pencil, Phone, ExternalLink, Mail, MoreHorizontal, 
  Users, Loader2, Filter, X, Check, BarChart 
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreatorForm } from "./CreatorForm";
import { Creator } from "@/types/creator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CreatorFilter } from "../inventory/import-templates/types";

interface CreatorsListProps {
  onCreatorSelect?: (creator: Creator) => void;
  filters?: CreatorFilter;
  onFilterChange?: (filters: CreatorFilter) => void;
}

export function CreatorsList({ 
  onCreatorSelect, 
  filters = {}, 
  onFilterChange 
}: CreatorsListProps) {
  const [editCreator, setEditCreator] = useState<Creator | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingTikTokInfo, setLoadingTikTokInfo] = useState<string | null>(null);
  const [loadingTikTokEngagement, setLoadingTikTokEngagement] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [activeFilters, setActiveFilters] = useState<CreatorFilter>(filters);

  const { 
    data: creatorsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["creators", currentPage, pageSize, activeFilters],
    queryFn: () => fetchCreators(currentPage, pageSize, activeFilters),
  });

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(activeFilters);
    }
    setCurrentPage(1);
  }, [activeFilters, onFilterChange]);

  const creators = creatorsData?.data || [];
  const totalCount = creatorsData?.count || 0;

  const updateTikTokInfoMutation = useMutation({
    mutationFn: async ({ creatorId, username }: { creatorId: string; username: string }) => {
      const userInfo = await fetchTikTokUserInfo(username);
      
      console.log('Processing TikTok user info result:', userInfo);
      
      const followerCount = userInfo?.userInfo?.stats?.followerCount;
      const secUid = userInfo?.userInfo?.user?.secUid;
      
      console.log('Extracted follower count:', followerCount);
      console.log('Extracted secUid:', secUid);
      
      if (followerCount !== undefined) {
        await updateCreatorTikTokInfo(creatorId, followerCount, secUid);
        
        const isEligible = followerCount >= 100000;
        return { followerCount, isEligible, secUid };
      }
      
      throw new Error('No se pudo obtener el número de seguidores');
    },
    onSuccess: (data, variables) => {
      const eligibilityStatus = data.isEligible ? 'elegible' : 'no elegible';
      toast.success(`Información de TikTok actualizada. Seguidores: ${data.followerCount.toLocaleString()} (${eligibilityStatus})`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error al obtener información de TikTok: ${(error as Error).message}`);
    },
    onSettled: () => {
      setLoadingTikTokInfo(null);
    }
  });

  const updateTikTokEngagementMutation = useMutation({
    mutationFn: async ({ creatorId, secUid }: { creatorId: string; secUid: string }) => {
      if (!secUid) {
        throw new Error('Este creador no tiene un secUid de TikTok. Por favor, actualiza primero la información de TikTok.');
      }
      
      const result = await fetchAndSaveTikTokPosts(creatorId, secUid);
      return result;
    },
    onSuccess: (data) => {
      toast.success(`Videos procesados: ${data.savedCount}/${data.totalVideos}`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error al obtener videos de TikTok: ${(error as Error).message}`);
    },
    onSettled: () => {
      setLoadingTikTokEngagement(null);
    }
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "N/A";
    }
  };

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

  const handleEdit = (creator: Creator) => {
    if (onCreatorSelect) {
      onCreatorSelect(creator);
    } else {
      setEditCreator(creator);
      setIsEditDialogOpen(true);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value));
    setCurrentPage(1);
  };

  const handleFetchTikTokInfo = (creatorId: string, username: string) => {
    if (!username) {
      toast.error("Este creador no tiene un nombre de usuario de TikTok");
      return;
    }
    
    setLoadingTikTokInfo(creatorId);
    updateTikTokInfoMutation.mutate({ creatorId, username });
  };

  const handleFetchTikTokEngagement = (creatorId: string, secUid: string) => {
    if (!secUid) {
      toast.error("Este creador no tiene un secUid de TikTok. Por favor, actualiza primero la información de TikTok.");
      return;
    }
    
    setLoadingTikTokEngagement(creatorId);
    updateTikTokEngagementMutation.mutate({ creatorId, secUid });
  };

  const toggleFilter = (filterName: keyof CreatorFilter) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      newFilters[filterName] = !prev[filterName];
      
      if (!newFilters[filterName]) {
        delete newFilters[filterName];
      }
      
      return newFilters;
    });
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
        Error al cargar los creadores: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Lista de Creadores</h2>
          <p className="text-gray-500">Total: {totalCount} creadores</p>
        </div>
        
        <div className="flex gap-2">
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
            variant={activeFilters.hasTiktokUsername ? "default" : "outline"} 
            size="sm"
            onClick={() => toggleFilter('hasTiktokUsername')}
            className="flex items-center gap-1"
          >
            {activeFilters.hasTiktokUsername ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
            Usuario TikTok
          </Button>
          
          {(activeFilters.tiktokEligible || activeFilters.hasTiktokUsername) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setActiveFilters({})}
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Creador</TableHead>
                  <TableHead className="w-[300px]">Redes Sociales</TableHead>
                  <TableHead className="w-[180px]">Teléfono</TableHead>
                  <TableHead className="w-[150px]">Fecha</TableHead>
                  <TableHead className="w-[120px]">Estatus</TableHead>
                  <TableHead className="w-[120px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creators.map((creator) => (
                  <TableRow 
                    key={creator.id}
                    className={onCreatorSelect ? "cursor-pointer hover:bg-gray-100" : undefined}
                    onClick={onCreatorSelect ? () => onCreatorSelect(creator) : undefined}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                          {getInitials(creator.nombre, creator.apellido)}
                        </div>
                        <div>
                          <div className="font-medium">{creator.nombre} {creator.apellido}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {creator.correo}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {creator.usuario_tiktok && (
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">TikTok:</span> 
                              <a href={`https://tiktok.com/@${creator.usuario_tiktok}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                @{creator.usuario_tiktok}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                              {creator.seguidores_tiktok && (
                                <span className="ml-2 flex items-center text-gray-500 text-xs">
                                  <Users className="h-3 w-3 mr-1" /> {formatFollowers(creator.seguidores_tiktok)}
                                </span>
                              )}
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                className="ml-1 h-6 rounded-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFetchTikTokInfo(creator.id, creator.usuario_tiktok || '');
                                }}
                                disabled={loadingTikTokInfo === creator.id}
                              >
                                {loadingTikTokInfo === creator.id ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <svg 
                                    viewBox="0 0 24 24"
                                    className="h-3 w-3 mr-1"
                                    fill="currentColor"
                                  >
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                  </svg>
                                )}
                                TikTok info
                              </Button>
                              
                              {creator.secuid_tiktok && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="ml-1 h-6 rounded-md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFetchTikTokEngagement(creator.id, creator.secuid_tiktok || '');
                                  }}
                                  disabled={loadingTikTokEngagement === creator.id}
                                >
                                  {loadingTikTokEngagement === creator.id ? (
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  ) : (
                                    <BarChart className="h-3 w-3 mr-1" />
                                  )}
                                  TikTok engagement
                                </Button>
                              )}
                            </div>
                            <div className="flex gap-3 mt-1 text-xs">
                              <span className={`flex items-center ${creator.elegible_tiktok ? 'text-green-500' : 'text-gray-400'}`}>
                                {creator.elegible_tiktok ? 'Elegible' : 'No elegible'}
                              </span>
                              {creator.engagement_tiktok && (
                                <span className="flex items-center text-gray-500">
                                  Engagement: {formatEngagement(creator.engagement_tiktok)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {creator.usuario_youtube && (
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">YouTube:</span> 
                              <a href={`https://youtube.com/@${creator.usuario_youtube}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:underline">
                                @{creator.usuario_youtube}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                              {creator.seguidores_youtube && (
                                <span className="ml-2 flex items-center text-gray-500 text-xs">
                                  <Users className="h-3 w-3 mr-1" /> {formatFollowers(creator.seguidores_youtube)}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-3 mt-1 text-xs">
                              <span className={`flex items-center ${creator.elegible_youtube ? 'text-green-500' : 'text-gray-400'}`}>
                                {creator.elegible_youtube ? 'Elegible' : 'No elegible'}
                              </span>
                              {creator.engagement_youtube && (
                                <span className="flex items-center text-gray-500">
                                  Engagement: {formatEngagement(creator.engagement_youtube)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {creator.usuario_pinterest && (
                          <div className="text-sm flex items-center gap-1">
                            <span className="font-medium">Pinterest:</span> 
                            <a href={`https://pinterest.com/${creator.usuario_pinterest}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline">
                              @{creator.usuario_pinterest}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            {creator.seguidores_pinterest && (
                              <span className="ml-2 flex items-center text-gray-500 text-xs">
                                <Users className="h-3 w-3 mr-1" /> {formatFollowers(creator.seguidores_pinterest)}
                              </span>
                            )}
                          </div>
                        )}
                        {creator.page_facebook && (
                          <div className="text-sm flex items-center gap-1">
                            <span className="font-medium">Facebook:</span> 
                            <a href={creator.page_facebook} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline">
                              Página
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                        {!creator.usuario_tiktok && !creator.usuario_pinterest && !creator.usuario_youtube && !creator.page_facebook && (
                          <span className="text-sm text-gray-500">Sin redes sociales</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {creator.telefono ? (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-gray-500" /> 
                          {creator.lada_telefono && `+${creator.lada_telefono} `}
                          {creator.telefono}
                        </div>
                      ) : (
                        <span className="text-gray-500">No disponible</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(creator.fecha_creacion)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          creator.estatus === "activo"
                            ? "default"
                            : creator.estatus === "inactivo"
                            ? "destructive"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {creator.estatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              if (onCreatorSelect) {
                                e.stopPropagation();
                              }
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              if (onCreatorSelect) {
                                e.stopPropagation();
                              }
                              handleEdit(creator);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
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
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 || 
                      page === totalPages || 
                      page === currentPage || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            isActive={page === currentPage}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    
                    if (
                      (page === 2 && currentPage > 3) || 
                      (page === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <span className="flex h-9 w-9 items-center justify-center">...</span>
                        </PaginationItem>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </>
      )}

      {!onCreatorSelect && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Creador</DialogTitle>
              <DialogDescription>
                Actualiza los datos del creador seleccionado.
              </DialogDescription>
            </DialogHeader>
            {editCreator && (
              <CreatorForm 
                initialData={editCreator} 
                onSuccess={() => {
                  setIsEditDialogOpen(false);
                  refetch();
                  toast.success("Creador actualizado correctamente");
                }} 
                onCancel={() => setIsEditDialogOpen(false)} 
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
