
import { useState } from "react";
import { Creator } from "@/types/creator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, UserPlus, X } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchAdminUsers, batchAssignCreatorsToUser } from "@/services/creatorService";

interface CreatorBatchActionsProps {
  selectedCreators: Creator[];
  onSuccess: () => void;
  clearSelection: () => void;
}

export function CreatorBatchActions({ 
  selectedCreators, 
  onSuccess, 
  clearSelection 
}: CreatorBatchActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  
  const creatorCount = selectedCreators.length;

  if (creatorCount === 0) {
    return null;
  }

  const handleBatchDelete = async () => {
    // Implementation for batch deletion would go here
    toast.success(`${creatorCount} creadores eliminados`);
    onSuccess();
    clearSelection();
    setIsDeleteDialogOpen(false);
  };

  const openAssignDialog = async () => {
    try {
      setLoading(true);
      const adminUsers = await fetchAdminUsers();
      setUsers(adminUsers);
      setIsAssignDialogOpen(true);
    } catch (error) {
      console.error("Error loading admin users:", error);
      toast.error("Error al cargar los usuarios administradores");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAssign = async (userName: string | null) => {
    try {
      setLoading(true);
      const creatorIds = selectedCreators.map(creator => creator.id);
      await batchAssignCreatorsToUser(creatorIds, userName);
      
      toast.success(
        userName 
          ? `${creatorCount} creadores asignados a ${userName}` 
          : `Se eliminó la asignación de ${creatorCount} creadores`
      );
      
      onSuccess();
      clearSelection();
      setIsAssignDialogOpen(false);
    } catch (error) {
      console.error("Error assigning creators:", error);
      toast.error("Error al asignar creadores");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 my-4 p-2 bg-muted/50 rounded-md">
      <span className="text-sm font-medium mr-2">
        {creatorCount} creadores seleccionados
      </span>
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={openAssignDialog}
        disabled={loading}
      >
        <UserPlus className="h-4 w-4" />
        Asignar usuario
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 text-destructive"
        onClick={() => setIsDeleteDialogOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        Eliminar
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={clearSelection}
      >
        Limpiar selección
      </Button>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar creadores</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar {creatorCount} creadores? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleBatchDelete}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign user dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar usuario</DialogTitle>
            <DialogDescription>
              Selecciona un usuario para asignar a los {creatorCount} creadores seleccionados.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Usuarios disponibles</h3>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  key="unassigned"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleBatchAssign(null)}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                  Sin asignar
                </Button>
                
                {users.map(user => (
                  <Button
                    key={user.id}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleBatchAssign(user.name)}
                    disabled={loading}
                  >
                    <UserPlus className="h-4 w-4" />
                    {user.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
