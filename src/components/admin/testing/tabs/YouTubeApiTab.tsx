
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useYouTubeShortsApi } from "../hooks/useYouTubeShortsApi";
import ErrorDisplay from "../ErrorDisplay";
import TestResultDisplay from "../TestResultDisplay";

export default function YouTubeApiTab() {
  const {
    channelId,
    setChannelId,
    result,
    loading,
    error,
    handleTest
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
                      <TableHead>URL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.data.contents.map((short: any, index: number) => (
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

          <TestResultDisplay result={result} title="Resultado completo" />
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Este panel permite buscar shorts de YouTube por ID de canal
      </CardFooter>
    </Card>
  );
}
