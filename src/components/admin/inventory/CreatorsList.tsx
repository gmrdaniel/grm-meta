import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchCreators, updateCreator } from "@/services/creatorService";
import { fetchTikTokUserInfo, updateCreatorTikTokFollowers } from "@/services/tiktokVideoService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Phone, ExternalLink, Mail, MoreHorizontal, Users, Loader2 } from "lucide-react";
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
import { format } from "date-fns";

interface CreatorsListProps {
  onCreatorSelect?: (creator: Creator) => void;
}

export function CreatorsList({ onCreatorSelect }: CreatorsListProps) {
  const [editCreator, setEditCreator] = useState<Creator | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingTikTokInfo, setLoadingTikTokInfo] = useState<string | null>(null);
  const itemsPerPage = 10;

  const { data: allCreators = [], isLoading, error, refetch } = useQuery({
    queryKey: ["creators"],
    queryFn: fetchCreators,
  });

  const updateTikTokInfoMutation = useMutation({
    mutationFn: async ({ creatorId, username }: { creatorId: string; username: string }) => {
      const userInfo = await fetchTikTokUserInfo(username);
      const followerCount = userInfo.data?.stats?.followerCount;
      
      if (followerCount !== undefined) {
        await updateCreatorTikTokFollowers(creatorId, followerCount);
        return { followerCount };
      }
      throw new Error('No se pudo obtener el número de seguidores');
    },
    onSuccess: (data, variables) => {
      toast.success(`Información de TikTok actualizada correctamente. Seguidores: ${data.followerCount.toLocaleString()}`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error al obtener información de TikTok: ${(error as Error).message}`);
    },
    onSettled: () => {
      setLoadingTikTokInfo(null);
    }
  });

  const totalPages = Math.ceil(allCreators.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCreators = allCreators.slice(startIndex, startIndex + itemsPerPage);

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

  const handleFetchTikTokInfo = (creatorId: string, username: string) => {
    if (!username) {
      toast.error("Este creador no tiene un nombre de usuario de TikTok");
      return;
    }
    
    setLoadingTikTokInfo(creatorId);
    updateTikTokInfoMutation.mutate({ creatorId, username });
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
      <div>
        <h2 className="text-2xl font-bold">Lista de Creadores</h2>
        <p className="text-gray-500">Todos los creadores registrados en el sistema</p>
      </div>
      
      {allCreators.length === 0 ? (
        <div className="p-8 text-center text-gray-500 border rounded-md">
          No hay creadores registrados
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
                {paginatedCreators.map((creator) => (
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
                                className="flex items-center gap-1 text-blue-600 hover:underline">
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
                                variant="ghost" 
                                className="ml-1 h-6 px-2 text-xs"
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
