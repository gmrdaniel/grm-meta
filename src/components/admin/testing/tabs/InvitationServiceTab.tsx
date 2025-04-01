
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useInvitationService } from "../hooks/useInvitationService";
import ErrorDisplay from "../ErrorDisplay";
import TestResultDisplay from "../TestResultDisplay";

export default function InvitationServiceTab() {
  const { 
    invitationCode, 
    setInvitationCode, 
    result, 
    loading, 
    error, 
    handleTestService 
  } = useInvitationService();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Prueba del Servicio de Invitaciones
          <Badge variant="outline" className="ml-2">fetchInvitationByCode</Badge>
        </CardTitle>
        <CardDescription>
          Esta prueba utiliza la función del servicio que internamente usa el RPC
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="invitationCode" className="block text-sm font-medium mb-1">
              Código de Invitación
            </label>
            <div className="flex gap-2">
              <Input 
                id="invitationCode" 
                placeholder="Ingrese el código" 
                value={invitationCode} 
                onChange={e => setInvitationCode(e.target.value)} 
              />
              <Button onClick={handleTestService} disabled={loading}>
                {loading ? "Procesando..." : "Probar Servicio"}
              </Button>
            </div>
            <ErrorDisplay error={error} />
          </div>

          <TestResultDisplay result={result} title="Resultado" />
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Este panel permite probar el servicio fetchInvitationByCode sin autenticación
      </CardFooter>
    </Card>
  );
}
