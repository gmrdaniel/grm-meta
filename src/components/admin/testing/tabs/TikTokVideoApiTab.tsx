
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTikTokVideoApi } from "../hooks/useTikTokVideoApi";
import ErrorDisplay from "../ErrorDisplay";
import TestResultDisplay from "../TestResultDisplay";
import { Loader2, Key } from "lucide-react";

export default function TikTokVideoApiTab() {
  const {
    username,
    setUsername,
    result,
    loading,
    error,
    retryCount,
    currentApiKey,
    handleTest
  } = useTikTokVideoApi();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Test API TikTok Video
          <Badge variant="outline" className="ml-2">TikTok Video API</Badge>
        </CardTitle>
        <CardDescription>
          Esta prueba consulta videos de usuarios de TikTok utilizando RapidAPI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="tiktokVideoUsername" className="block text-sm font-medium mb-1">
              Username
            </label>
            <div className="flex gap-2">
              <Input 
                id="tiktokVideoUsername" 
                placeholder="Ingrese el nombre de usuario" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
              />
              <Button onClick={handleTest} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {retryCount > 0 ? `Reintentando (${retryCount}/5)` : "Procesando..."}
                  </>
                ) : (
                  "Probar Servicio"
                )}
              </Button>
            </div>
            <ErrorDisplay error={error} />
          </div>

          {result?.apiKey && (
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 border border-blue-200 flex items-center gap-2">
              <Key className="h-4 w-4" />
              <p className="font-medium">API Key utilizada: {result.apiKey}</p>
            </div>
          )}

          {retryCount > 0 && loading && (
            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 border border-yellow-200">
              <p className="font-medium">Límite de velocidad detectado</p>
              <p className="mt-1">Reintentando conexión con retraso exponencial ({retryCount}/5)</p>
            </div>
          )}

          <TestResultDisplay result={result} />
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Este panel permite probar la API de TikTok para obtener videos de usuarios. Incluye manejo inteligente de límites de velocidad.
      </CardFooter>
    </Card>
  );
}
