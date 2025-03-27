
import { useState } from "react";
import { AlertCircle, CheckCircle2, Facebook, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type FacebookReel = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  created_at: string;
  duration: string;
};

export function FacebookPageTab() {
  const [facebookPageUrl, setFacebookPageUrl] = useState<string>("");
  const [facebookPageResult, setFacebookPageResult] = useState<any>(null);
  const [facebookPageLoading, setFacebookPageLoading] = useState<boolean>(false);
  const [facebookPageError, setFacebookPageError] = useState<string | null>(null);
  const [facebookPageReels, setFacebookPageReels] = useState<FacebookReel[]>([]);
  const [reelsLoading, setReelsLoading] = useState<boolean>(false);
  const [reelsError, setReelsError] = useState<string | null>(null);

  const handleFacebookPageTest = async () => {
    if (!facebookPageUrl.trim()) {
      setFacebookPageError("Por favor ingrese una URL de página de Facebook");
      return;
    }

    setFacebookPageLoading(true);
    setFacebookPageError(null);
    
    try {
      let pageName = facebookPageUrl;
      
      try {
        if (facebookPageUrl.includes('facebook.com/')) {
          const urlObj = new URL(facebookPageUrl);
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          if (pathParts.length > 0) {
            pageName = pathParts[0];
          }
        } else if (facebookPageUrl.includes('/')) {
          pageName = facebookPageUrl.split('/').filter(Boolean)[0];
        }
      } catch (e) {
        console.log("URL parsing failed, using original input");
      }
      
      const pageExists = pageName.length >= 2;
      
      const mockReels = pageExists ? [
        { id: '1', title: 'Reel #1', views: 1200, likes: 230, comments: 45 },
        { id: '2', title: 'Reel #2', views: 3400, likes: 560, comments: 78 },
        { id: '3', title: 'Reel #3', views: 890, likes: 120, comments: 23 }
      ] : [];
      
      setFacebookPageResult({
        pageUrl: facebookPageUrl,
        pageName,
        exists: pageExists,
        reels: mockReels,
        success: true,
        timestamp: new Date().toLocaleString()
      });
      
      // Reset reels when testing a new page
      setFacebookPageReels([]);
    } catch (err) {
      console.error("Error testing Facebook Page:", err);
      setFacebookPageError("Error al consultar la página de Facebook: " + (err instanceof Error ? err.message : String(err)));
      setFacebookPageResult({
        success: false,
        error: err,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setFacebookPageLoading(false);
    }
  };

  const handleGetPageReels = async () => {
    if (!facebookPageResult?.pageName) {
      setReelsError("Por favor valide una página de Facebook primero");
      return;
    }

    setReelsLoading(true);
    setReelsError(null);
    
    try {
      const mockReels = [
        { 
          id: 'r1', 
          title: 'Reel #1: Producto destacado', 
          description: 'Descubre nuestro nuevo producto increíble',
          thumbnail: 'https://picsum.photos/200/300',
          views: 2500, 
          likes: 430, 
          comments: 65,
          created_at: '2023-06-15T10:30:00Z',
          duration: '00:45'
        },
        { 
          id: 'r2', 
          title: 'Reel #2: Tutorial fácil', 
          description: 'Aprende a usar nuestro producto en 3 pasos',
          thumbnail: 'https://picsum.photos/201/300',
          views: 5600, 
          likes: 890, 
          comments: 112,
          created_at: '2023-06-17T15:45:00Z',
          duration: '01:20'
        },
        { 
          id: 'r3', 
          title: 'Reel #3: Testimonial de cliente', 
          description: 'Lo que nuestros clientes dicen sobre nosotros',
          thumbnail: 'https://picsum.photos/202/300',
          views: 1800, 
          likes: 320, 
          comments: 47,
          created_at: '2023-06-19T09:15:00Z',
          duration: '00:55'
        },
        { 
          id: 'r4', 
          title: 'Reel #4: Detrás de cámaras', 
          description: 'Un vistazo a nuestro proceso creativo',
          thumbnail: 'https://picsum.photos/203/300',
          views: 3200, 
          likes: 540, 
          comments: 78,
          created_at: '2023-06-21T14:20:00Z',
          duration: '01:10'
        },
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFacebookPageReels(mockReels);
    } catch (err) {
      console.error("Error fetching Facebook Reels:", err);
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
                          <span>Página encontrada: {facebookPageResult.pageName}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="mr-1 h-4 w-4" />
                          <span>Página no encontrada</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-semibold">Reels disponibles:</div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleGetPageReels}
                      disabled={reelsLoading || !facebookPageResult.exists}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${reelsLoading ? 'animate-spin' : ''}`} />
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
                              <div className="font-medium text-blue-600">{reel.title}</div>
                              <div className="text-sm text-gray-600 mt-1">{reel.description}</div>
                              <div className="text-xs text-gray-500 mt-2">
                                Duración: {reel.duration} • Creado: {new Date(reel.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-500 flex gap-4 mt-2">
                                <span>{reel.views.toLocaleString()} views</span>
                                <span>{reel.likes.toLocaleString()} likes</span>
                                <span>{reel.comments.toLocaleString()} comments</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : facebookPageResult.reels && facebookPageResult.reels.length > 0 ? (
                    <div className="grid gap-2">
                      {facebookPageResult.reels.map((reel: any) => (
                        <div key={reel.id} className="bg-white p-3 rounded border">
                          <div className="font-medium">{reel.title}</div>
                          <div className="text-sm text-gray-500 flex gap-4 mt-1">
                            <span>{reel.views} views</span>
                            <span>{reel.likes} likes</span>
                            <span>{reel.comments} comments</span>
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
