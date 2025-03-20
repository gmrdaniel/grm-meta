
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchInvitationByCode } from "@/services/invitationService";
import { CreatorInvitation } from "@/types/invitation";

export default function AdminTestPage() {
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
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Panel de Pruebas (Admin)</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Prueba del Servicio de Invitaciones</CardTitle>
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
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              {result && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Resultado de la prueba ({result.timestamp}):</h3>
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
            Este panel permite probar el servicio findInvitationByCode con diferentes códigos.
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
