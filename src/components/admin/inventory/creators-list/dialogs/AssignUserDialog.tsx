
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AssignUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (userName: string | null) => void;
  users: User[];
  creatorCount: number;
  loading: boolean;
}

export function AssignUserDialog({
  open,
  onOpenChange,
  onAssign,
  users,
  creatorCount,
  loading
}: AssignUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onClick={() => onAssign(null)}
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
                  onClick={() => onAssign(user.name)}
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
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
