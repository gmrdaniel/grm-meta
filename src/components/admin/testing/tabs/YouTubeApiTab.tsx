
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useYouTubeShortsApi } from "../hooks/useYouTubeShortsApi";
import ErrorDisplay from "../ErrorDisplay";
import TestResultDisplay from "../TestResultDisplay";
import { Youtube } from "lucide-react";

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
    fetchVideoDetails
  } = useYouTubeShortsApi();

  return (
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
              <h3 className="font-medium mb-3">Shorts encontrados: {result.data.contents.length}</h3>
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
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.data.contents.map((short: any, index: number) => {
                      const videoId = short.video?.videoId;
                      const currentVideoDetails = videoDetails?.videoId === videoId && videoDetails.success ? videoDetails.data : null;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{videoId || 'No disponible'}</TableCell>
                          <TableCell>{short.video?.title || 'No disponible'}</TableCell>
                          <TableCell>
                            {currentVideoDetails ? currentVideoDetails.stats?.comments?.toLocaleString() || 'N/A' : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {currentVideoDetails ? currentVideoDetails.stats?.likes?.toLocaleString() || 'N/A' : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {currentVideoDetails ? currentVideoDetails.stats?.views?.toLocaleString() || 'N/A' : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {currentVideoDetails ? currentVideoDetails.lengthSeconds || 'N/A' : 'N/A'}
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => fetchVideoDetails(videoId)}
                              disabled={loadingVideoDetails || (videoDetails?.videoId === videoId && videoDetails.success)}
                            >
                              <Youtube className="mr-1 h-4 w-4" />
                              {videoDetails?.videoId === videoId && videoDetails.success ? "Detalles cargados" : "Ver detalles"}
                            </Button>
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
        Este panel permite buscar shorts de YouTube por ID de canal
      </CardFooter>
    </Card>
  );
}
