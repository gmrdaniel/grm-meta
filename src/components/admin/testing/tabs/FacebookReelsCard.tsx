
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useFacebookReelsApi } from "../hooks/useFacebookReelsApi";
import ErrorDisplay from "../ErrorDisplay";
import TestResultDisplay from "../TestResultDisplay";

export default function FacebookReelsCard() {
  const {
    pageId,
    setPageId,
    result,
    loading,
    error,
    handleTest
  } = useFacebookReelsApi();

  return (
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
                value={pageId} 
                onChange={e => setPageId(e.target.value)} 
              />
              <Button onClick={handleTest} disabled={loading}>
                {loading ? "Procesando..." : "Obtener Reels"}
              </Button>
            </div>
            <ErrorDisplay error={error} />
          </div>

          {result?.success && result.data?.results?.length > 0 && (
            <div className="space-y-3 mt-4 border rounded-md p-4 bg-gray-50">
              <h3 className="font-medium">Reels encontrados: {result.data.results.length}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.data.results.slice(0, 4).map((reel: any, index: number) => (
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

          <TestResultDisplay result={result} title="Resultado completo" />
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Este panel permite obtener los Reels de una página de Facebook usando su ID
      </CardFooter>
    </Card>
  );
}
