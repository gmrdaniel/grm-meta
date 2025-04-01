import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchInvitationByCode } from "@/services/invitationService";
import { fetchTikTokUserInfo } from "@/services/tiktokVideoService";
import { CreatorInvitation } from "@/types/invitation";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle2, Facebook, Youtube } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  
  const [facebookPageId, setFacebookPageId] = useState<string>("");
  const [facebookReelsResult, setFacebookReelsResult] = useState<any>(null);
  const [facebookReelsLoading, setFacebookReelsLoading] = useState<boolean>(false);
  const [facebookReelsError, setFacebookReelsError] = useState<string | null>(null);
  
  const [youtubeChannelId, setYoutubeChannelId] = useState<string>("");
  const [youtubeShortsResult, setYoutubeShortsResult] = useState<any>(null);
  const [youtubeShortsLoading, setYoutubeShortsLoading] = useState<boolean>(false);
  const [youtubeShortsError, setYoutubeShortsError] = useState<string | null>(null);

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
      const {
        data,
        error
      } = await supabase.rpc('find_invitation_by_code', {
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
    
    setFacebookPageLoading(true);
    setFacebookPageError(null);
    
    try {
      const encodedUrl = encodeURIComponent(facebookPageUrl);
      const url = `https://facebook-scraper3.p.rapidapi.com/page/details?url=${encodedUrl}`;
      
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
          'x-rapidapi-host': 'facebook-scraper3.p.rapidapi.com'
        }
      };
      
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      setFacebookPageResult({
        data: data.results,
        success: true,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      console.error("Error testing Facebook Page API:", err);
      setFacebookPageError("Error al consultar la API de Facebook: " + (err instanceof Error ? err.message : String(err)));
      setFacebookPageResult({
        success: false,
        error: err,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setFacebookPageLoading(false);
    }
  };

  const handleFacebookReelsTest = async () => {
    if (!facebookPageId.trim()) {
      setFacebookReelsError("Por favor ingrese un ID de página de Facebook");
      return;
    }
    
    setFacebookReelsLoading(true);
    setFacebookReelsError(null);
    
    try {
      const url = `https://facebook-scraper3.p.rapidapi.com/page/reels?page_id=${facebookPageId}`;
      
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
          'x-rapidapi-host': 'facebook-scraper3.p.rapidapi.com'
        }
      };
      
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      setFacebookReelsResult({
        data,
        success: true,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      console.error("Error fetching Facebook Reels:", err);
      setFacebookReelsError("Error al consultar la API de Facebook Reels: " + (err instanceof Error ? err.message : String(err)));
      setFacebookReelsResult({
        success: false,
        error: err,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setFacebookReelsLoading(false);
    }
  };

  const handleYoutubeShortsTest = async () => {
    if (!youtubeChannelId.trim()) {
      setYoutubeShortsError("Por favor ingrese un ID de canal de YouTube");
      return;
    }
    
    setYoutubeShortsLoading(true);
    setYoutubeShortsError(null);
    
    try {
      const url = `https://youtube-data8.p.rapidapi.com/channel/videos/?id=${youtubeChannelId}&filter=shorts_latest&hl=en&gl=US`;
      
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
          'x-rapidapi-host': 'youtube-data8.p.rapidapi.com'
        }
      };
      
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      setYoutubeShortsResult({
        data,
        success: true,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      console.error("Error fetching YouTube Shorts:", err);
      setYoutubeShortsError("Error al consultar la API de YouTube Shorts: " + (err instanceof Error ? err.message : String(err)));
      setYoutubeShortsResult({
        success: false,
        error: err,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setYoutubeShortsLoading(false);
    }
  };

  return <Layout>
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
            <TabsTrigger value="tiktok-video">TikTok Video API</TabsTrigger>
            <TabsTrigger value="facebook">Facebook API</TabsTrigger>
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
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
                      <Input id="invitationCode" placeholder="Ingrese el código" value={invitationCode} onChange={e => setInvitationCode(e.target.value)} />
                      <Button onClick={handleTestService} disabled={loading}>
                        {loading ? "Procesando..." : "Probar Servicio"}
                      </Button>
                    </div>
                    {error && <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>}
                  </div>

                  {result && <div className="mt-4">
                      <h3 className="font-medium mb-2">Resultado ({result.timestamp}):</h3>
                      <div className="bg-gray-50 p-4 rounded-md border">
                        <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    </div>}
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
                      <Input id="directInvitationCode" placeholder="Ingrese el código" value={invitationCode} onChange={e => setInvitationCode(e.target.value)} />
                      <Button onClick={handleDirectTest} disabled={directLoading}>
                        {directLoading ? "Procesando..." : "Llamar RPC"}
                      </Button>
                    </div>
                    {directError && <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{directError}</AlertDescription>
                      </Alert>}
                  </div>

                  {directResult && <div className="mt-4">
                      <h3 className="font-medium mb-2">Resultado RPC ({directResult.timestamp}):</h3>
                      <div className="bg-gray-50 p-4 rounded-md border">
                        <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
                          {JSON.stringify(directResult, null, 2)}
                        </pre>
                      </div>
                    </div>}
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
                      <Input id="tiktokUsername" placeholder="Ingrese el nombre de usuario" value={tiktokUsername} onChange={e => setTiktokUsername(e.target.value)} />
                      <Button onClick={handleTiktokTest} disabled={tiktokLoading}>
                        {tiktokLoading ? "Procesando..." : "Probar Servicio"}
                      </Button>
                    </div>
                    {tiktokError && <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{tiktokError}</AlertDescription>
                      </Alert>}
                  </div>

                  {tiktokResult && <div className="mt-4">
                      <h3 className="font-medium mb-2">Resultado ({tiktokResult.timestamp}):</h3>
                      <div className="bg-gray-50 p-4 rounded-md border">
                        <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
                          {JSON.stringify(tiktokResult, null, 2)}
                        </pre>
                      </div>
                    </div>}
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
                      <Input id="tiktokVideoUsername" placeholder="Ingrese el nombre de usuario" value={tiktokVideoUsername} onChange={e => setTiktokVideoUsername(e.target.value)} />
                      <Button onClick={handleTiktokVideoTest} disabled={tiktokVideoLoading}>
                        {tiktokVideoLoading ? "Procesando..." : "Probar Servicio"}
                      </Button>
                    </div>
                    {tiktokVideoError && <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{tiktokVideoError}</AlertDescription>
                      </Alert>}
                  </div>

                  {tiktokVideoResult && <div className="mt-4">
                      <h3 className="font-medium mb-2">Resultado ({tiktokVideoResult.timestamp}):</h3>
                      <div className="bg-gray-50 p-4 rounded-md border">
                        <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
                          {JSON.stringify(tiktokVideoResult, null, 2)}
                        </pre>
                      </div>
                    </div>}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                Este panel permite probar la API de TikTok para obtener videos de usuarios
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="facebook">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Detalles de Página Facebook
                    <Badge variant="outline" className="ml-2">API RapidAPI</Badge>
                  </CardTitle>
                  <CardDescription>
                    Esta prueba consulta detalles de una página de Facebook utilizando RapidAPI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="facebookPageUrl" className="block text-sm font-medium mb-1">
                        URL página Facebook
                      </Label>
                      <div className="flex gap-2">
                        <Input 
                          id="facebookPageUrl" 
                          placeholder="https://www.facebook.com/pagina" 
                          value={facebookPageUrl} 
                          onChange={e => setFacebookPageUrl(e.target.value)} 
                        />
                        <Button onClick={handleFacebookPageTest} disabled={facebookPageLoading}>
                          {facebookPageLoading ? "Procesando..." : "Probar API"}
                        </Button>
                      </div>
                      {facebookPageError && <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{facebookPageError}</AlertDescription>
                      </Alert>}
                    </div>

                    {facebookPageResult?.success && (
                      <div className="space-y-3 mt-4 border rounded-md p-4 bg-gray-50">
                        <h3 className="font-medium">Información de la página:</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Name:</div>
                          <div className="text-sm">{facebookPageResult.data?.name || 'No disponible'}</div>
                          
                          <div className="text-sm font-medium">Page ID:</div>
                          <div className="text-sm">{facebookPageResult.data?.page_id || 'No disponible'}</div>
                          
                          <div className="text-sm font-medium">Email:</div>
                          <div className="text-sm">{facebookPageResult.data?.email || 'No disponible'}</div>
                          
                          <div className="text-sm font-medium">Followers:</div>
                          <div className="text-sm">{facebookPageResult.data?.followers || 'No disponible'}</div>
                        </div>
                      </div>
                    )}

                    {facebookPageResult && <div className="mt-4">
                      <h3 className="font-medium mb-2">Resultado completo ({facebookPageResult.timestamp}):</h3>
                      <div className="bg-gray-50 p-4 rounded-md border">
                        <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
                          {JSON.stringify(facebookPageResult, null, 2)}
                        </pre>
                      </div>
                    </div>}
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-gray-500">
                  Este panel permite probar la API de Facebook para obtener detalles de una página
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Facebook Reels API
                    <Badge variant="outline" className="ml-2">Reels API</Badge>
                  </CardTitle>
                  <CardDescription>
                    Esta prueba consulta los Reels de una página de Facebook usando su ID
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="facebookPageId" className="block text-sm font-medium mb-1">
                        Page ID
                      </Label>
                      <div className="flex gap-2">
                        <Input 
                          id="facebookPageId" 
                          placeholder="100064860875397" 
                          value={facebookPageId} 
                          onChange={e => setFacebookPageId(e.target.value)} 
                        />
                        <Button onClick={handleFacebookReelsTest} disabled={facebookReelsLoading}>
                          {facebookReelsLoading ? "Procesando..." : "Obtener Reels"}
                        </Button>
                      </div>
                      {facebookReelsError && <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{facebookReelsError}</AlertDescription>
                      </Alert>}
                    </div>

                    {facebookReelsResult?.success && facebookReelsResult.data?.results?.length > 0 && (
                      <div className="space-y-3 mt-4 border rounded-md p-4 bg-gray-50">
                        <h3 className="font-medium">Reels encontrados: {facebookReelsResult.data.results.length}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {facebookReelsResult.data.results.slice(0, 4).map((reel: any, index: number) => (
                            <div key={index} className="border rounded p-3 bg-white">
                              <div className="text-sm font-medium">Video ID:</div>
                              <div className="text-sm mb-2">{reel.video_id || 'No disponible'}</div>
                              
                              <div className="text-sm font-medium">URL:</div>
                              <div className="text-sm mb-2 truncate">
                                <a href={reel.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {reel.url || 'No disponible'}
                                </a>
                              </div>
                              
                              <div className="text-sm font-medium">Timestamp:</div>
                              <div className="text-sm mb-2">{reel.timestamp || 'No disponible'}</div>
                              
                              <div className="text-sm font-medium">Duración (segundos):</div>
                              <div className="text-sm mb-2">{reel.length_in_seconds || 'No disponible'}</div>
                              
                              <div className="text-sm font-medium">Reproducciones:</div>
                              <div className="text-sm">{reel.play_count || 'No disponible'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {facebookReelsResult && <div className="mt-4">
                      <h3 className="font-medium mb-2">Resultado completo ({facebookReelsResult.timestamp}):</h3>
                      <div className="bg-gray-50 p-4 rounded-md border">
                        <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
                          {JSON.stringify(facebookReelsResult, null, 2)}
                        </pre>
                      </div>
                    </div>}
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-gray-500">
                  Este panel permite obtener los Reels de una página de Facebook usando su ID
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="youtube">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Buscar Shorts por channel Id
                  <Badge variant="outline" className="ml-2">YouTube API</Badge>
                </CardTitle>
                <CardDescription>
                  Esta prueba consulta los shorts de un canal de YouTube utilizando RapidAPI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="youtubeChannelId" className="block text-sm font-medium mb-1">
                      Channel ID
                    </Label>
                    <div className="flex gap-2">
                      <Input 
                        id="youtubeChannelId" 
                        placeholder="UC3Wr0S3cd-y-jMGa0eLTQvw" 
                        value={youtubeChannelId} 
                        onChange={e => setYoutubeChannelId(e.target.value)} 
                      />
                      <Button onClick={handleYoutubeShortsTest} disabled={youtubeShortsLoading}>
                        {youtubeShortsLoading ? "Procesando..." : "Buscar Shorts"}
                      </Button>
                    </div>
                    {youtubeShortsError && <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{youtubeShortsError}</AlertDescription>
                    </Alert>}
                  </div>

                  {youtubeShortsResult?.success && youtubeShortsResult.data?.contents?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-3">Shorts encontrados: {youtubeShortsResult.data.contents.length}</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Video ID</TableHead>
                              <TableHead>Título</TableHead>
                              <TableHead>URL</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {youtubeShortsResult.data.contents.map((short: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{short.video?.videoId || 'No disponible'}</TableCell>
                                <TableCell>{short.video?.title || 'No disponible'}</TableCell>
                                <TableCell>
                                  {short.video?.videoId ? (
                                    <a 
                                      href={`https://www.youtube.com/shorts/${short.video.videoId}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      https://www.youtube.com/shorts/{short.video.videoId}
                                    </a>
                                  ) : 'No disponible'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {youtubeShortsResult && <div className="mt-4">
                    <h3 className="font-medium mb-2">Resultado completo ({youtubeShortsResult.timestamp}):</h3>
                    <div className="bg-gray-50 p-4 rounded-md border">
                      <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
                        {JSON.stringify(youtubeShortsResult, null, 2)}
                      </pre>
                    </div>
                  </div>}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                Este panel permite buscar shorts de YouTube por ID de canal
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>;
}
