
import { useState, useEffect } from "react";
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
  const [description, setDescription] = useState("genera un mensaje de 1 parrafo en ingles: sobre el contenido de {link_red_social} para invitarlo a trabajar en un programa de meta, el mensaje debe ser divertido, amigable enfocado a la generación z, al mensaje personaliza el mensaje con su nombre {nombre} y {descripcion}, al final agrega el siguiente link: {link_invitacion} esta invitación debe ser amigable y tener varias veces el CTA");
  const [invitationLink, setInvitationLink] = useState("");
  const [processedPrompt, setProcessedPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formattedResponseText, setFormattedResponseText] = useState("");
  
  // Process the prompt by replacing placeholders with actual values
  // but NOT replacing {link_invitacion}
  useEffect(() => {
    let prompt = description;
    prompt = prompt.replace(/{nombre}/g, name || "{nombre}");
    prompt = prompt.replace(/{link_red_social}/g, socialLink || "{link_red_social}");
    // We don't replace {link_invitacion} in the processed prompt
    setProcessedPrompt(prompt);
  }, [name, socialLink, description, invitationLink]);
  
  // Format response text when result changes
  useEffect(() => {
    if (result && result.choices && result.choices[0]?.message?.content) {
      // Replace \n\n with actual line breaks for display
      const content = result.choices[0].message.content.replace(/\\n\\n/g, '\n');
      setFormattedResponseText(content);
    } else {
      setFormattedResponseText("");
    }
  }, [result]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    
    // Validation - make invitation link optional
    if (!name || !socialLink || !description) {
      setError("Los campos Nombre, Link de red social y Descripción son obligatorios");
      return;
    }
    
    setLoading(true);
    
    try {
      // Use the processed prompt for the API call
      const prompt = processedPrompt;
      
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
              placeholder="Utiliza {nombre}, {link_red_social} y {link_invitacion} como variables"
              rows={4}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invitationLink">Link de invitación (opcional)</Label>
            <Input 
              id="invitationLink" 
              value={invitationLink} 
              onChange={(e) => setInvitationLink(e.target.value)}
              placeholder="https://example.com/invite/code"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="processedPrompt">Prompt generado</Label>
            <Textarea 
              id="processedPrompt" 
              value={processedPrompt}
              readOnly
              className="bg-gray-50"
              rows={3}
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
            <>
              <div className="space-y-2 mt-6 border-t pt-4">
                <Label htmlFor="formattedResponse">Mensaje generado</Label>
                <Textarea 
                  id="formattedResponse" 
                  value={formattedResponseText}
                  className="min-h-[150px]"
                  readOnly
                  rows={6}
                />
              </div>
              
              <TestResultDisplay 
                result={result} 
                title="Mensaje de invitación generado" 
              />
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
