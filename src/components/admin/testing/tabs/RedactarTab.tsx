
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorDisplay from "@/components/admin/testing/ErrorDisplay";
import TestResultDisplay from "@/components/admin/testing/TestResultDisplay";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function RedactarTab() {
  const [name, setName] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [description, setDescription] = useState("");
  const [invitationLink, setInvitationLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    
    // Validation
    if (!name || !socialLink || !description || !invitationLink) {
      setError("Todos los campos son obligatorios");
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare the prompt using the form values
      const prompt = `genera un mensaje de 1 parrafo en ingles: sobre el contenido de ${socialLink} para invitarlo a trabajar en un programa de meta, el mensaje debe ser divertido, amigable enfocado a la generación z, al mensaje personaliza el mensaje con su nombre ${name} y ${description}, al final agrega el siguiente link: ${invitationLink} esta invitación debe ser amigable y tener varias veces el CTA`;
      
      // API call to RapidAPI ChatGPT
      const response = await fetch('https://chatgpt-42.p.rapidapi.com/gpt4o', {
        method: 'POST',
        headers: {
          'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
          'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          web_access: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API error: ${errorData}`);
      }
      
      const data = await response.json();
      
      // Store result with timestamp for display
      const timestampedResult = {
        ...data,
        timestamp: new Date().toLocaleString()
      };
      
      setResult(timestampedResult);
      toast({
        title: "Mensaje generado correctamente",
        description: "El mensaje de invitación ha sido generado exitosamente."
      });
      
    } catch (err) {
      console.error("Error generating invitation:", err);
      setError(`Error al generar invitación: ${err instanceof Error ? err.message : String(err)}`);
      toast({
        title: "Error al generar invitación",
        description: "Hubo un problema al comunicarse con la API de ChatGPT.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Redactar invitación</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del creador"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="socialLink">Link de red social</Label>
            <Input 
              id="socialLink" 
              value={socialLink} 
              onChange={(e) => setSocialLink(e.target.value)}
              placeholder="https://tiktok.com/@username"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción / Prompt</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción o instrucciones para la invitación"
              rows={4}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invitationLink">Link de invitación</Label>
            <Input 
              id="invitationLink" 
              value={invitationLink} 
              onChange={(e) => setInvitationLink(e.target.value)}
              placeholder="https://example.com/invite/code"
              disabled={loading}
            />
          </div>
          
          <ErrorDisplay error={error} />
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando invitación...
              </>
            ) : (
              "Generar invitación"
            )}
          </Button>

          {result && (
            <TestResultDisplay 
              result={result} 
              title="Mensaje de invitación generado" 
            />
          )}
        </form>
      </CardContent>
    </Card>
  );
}
