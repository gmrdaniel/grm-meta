
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCreators } from "@/services/creatorService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Phone, ExternalLink, Mail, MoreHorizontal, Users } from "lucide-react";
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

export function CreatorsList() {
  const [editCreator, setEditCreator] = useState<Creator | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: allCreators = [], isLoading, error, refetch } = useQuery({
    queryKey: ["creators"],
    queryFn: fetchCreators,
  });

  // Calculate pagination
  const totalPages = Math.ceil(allCreators.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCreators = allCreators.slice(startIndex, startIndex + itemsPerPage);

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "N/A";
    }
  };

  // Format followers count
  const formatFollowers = (count?: number) => {
    if (count === undefined || count === null) return "N/A";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleEdit = (creator: Creator) => {
    setEditCreator(creator);
    setIsEditDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
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
                  <TableHead className="w-[300px]">Creador</TableHead>
                  <TableHead className="w-[250px]">Redes Sociales</TableHead>
                  <TableHead className="w-[180px]">Teléfono</TableHead>
                  <TableHead className="w-[150px]">Fecha</TableHead>
                  <TableHead className="w-[120px]">Estatus</TableHead>
                  <TableHead className="w-[100px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCreators.map((creator) => (
                  <TableRow key={creator.id}>
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
                          <div className="text-sm flex items-center gap-1">
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
                        {creator.usuario_youtube && (
                          <div className="text-sm flex items-center gap-1">
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
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(creator)}>
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
                  // Show current page, first, last, and pages around current
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
                  
                  // Show ellipsis for gaps
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
    </div>
  );
}
