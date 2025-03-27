import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchInvitationByCode } from "@/services/invitationService";
import { fetchTikTokUserInfo } from "@/services/tiktokVideoService";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle2, Facebook, RefreshCw, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { validateFacebookPageUrl } from "@/utils/validationUtils";
import { toast } from "@/hooks/use-toast";

export default function AdminTestPage() {
  const [invitationCode, setInvitationCode] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [directResult, setDirectResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [directLoading, setDirectLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [directError, setDirectError] = useState<string | null>(null);
  
  const [tiktokUsername, setTiktokUsername] = useState<string>("");
  const [tiktokResult, setTiktokResult] = useState<any>(null);
  const [tiktokLoading, setTiktokLoading] = useState<boolean>(false);
  const [tiktokError, setTiktokError] = useState<string | null>(null);
  
  const [tiktokVideoUsername, setTiktokVideoUsername] = useState<string>("");
  const [tiktokVideoResult, setTiktokVideoResult] = useState<any>(null);
  const [tiktokVideoLoading, setTiktokVideoLoading] = useState<boolean>(false);
  const [tiktokVideoError, setTiktokVideoError] = useState<string | null>(null);
  
  const [facebookPageUrl, setFacebookPageUrl] = useState<string>("");
  const [facebookPageResult, setFacebookPageResult] = useState<any>(null);
  const [facebookPageLoading, setFacebookPageLoading] = useState<boolean>(false);
  const [facebookPageError, setFacebookPageError] = useState<string | null>(null);
  const [facebookPageReels, setFacebookPageReels] = useState<any[]>([]);
  const [reelsLoading, setReelsLoading] = useState<boolean>(false);
  const [reelsError, setReelsError] = useState<string | null>(null);

  const [customPageId, setCustomPageId] = useState<string>("");
  const [customReels, setCustomReels] = useState<any[]>([]);
  const [customReelsLoading, setCustomReelsLoading] = useState<boolean>(false);
  const [customReelsError, setCustomReelsError] = useState<string | null>(null);

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
          title: reel.title || "Reel sin título",
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
          title: 'Custom Reel #1', 
          description: 'Descripción del reel personalizado',
          thumbnail: 'https://picsum.photos/203/300',
          views: 3500, 
          likes: 530, 
          comments: 85,
        },
        { 
          id: 'cr2', 
          video_id: 'cv987654321',
          url: 'https://www.facebook.com/watch/?v=987654321',
          timestamp: '2023-07-17T15:45:00Z',
          title: 'Custom Reel #2', 
          description: 'Otro reel personalizado de prueba',
          thumbnail: 'https://picsum.photos/204/300',
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
            <TabsTrigger value="tiktok">TikTok API</TabsTrigger>
            <TabsTrigger value="tiktok-video">TikTok Video</TabsTrigger>
            <TabsTrigger value="facebook-page">Facebook Page</TabsTrigger>
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
          
          <TabsContent value="tiktok">
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
          </TabsContent>
          
          <TabsContent value="tiktok-video">
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
          </TabsContent>
          
          <TabsContent value="facebook-page">
            <div className="grid gap-6 md:grid-cols-2">
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
                  </CardContent>
                  <CardFooter className="text-sm text-gray-500">
                    Este panel permite validar páginas de Facebook y obtener una lista de reels disponibles
                  </CardFooter>
                </CardContent>
              </Card>
              
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
                          {customReelsLoading ? "Procesando..." : "Get Page Reels"}
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
