
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useFacebookPageApi } from "../hooks/useFacebookPageApi";
import ErrorDisplay from "../ErrorDisplay";
import TestResultDisplay from "../TestResultDisplay";

export default function FacebookPageInfoCard() {
  const {
    pageUrl,
    setPageUrl,
    result,
    loading,
    error,
    handleTest
  } = useFacebookPageApi();

  return (
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
                value={pageUrl} 
                onChange={e => setPageUrl(e.target.value)} 
              />
              <Button onClick={handleTest} disabled={loading}>
                {loading ? "Procesando..." : "Probar API"}
              </Button>
            </div>
            <ErrorDisplay error={error} />
          </div>

          {result?.success && (
            <div className="space-y-3 mt-4 border rounded-md p-4 bg-gray-50">
              <h3 className="font-medium">Información de la página:</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Name:</div>
                <div className="text-sm">{result.data?.name || 'No disponible'}</div>
                
                <div className="text-sm font-medium">Page ID:</div>
                <div className="text-sm">{result.data?.page_id || 'No disponible'}</div>
                
                <div className="text-sm font-medium">Email:</div>
                <div className="text-sm">{result.data?.email || 'No disponible'}</div>
                
                <div className="text-sm font-medium">Followers:</div>
                <div className="text-sm">{result.data?.followers || 'No disponible'}</div>
              </div>
            </div>
          )}

          <TestResultDisplay result={result} title="Resultado completo" />
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Este panel permite probar la API de Facebook para obtener detalles de una página
      </CardFooter>
    </Card>
  );
}
