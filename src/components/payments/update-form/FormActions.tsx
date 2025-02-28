
import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onClose: () => void;
  isSubmitting?: boolean;
}

export function FormActions({ onClose, isSubmitting }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-4">
      <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar Cambios"}
      </Button>
    </div>
  );
}
