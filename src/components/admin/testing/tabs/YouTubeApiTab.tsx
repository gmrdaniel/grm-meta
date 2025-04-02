
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useYouTubeShortsApi } from "../hooks/useYouTubeShortsApi";
import ErrorDisplay from "../ErrorDisplay";
import TestResultDisplay from "../TestResultDisplay";
import { Youtube, Database, Loader2, DatabaseBackup } from "lucide-react";
import { useState } from "react";

export default function YouTubeApiTab() {
  const {
    channelId,
    setChannelId,
    result,
    loading,
    error,
    handleTest,
    videoDetails,
    loadingVideoDetails,
    videoDetailsError,
    fetchVideoDetails,
    allVideoDetails,
    saveVideosToDatabase,
    savingToDatabase
  } = useYouTubeShortsApi();

  const [selectedCreatorId, setSelectedCreatorId] = useState<string>("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Buscar Shorts por channel Id
          <Badge variant="outline" className="ml-2">YouTube API</Badge>
        </CardTitle>
        <CardDescription>
          Esta prueba consulta los shorts de un canal de YouTube utilizando RapidAPI y automáticamente obtiene los detalles de cada video
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
                value={channelId} 
                onChange={e => setChannelId(e.target.value)} 
              />
              <Button onClick={handleTest} disabled={loading}>
                {loading ? "Procesando..." : "Buscar Shorts"}
              </Button>
            </div>
            <ErrorDisplay error={error} />
          </div>

          {result?.success && result.data?.contents?.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                <h3 className="font-medium">Shorts encontrados: {result.data.contents.length}</h3>
                
                <div className="flex flex-wrap gap-2 items-center">
                  <Input
                    placeholder="ID del creador para guardar"
                    value={selectedCreatorId}
                    onChange={e => setSelectedCreatorId(e.target.value)}
                    className="w-64"
                  />
                  <Button 
                    variant="secondary"
                    className="flex items-center gap-1"
                    onClick={() => saveVideosToDatabase(selectedCreatorId)}
                    disabled={savingToDatabase || !selectedCreatorId}
                  >
                    {savingToDatabase ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <DatabaseBackup className="h-4 w-4 mr-1" />
                        Guardar en base de datos
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Video ID</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Comentarios</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Vistas</TableHead>
                      <TableHead>Duración (seg)</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.data.contents.map((short: any, index: number) => {
                      const videoId = short.video?.videoId;
                      const details = allVideoDetails[videoId];
                      const videoData = details?.success ? details.data : null;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{videoId || 'No disponible'}</TableCell>
                          <TableCell>{short.video?.title || 'No disponible'}</TableCell>
                          <TableCell>
                            {videoData ? videoData.stats?.comments?.toLocaleString() || 'N/A' : 'Cargando...'}
                          </TableCell>
                          <TableCell>
                            {videoData ? videoData.stats?.likes?.toLocaleString() || 'N/A' : 'Cargando...'}
                          </TableCell>
                          <TableCell>
                            {videoData ? videoData.stats?.views?.toLocaleString() || 'N/A' : 'Cargando...'}
                          </TableCell>
                          <TableCell>
                            {videoData ? videoData.lengthSeconds || 'N/A' : 'Cargando...'}
                          </TableCell>
                          <TableCell>
                            {videoId ? (
                              <a 
                                href={`https://www.youtube.com/shorts/${videoId}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                https://www.youtube.com/shorts/{videoId}
                              </a>
                            ) : 'No disponible'}
                          </TableCell>
                          <TableCell>
                            {details ? (
                              details.success ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Detalles cargados
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  Error al cargar
                                </Badge>
                              )
                            ) : (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Cargando...
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {videoDetailsError && <ErrorDisplay error={videoDetailsError} />}
          
          {videoDetails?.success && (
            <div className="mt-6 border p-4 rounded-md bg-gray-50">
              <h3 className="font-medium mb-2 text-lg">Detalles del video: {videoDetails.videoId}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-white p-3 rounded shadow">
                  <div className="text-sm text-gray-500">Comentarios</div>
                  <div className="text-lg font-semibold">{videoDetails.data.stats?.comments?.toLocaleString() || "N/A"}</div>
                </div>
                <div className="bg-white p-3 rounded shadow">
                  <div className="text-sm text-gray-500">Likes</div>
                  <div className="text-lg font-semibold">{videoDetails.data.stats?.likes?.toLocaleString() || "N/A"}</div>
                </div>
                <div className="bg-white p-3 rounded shadow">
                  <div className="text-sm text-gray-500">Vistas</div>
                  <div className="text-lg font-semibold">{videoDetails.data.stats?.views?.toLocaleString() || "N/A"}</div>
                </div>
                <div className="bg-white p-3 rounded shadow">
                  <div className="text-sm text-gray-500">Duración (segundos)</div>
                  <div className="text-lg font-semibold">{videoDetails.data.lengthSeconds || "N/A"}</div>
                </div>
              </div>
              
              <TestResultDisplay result={videoDetails} title="Detalles completos" />
            </div>
          )}

          <TestResultDisplay result={result} title="Resultado completo" />
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Este panel permite buscar shorts de YouTube por ID de canal, mostrar los detalles de cada video y guardar los resultados en la base de datos
      </CardFooter>
    </Card>
  );
}
