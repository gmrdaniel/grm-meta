
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fetchTikTokUserInfo } from "@/services/tiktokVideoService";

export function TikTokTest() {
  const [tiktokUsername, setTiktokUsername] = useState<string>("");
  const [tiktokResult, setTiktokResult] = useState<any>(null);
  const [tiktokLoading, setTiktokLoading] = useState<boolean>(false);
  const [tiktokError, setTiktokError] = useState<string | null>(null);
  
  const [tiktokVideoUsername, setTiktokVideoUsername] = useState<string>("");
  const [tiktokVideoResult, setTiktokVideoResult] = useState<any>(null);
  const [tiktokVideoLoading, setTiktokVideoLoading] = useState<boolean>(false);
  const [tiktokVideoError, setTiktokVideoError] = useState<string | null>(null);

  const handleTiktokTest = async () => {
    if (!tiktokUsername.trim()) {
      setTiktokError("Por favor ingrese un nombre de usuario");
      return;
    }

    setTiktokLoading(true);
    setTiktokError(null);
    
    try {
      const data = await fetchTikTokUserInfo(tiktokUsername);
      
      setTiktokResult({
        data,
        success: true,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      console.error("Error testing TikTok API:", err);
      setTiktokError("Error al consultar la API de TikTok: " + (err instanceof Error ? err.message : String(err)));
      setTiktokResult({
        success: false,
        error: err,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setTiktokLoading(false);
    }
  };

  const handleTiktokVideoTest = async () => {
    if (!tiktokVideoUsername.trim()) {
      setTiktokVideoError("Por favor ingrese un nombre de usuario");
      return;
    }

    setTiktokVideoLoading(true);
    setTiktokVideoError(null);
    
    try {
      const url = `https://tiktok-api6.p.rapidapi.com/user/videos?username=${encodeURIComponent(tiktokVideoUsername)}`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
          'x-rapidapi-host': 'tiktok-api6.p.rapidapi.com'
        }
      };

      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      setTiktokVideoResult({
        data,
        success: true,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      console.error("Error testing TikTok Video API:", err);
      setTiktokVideoError("Error al consultar la API de TikTok Video: " + (err instanceof Error ? err.message : String(err)));
      setTiktokVideoResult({
        success: false,
        error: err,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setTiktokVideoLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Test API TikTok
            <Badge variant="outline" className="ml-2">TikTok API</Badge>
          </CardTitle>
          <CardDescription>
            Esta prueba consulta información de usuarios de TikTok utilizando RapidAPI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="tiktokUsername" className="block text-sm font-medium mb-1">
                Username
              </label>
              <div className="flex gap-2">
                <Input
                  id="tiktokUsername"
                  placeholder="Ingrese el nombre de usuario"
                  value={tiktokUsername}
                  onChange={(e) => setTiktokUsername(e.target.value)}
                />
                <Button 
                  onClick={handleTiktokTest} 
                  disabled={tiktokLoading}
                >
                  {tiktokLoading ? "Procesando..." : "Probar Servicio"}
                </Button>
              </div>
              {tiktokError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{tiktokError}</AlertDescription>
                </Alert>
              )}
            </div>

            {tiktokResult && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Resultado ({tiktokResult.timestamp}):</h3>
                <div className="bg-gray-50 p-4 rounded-md border">
                  <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
                    {JSON.stringify(tiktokResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          Este panel permite probar la API de TikTok para obtener información de usuarios
        </CardFooter>
      </Card>

      <Card className="mt-6">
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
                  value={tiktokVideoUsername}
                  onChange={(e) => setTiktokVideoUsername(e.target.value)}
                />
                <Button 
                  onClick={handleTiktokVideoTest} 
                  disabled={tiktokVideoLoading}
                >
                  {tiktokVideoLoading ? "Procesando..." : "Probar Servicio"}
                </Button>
              </div>
              {tiktokVideoError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{tiktokVideoError}</AlertDescription>
                </Alert>
              )}
            </div>

            {tiktokVideoResult && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Resultado ({tiktokVideoResult.timestamp}):</h3>
                <div className="bg-gray-50 p-4 rounded-md border">
                  <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
                    {JSON.stringify(tiktokVideoResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          Este panel permite probar la API de TikTok para obtener videos de usuarios
        </CardFooter>
      </Card>
    </>
  );
}
