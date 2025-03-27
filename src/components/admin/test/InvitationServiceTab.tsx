
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { fetchInvitationByCode } from "@/services/invitationService";

export function InvitationServiceTab() {
  const [invitationCode, setInvitationCode] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTestService = async () => {
    if (!invitationCode.trim()) {
      setError("Por favor ingrese un código de invitación");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const invitation = await fetchInvitationByCode(invitationCode);
      setResult({
        invitation,
        success: true,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      console.error("Error testing invitation service:", err);
      setError("Error al consultar el servicio: " + (err instanceof Error ? err.message : String(err)));
      setResult({
        success: false,
        error: err,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setLoading(false);
    }
  };

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
                onChange={(e) => setInvitationCode(e.target.value)}
              />
              <Button 
                onClick={handleTestService} 
                disabled={loading}
              >
                {loading ? "Procesando..." : "Probar Servicio"}
              </Button>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {result && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Resultado ({result.timestamp}):</h3>
              <div className="bg-gray-50 p-4 rounded-md border">
                <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Este panel permite probar el servicio fetchInvitationByCode sin autenticación
      </CardFooter>
    </Card>
  );
}
