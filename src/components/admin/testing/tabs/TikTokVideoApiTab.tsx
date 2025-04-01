
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTikTokVideoApi } from "../hooks/useTikTokVideoApi";
import ErrorDisplay from "../ErrorDisplay";
import TestResultDisplay from "../TestResultDisplay";

export default function TikTokVideoApiTab() {
  const {
    username,
    setUsername,
    result,
    loading,
    error,
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
                {loading ? "Procesando..." : "Probar Servicio"}
              </Button>
            </div>
            <ErrorDisplay error={error} />
          </div>

          <TestResultDisplay result={result} />
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Este panel permite probar la API de TikTok para obtener videos de usuarios
      </CardFooter>
    </Card>
  );
}
