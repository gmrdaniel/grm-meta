
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchInvitationByCode } from "@/services/invitationService";
import { CreatorInvitation } from "@/types/invitation";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function AdminTestPage() {
  const [invitationCode, setInvitationCode] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [directResult, setDirectResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [directLoading, setDirectLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [directError, setDirectError] = useState<string | null>(null);

  // Test using the service function
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

  // Direct test using RPC function
  const handleDirectTest = async () => {
    if (!invitationCode.trim()) {
      setDirectError("Por favor ingrese un código de invitación");
      return;
    }

    setDirectLoading(true);
    setDirectError(null);
    try {
      const { data, error } = await supabase.rpc('find_invitation_by_code', { 
        code_param: invitationCode 
      });
      
      if (error) throw error;
      
      setDirectResult({
        data,
        success: true,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      console.error("Error testing direct RPC call:", err);
      setDirectError("Error al consultar RPC: " + (err instanceof Error ? err.message : String(err)));
      setDirectResult({
        success: false,
        error: err,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setDirectLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Panel de Pruebas (Admin)</h1>
        
        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Servicio Público Configurado</AlertTitle>
          <AlertDescription>
            El servicio de consulta de invitaciones está configurado para acceso público sin autenticación.
            Las pruebas a continuación pueden ejecutarse sin necesidad de iniciar sesión.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="service" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="service">Usando Servicio</TabsTrigger>
            <TabsTrigger value="direct">Llamada Directa RPC</TabsTrigger>
          </TabsList>
          
          <TabsContent value="service">
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
          </TabsContent>
          
          <TabsContent value="direct">
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
                        onChange={(e) => setInvitationCode(e.target.value)}
                      />
                      <Button 
                        onClick={handleDirectTest} 
                        disabled={directLoading}
                      >
                        {directLoading ? "Procesando..." : "Llamar RPC"}
                      </Button>
                    </div>
                    {directError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{directError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {directResult && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Resultado RPC ({directResult.timestamp}):</h3>
                      <div className="bg-gray-50 p-4 rounded-md border">
                        <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
                          {JSON.stringify(directResult, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                Este panel permite probar directamente la función RPC find_invitation_by_code sin autenticación
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
