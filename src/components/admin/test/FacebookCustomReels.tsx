
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Facebook, ExternalLink, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import FechaDesdeTimestamp from "./FechaDesdeTimestamp";

export function FacebookCustomReels() {
  const [customPageId, setCustomPageId] = useState<string>("");
  const [customReels, setCustomReels] = useState<any[]>([]);
  const [customReelsLoading, setCustomReelsLoading] = useState<boolean>(false);
  const [customReelsError, setCustomReelsError] = useState<string | null>(null);

  const handleGetCustomPageReels = async () => {
    if (!customPageId.trim()) {
      setCustomReelsError("Por favor ingrese un Page ID");
      return;
    }

    setCustomReelsLoading(true);
    setCustomReelsError(null);
    
    try {
      const pageId = customPageId.trim();
      const apiUrl = `https://facebook-scraper3.p.rapidapi.com/page/reels?page_id=${pageId}`;
      
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
          'x-rapidapi-host': 'facebook-scraper3.p.rapidapi.com'
        }
      };

      console.log("Fetching Facebook page reels from:", apiUrl);
      const response = await fetch(apiUrl, options);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Facebook Reels API response for custom Page ID:", data);
      
      if (data && Array.isArray(data.results)) {
        const reelsData = data.results.map((reel: any) => ({
          id: reel.video_id || `reel-${Math.random().toString(36).substring(2, 11)}`,
          video_id: reel.video_id || "No ID",
          url: reel.url || "#",
          timestamp: reel.timestamp || "No date",
          title: `Video ID: ${reel.video_id || "No ID"}`,
          description: reel.description || "Sin descripción",
          thumbnail: reel.thumbnail || "https://picsum.photos/200/300",
          views: reel.views || Math.floor(Math.random() * 10000),
          likes: reel.likes || Math.floor(Math.random() * 1000),
          comments: reel.comments || Math.floor(Math.random() * 100),
        }));
        
        toast({
          title: "Reels obtenidos para ID personalizado",
          description: `Se encontraron ${reelsData.length} reels`,
          variant: "default",
        });
        
        setCustomReels(reelsData);
      } else {
        throw new Error("No se encontraron reels o formato inválido");
      }
    } catch (err) {
      console.error("Error fetching Facebook Reels for custom Page ID:", err);
      
      const mockReels = [
        { 
          id: 'cr1', 
          video_id: 'cv123456789',
          url: 'https://www.facebook.com/watch/?v=123456789',
          timestamp: '2023-07-15T10:30:00Z',
          title: 'Video ID: cv123456789', 
          description: 'Descripción del reel personalizado',
          views: 3500, 
          likes: 530, 
          comments: 85,
        },
        { 
          id: 'cr2', 
          video_id: 'cv987654321',
          url: 'https://www.facebook.com/watch/?v=987654321',
          timestamp: '2023-07-17T15:45:00Z',
          title: 'Video ID: cv987654321', 
          description: 'Otro reel personalizado de prueba',
          views: 6200, 
          likes: 790, 
          comments: 132,
        },
      ];
      
      toast({
        title: "Error al obtener reels personalizados",
        description: "Usando datos de demostración",
        variant: "destructive",
      });
      
      setCustomReels(mockReels);
      setCustomReelsError("Error al obtener Reels de Facebook: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setCustomReelsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Test Reels por Page ID
          <Badge variant="outline" className="ml-2">Reels Directos</Badge>
        </CardTitle>
        <CardDescription>
          Obtener reels directamente usando un Page ID específico
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="customPageId" className="block text-sm font-medium mb-1">
              Page ID de Facebook
            </label>
            <div className="flex gap-2">
              <div className="flex-1 flex">
                <div className="bg-blue-600 p-2 rounded-l-md border-y border-l border-gray-300 flex items-center">
                  <Facebook className="h-5 w-5 text-white" />
                </div>
                <Input
                  id="customPageId"
                  placeholder="Ej: 100063857267478"
                  value={customPageId}
                  onChange={(e) => setCustomPageId(e.target.value)}
                  className="rounded-l-none flex-1"
                />
              </div>
              <Button 
                onClick={handleGetCustomPageReels} 
                disabled={customReelsLoading}
              >
                {customReelsLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  "Get Page Reels"
                )}
              </Button>
            </div>
            {customReelsError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{customReelsError}</AlertDescription>
              </Alert>
            )}
          </div>

          {customReels.length > 0 ? (
            <div className="grid gap-3 mt-4">
              <div className="font-semibold mb-2">Reels encontrados:</div>
              {customReels.map((reel) => (
                <div key={reel.id} className="bg-white p-3 rounded border hover:shadow-md transition-shadow">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-blue-600 flex items-center">
                        {reel.title}
                        <a href={reel.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-gray-500 hover:text-blue-600">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{reel.description}</div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-500">
                          Video ID: {reel.video_id}
                        </div>
                        <div className="text-xs text-gray-500">
                          Fecha: <FechaDesdeTimestamp timestamp={reel.timestamp} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 mt-4">
              Ingrese un Page ID y haga clic en 'Get Page Reels' para obtener los reels
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Este panel permite obtener reels directamente por Page ID sin necesidad de validar la página primero
      </CardFooter>
    </Card>
  );
}
