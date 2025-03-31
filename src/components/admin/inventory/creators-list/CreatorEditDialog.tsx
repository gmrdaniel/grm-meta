
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Creator } from "@/types/creator";
import { CreatorForm } from "../CreatorForm";
import { toast } from "sonner";

interface CreatorEditDialogProps {
  creator: Creator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreatorEditDialog({ creator, open, onOpenChange, onSuccess }: CreatorEditDialogProps) {
  if (!creator) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
