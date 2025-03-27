
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

export function ServiceAlert() {
  return (
    <Alert className="mb-6 border-green-500 bg-green-50">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <AlertTitle>Servicio Público Configurado</AlertTitle>
      <AlertDescription>
        El servicio de consulta de invitaciones está configurado para acceso público sin autenticación.
        Las pruebas a continuación pueden ejecutarse sin necesidad de iniciar sesión.
      </AlertDescription>
    </Alert>
  );
}
