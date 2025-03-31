
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreatorForm } from "@/components/admin/inventory/CreatorForm";
import { Creator } from "@/types/creator";
import { toast } from "sonner";

interface EditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  creator: Creator | null;
  onSuccess: () => void;
}

export function EditDialog({ isOpen, onOpenChange, creator, onSuccess }: EditDialogProps) {
  if (!creator) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Creador</DialogTitle>
          <DialogDescription>
            Actualiza los datos del creador seleccionado.
          </DialogDescription>
        </DialogHeader>
        <CreatorForm 
          initialData={creator} 
          onSuccess={() => {
            onOpenChange(false);
            onSuccess();
            toast.success("Creador actualizado correctamente");
          }} 
          onCancel={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
