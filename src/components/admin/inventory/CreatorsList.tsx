
import { useQuery } from "@tanstack/react-query";
import { fetchCreators } from "@/services/creatorService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreatorForm } from "./CreatorForm";
import { Creator } from "@/types/creator";

export function CreatorsList() {
  const [editCreator, setEditCreator] = useState<Creator | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: creators = [], isLoading, error, refetch } = useQuery({
    queryKey: ["creators"],
    queryFn: fetchCreators,
  });

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

  const handleEdit = (creator: Creator) => {
    setEditCreator(creator);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Lista de Creadores ({creators.length})</h2>
      
      {creators.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No hay creadores registrados
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators.map((creator) => (
            <Card key={creator.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium">
                      {creator.nombre} {creator.apellido}
                    </h3>
                    <Badge
                      variant={
                        creator.estatus === "activo"
                          ? "default"
                          : creator.estatus === "inactivo"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {creator.estatus}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm mb-4">
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Email:</span> {creator.correo}
                    </p>
                    {creator.telefono && (
                      <p className="flex items-center">
                        <span className="font-medium mr-2">Teléfono:</span>
                        {creator.lada_telefono && `+${creator.lada_telefono} `}
                        {creator.telefono}
                      </p>
                    )}
                    {creator.usuario_tiktok && (
                      <p className="flex items-center">
                        <span className="font-medium mr-2">TikTok:</span> {creator.usuario_tiktok}
                      </p>
                    )}
                    {creator.usuario_pinterest && (
                      <p className="flex items-center">
                        <span className="font-medium mr-2">Pinterest:</span> {creator.usuario_pinterest}
                      </p>
                    )}
                    {creator.page_facebook && (
                      <p className="flex items-center">
                        <span className="font-medium mr-2">Facebook:</span> {creator.page_facebook}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(creator)}
                    >
                      <Pencil size={16} className="mr-1" /> Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
