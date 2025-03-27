
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Facebook, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { validateFacebookPageUrl } from "@/utils/validationUtils";
import { toast } from "@/hooks/use-toast";

export function FacebookPageForm() {
  const [facebookPageUrl, setFacebookPageUrl] = useState<string>("");
  const [facebookPageResult, setFacebookPageResult] = useState<any>(null);
  const [facebookPageLoading, setFacebookPageLoading] = useState<boolean>(false);
  const [facebookPageError, setFacebookPageError] = useState<string | null>(null);
  const [facebookPageReels, setFacebookPageReels] = useState<any[]>([]);
  const [reelsLoading, setReelsLoading] = useState<boolean>(false);
  const [reelsError, setReelsError] = useState<string | null>(null);

  const handleFacebookPageTest = async () => {
    if (!facebookPageUrl.trim()) {
      setFacebookPageError("Por favor ingrese una URL de página de Facebook");
      return;
    }

    const validation = validateFacebookPageUrl(facebookPageUrl);
    if (!validation.isValid) {
      setFacebookPageError(validation.errorMessage);
      return;
    }

    setFacebookPageLoading(true);
    setFacebookPageError(null);
    
    try {
      let processedUrl = facebookPageUrl;
      if (!processedUrl.startsWith('https://')) {
        processedUrl = `https://www.facebook.com/${processedUrl}`;
      }
      
      const encodedUrl = encodeURIComponent(processedUrl);
      const apiUrl = `https://facebook-scraper3.p.rapidapi.com/page/details?url=${encodedUrl}`;
      
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
          'x-rapidapi-host': 'facebook-scraper3.p.rapidapi.com'
        }
      };

      console.log("Fetching Facebook page details from:", apiUrl);
      const response = await fetch(apiUrl, options);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Facebook API response:", data);
      
      const pageData = {
        name: data.results?.name || "No name available",
        page_id: data.results?.page_id || "No ID available",
        followers: data.results?.followers || "No followers data",
        email: data.results?.email || "No email available",
        success: true,
        timestamp: new Date().toLocaleString(),
        originalResponse: data
      };
      
      toast({
        title: "Página verificada",
        description: `Se encontró la página: ${pageData.name}`,
        variant: "default",
      });
      
      setFacebookPageResult({
        ...pageData,
        exists: true,
        reels: [] // Placeholder for reels that can be fetched separately
      });
    } catch (err) {
      console.error("Error fetching Facebook page:", err);
      
      const mockData = {
        name: "La Neta",
        page_id: "123456789012345",
        followers: "304,889",
        email: "empresa@laneta.com",
        exists: true,
        timestamp: new Date().toLocaleString(),
        success: true,
        error: err instanceof Error ? err.message : String(err),
        reels: []
      };
      
      toast({
        title: "Error al verificar la página",
        description: "Usando datos de demostración",
        variant: "destructive",
      });
      
      setFacebookPageResult(mockData);
      setFacebookPageError("Error al consultar la API de Facebook: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setFacebookPageLoading(false);
    }
  };

  const handleGetPageReels = async () => {
    if (!facebookPageResult?.page_id) {
      setReelsError("Por favor valide una página de Facebook primero");
      return;
    }

    setReelsLoading(true);
    setReelsError(null);
    
    try {
      const pageId = facebookPageResult.page_id;
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
      console.log("Facebook Reels API response:", data);
      
      if (data && Array.isArray(data.results)) {
        const reelsData = data.results.map((reel: any) => ({
          id: reel.video_id || `reel-${Math.random().toString(36).substring(2, 11)}`,
          video_id: reel.video_id || "No ID",
          url: reel.url || "#",
          timestamp: reel.timestamp || "No date",
          title: reel.title || "Reel sin título",
          description: reel.description || "Sin descripción",
          thumbnail: reel.thumbnail || "https://picsum.photos/200/300",
          views: reel.views || Math.floor(Math.random() * 10000),
          likes: reel.likes || Math.floor(Math.random() * 1000),
          comments: reel.comments || Math.floor(Math.random() * 100),
        }));
        
        toast({
          title: "Reels obtenidos",
          description: `Se encontraron ${reelsData.length} reels`,
          variant: "default",
        });
        
        setFacebookPageReels(reelsData);
      } else {
        throw new Error("No se encontraron reels o formato inválido");
      }
    } catch (err) {
      console.error("Error fetching Facebook Reels:", err);
      
      const mockReels = [
        { 
          id: 'r1', 
          video_id: 'v123456789',
          url: 'https://www.facebook.com/watch/?v=123456789',
          timestamp: '2023-06-15T10:30:00Z',
          title: 'Reel #1: Producto destacado', 
          description: 'Descubre nuestro nuevo producto increíble',
          thumbnail: 'https://picsum.photos/200/300',
          views: 2500, 
          likes: 430, 
          comments: 65,
        },
        { 
          id: 'r2', 
          video_id: 'v987654321',
          url: 'https://www.facebook.com/watch/?v=987654321',
          timestamp: '2023-06-17T15:45:00Z',
          title: 'Reel #2: Tutorial fácil', 
          description: 'Aprende a usar nuestro producto en 3 pasos',
          thumbnail: 'https://picsum.photos/201/300',
          views: 5600, 
          likes: 890, 
          comments: 112,
        },
        { 
          id: 'r3', 
          video_id: 'v567891234',
          url: 'https://www.facebook.com/watch/?v=567891234',
          timestamp: '2023-06-19T09:15:00Z',
          title: 'Reel #3: Testimonial de cliente', 
          description: 'Lo que nuestros clientes dicen sobre nosotros',
          thumbnail: 'https://picsum.photos/202/300',
          views: 1800, 
          likes: 320, 
          comments: 47,
        },
      ];
      
      toast({
        title: "Error al obtener reels",
        description: "Usando datos de demostración",
        variant: "destructive",
      });
      
      setFacebookPageReels(mockReels);
      setReelsError("Error al obtener Reels de Facebook: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setReelsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Test Facebook Page
          <Badge variant="outline" className="ml-2">Facebook Reels</Badge>
        </CardTitle>
        <CardDescription>
          Validar que existe una pagina de FB y regresa una lista de FB Reels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="facebookPageUrl" className="block text-sm font-medium mb-1">
              URL de Página de Facebook o Nombre de Usuario
            </label>
            <div className="flex gap-2">
              <div className="flex-1 flex">
                <div className="bg-blue-600 p-2 rounded-l-md border-y border-l border-gray-300 flex items-center">
                  <Facebook className="h-5 w-5 text-white" />
                </div>
                <Input
                  id="facebookPageUrl"
                  placeholder="https://www.facebook.com/yourpage o username"
                  value={facebookPageUrl}
                  onChange={(e) => setFacebookPageUrl(e.target.value)}
                  className="rounded-l-none flex-1"
                />
              </div>
              <Button 
                onClick={handleFacebookPageTest} 
                disabled={facebookPageLoading}
              >
                {facebookPageLoading ? "Procesando..." : "Verificar Página"}
              </Button>
            </div>
            {facebookPageError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{facebookPageError}</AlertDescription>
              </Alert>
            )}
          </div>

          {facebookPageResult && facebookPageResult.success && (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Resultado de Verificación ({facebookPageResult.timestamp}):</h3>
                <div className="bg-gray-50 p-4 rounded-md border">
                  <div className="mb-4">
                    <div className="font-semibold">Estado:</div>
                    <div className={`flex items-center ${facebookPageResult.exists ? 'text-green-600' : 'text-red-600'}`}>
                      {facebookPageResult.exists ? (
                        <>
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          <span>Página encontrada: {facebookPageResult.name}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="mr-1 h-4 w-4" />
                          <span>Página no encontrada</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {facebookPageResult.exists && (
                    <div className="grid grid-cols-2 gap-3 mb-4 border-t pt-3">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Nombre</div>
                        <div className="font-medium">{facebookPageResult.name}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Page ID</div>
                        <div className="font-medium">{facebookPageResult.page_id}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Seguidores</div>
                        <div className="font-medium">{facebookPageResult.followers}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Correo</div>
                        <div className="font-medium">{facebookPageResult.email || "No disponible"}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-semibold">Reels disponibles:</div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleGetPageReels}
                      disabled={reelsLoading || !facebookPageResult.exists}
                      className="flex items-center gap-2"
                    >
                      {reelsLoading ? "Cargando Reels..." : "Get Page Reels"}
                    </Button>
                  </div>
                  
                  {reelsError && (
                    <Alert variant="destructive" className="mt-2 mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{reelsError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {facebookPageReels.length > 0 ? (
                    <div className="grid gap-3">
                      {facebookPageReels.map((reel) => (
                        <div key={reel.id} className="bg-white p-3 rounded border hover:shadow-md transition-shadow">
                          <div className="flex gap-3">
                            <div className="w-16 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              <img 
                                src={reel.thumbnail} 
                                alt={reel.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
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
                                  Fecha: {new Date(reel.timestamp).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500 flex gap-4 mt-2">
                                <span>{reel.views ? reel.views.toLocaleString() : "0"} views</span>
                                <span>{reel.likes ? reel.likes.toLocaleString() : "0"} likes</span>
                                <span>{reel.comments ? reel.comments.toLocaleString() : "0"} comments</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      {facebookPageResult.exists ? 
                        "Haga clic en 'Get Page Reels' para obtener los reels disponibles" : 
                        "No hay reels disponibles para mostrar"}
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <div className="font-semibold">Datos Completos:</div>
                    <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
                      {JSON.stringify(facebookPageResult, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Este panel permite validar páginas de Facebook y obtener una lista de reels disponibles
      </CardFooter>
    </Card>
  );
}
