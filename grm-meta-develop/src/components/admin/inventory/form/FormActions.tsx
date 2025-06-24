
import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  isEditing: boolean;
  onCancel?: () => void;
}

export function FormActions({ isSubmitting, isEditing, onCancel }: FormActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full" />
            {isEditing ? "Actualizando..." : "Guardando..."}
          </>
        ) : (
          <>{isEditing ? "Actualizar Creador" : "Guardar Creador"}</>
        )}
      </Button>
    </div>
  );
}
