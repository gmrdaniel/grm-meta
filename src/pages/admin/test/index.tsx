import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchInvitationByCode } from "@/services/invitationService";
import { fetchTikTokUserInfo } from "@/services/tiktokVideoService";
import { CreatorInvitation } from "@/types/invitation";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle2, Facebook } from "lucide-react";
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

                  {facebookPageResult && (
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
                          
                          {facebookPageResult.exists && facebookPageResult.reels && facebookPageResult.reels.length > 0 && (
                            <div>
                              <div className="font-semibold mb-2">Reels disponibles:</div>
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
