
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDirectRpc } from "../hooks/useDirectRpc";
import ErrorDisplay from "../ErrorDisplay";
import TestResultDisplay from "../TestResultDisplay";

export default function DirectRpcTab() {
  const {
    invitationCode,
    setInvitationCode,
    result,
    loading,
    error,
    handleDirectTest
  } = useDirectRpc();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Llamada Directa a RPC
          <Badge variant="outline" className="ml-2">find_invitation_by_code</Badge>
        </CardTitle>
        <CardDescription>
          Esta prueba llama directamente a la función RPC de Supabase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="directInvitationCode" className="block text-sm font-medium mb-1">
              Código de Invitación
            </label>
            <div className="flex gap-2">
              <Input 
                id="directInvitationCode" 
                placeholder="Ingrese el código" 
                value={invitationCode} 
                onChange={e => setInvitationCode(e.target.value)} 
              />
              <Button onClick={handleDirectTest} disabled={loading}>
                {loading ? "Procesando..." : "Llamar RPC"}
              </Button>
            </div>
            <ErrorDisplay error={error} />
          </div>

          <TestResultDisplay result={result} title="Resultado RPC" />
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Este panel permite probar directamente la función RPC find_invitation_by_code sin autenticación
      </CardFooter>
    </Card>
  );
}
