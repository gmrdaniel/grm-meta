import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorDisplay from "@/components/admin/testing/ErrorDisplay";
import TestResultDisplay from "@/components/admin/testing/TestResultDisplay";
import { toast } from "@/components/ui/use-toast";
import { Loader2, CopyCheck, AlignLeft, FileText } from "lucide-react";

export default function RedactarTab() {
  const [name, setName] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [description, setDescription] = useState("Write a personalized outreach email in the voice of Lauren Guschmer, an executive at La Neta (a partner agency working with Meta), inviting a specific TikTok creator to apply for the Meta Creator Breakthrough Program. The tone should be clear, professional, and neutral—leaning toward corporate, without emojis or slang.\n\n-No include Subject, \n-no include sing mail Lauren\n\nStructure:\nShort introduction: Lauren introduces herself, her role, and La Neta's relationship with Meta\n\nPersonalization: Include 1–2 specific, thoughtful lines about the creator's TikTok content and how it aligns with Meta's goals based on the creator's profile \n\nBullet point list of program benefits:\n\n• Monthly cash bonuses for Reels on Facebook or Instagram\n• Increased visibility and reach through Meta's discovery tools\n• Direct support from Meta's creator partnerships team\n• Opportunities for future collaborations and platform features\n\nClosing line: Encourage the creator to apply\n\nClear CTA without link placeholder\n\nUse this TikTok profile as the source for personalization: {link_red_social}\n\nInclude the creator's name {nombre} in your greeting.");
  const [processedPrompt, setProcessedPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formattedResult, setFormattedResult] = useState<any>(null);
  const [formattedText, setFormattedText] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");

  useEffect(() => {
    let prompt = description;
    prompt = prompt.replace(/{nombre}/g, name || "{nombre}");
    prompt = prompt.replace(/{link_red_social}/g, socialLink || "{link_red_social}");
    setProcessedPrompt(prompt);
  }, [name, socialLink, description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setFormattedResult(null);
    setFormattedText("");

    if (!name || !socialLink || !description) {
      setError("Los campos Nombre, Link de red social y Descripción son obligatorios");
      return;
    }
    setLoading(true);
    try {
      const prompt = processedPrompt;
      const response = await fetch('https://chatgpt-42.p.rapidapi.com/gpt4o', {
        method: 'POST',
        headers: {
          'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
          'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: prompt
          }],
          web_access: true
        })
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API error: ${errorData}`);
      }
      const data = await response.json();
      const timestampedResult = {
        ...data,
        timestamp: new Date().toLocaleString()
      };
      setResult(timestampedResult.result);
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

  const handleFormatText = () => {
    if (result) {
      const formatted = JSON.parse(JSON.stringify(result));
      if (formatted.choices && formatted.choices[0]?.message?.content) {
        const content = formatted.choices[0].message.content;
        formatted.choices[0].message.content = content.replace(/\\n\\n/g, '\n');
        setFormattedText(formatted.choices[0].message.content);
      }
      setFormattedResult(formatted);
      toast({
        title: "Texto formateado",
        description: "Se han reemplazado los saltos de línea correctamente."
      });
    }
  };

  const extractPlainText = () => {
    if (!result) return;
    try {
      let plainText = "";
      console.log("Result structure:", JSON.stringify(result, null, 2));
      if (typeof result === 'string') {
        plainText = result;
      } else if (result.content) {
        plainText = result.content;
      } else if (result.result) {
        plainText = result.result;
      } else if (result.choices && result.choices[0]?.message?.content) {
        plainText = result.choices[0].message.content;
      } else {
        const resultStr = JSON.stringify(result);
        const contentMatch = resultStr.match(/"content":"([^"]+)"/);
        if (contentMatch && contentMatch[1]) {
          plainText = contentMatch[1];
        } else {
          console.error("Unexpected API response format:", result);
          throw new Error("No se pudo encontrar el contenido del mensaje");
        }
      }
      plainText = plainText.replace(/\\n/g, '\n');
      setFormattedText(plainText);
      setExtractedText(plainText);
      toast({
        title: "Texto extraído",
        description: "Se ha extraído el texto plano con formato."
      });
    } catch (err) {
      console.error("Error extracting text:", err);
      toast({
        title: "Error al extraer texto",
        description: "No se pudo encontrar el contenido del mensaje.",
        variant: "destructive"
      });
    }
  };

  return <Card>
      <CardHeader>
        <CardTitle>Redactar invitación</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del creador" disabled={loading} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="socialLink">Link de red social</Label>
            <Input id="socialLink" value={socialLink} onChange={e => setSocialLink(e.target.value)} placeholder="https://tiktok.com/@username" disabled={loading} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción / Prompt</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Utiliza {nombre}, {link_red_social} como variables" rows={8} disabled={loading} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="processedPrompt">Prompt generado</Label>
            <Textarea id="processedPrompt" value={processedPrompt} readOnly className="bg-gray-50" rows={3} disabled={loading} />
          </div>
          
          <ErrorDisplay error={error} />
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando invitación...
              </> : "Generar invitación"}
          </Button>

          {result && <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Mensaje de invitación generado</h3>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={handleFormatText}>
                    <CopyCheck className="mr-2 h-4 w-4" />
                    Formatear texto
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={extractPlainText}>
                    <AlignLeft className="mr-2 h-4 w-4" />
                    Extraer texto plano
                  </Button>
                </div>
              </div>
              
              <TestResultDisplay result={formattedResult || result} title="Mensaje de invitación generado" />
              
              {formattedText && (
                <div className="mt-4 p-4 border rounded-md bg-blue-50">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-800">Texto formateado</h4>
                  </div>
                  <Textarea 
                    value={formattedText} 
                    readOnly 
                    className="bg-white border-blue-200 min-h-[200px]" 
                  />
                </div>
              )}
              
              {extractedText && <div className="mt-6 p-4 border rounded-md bg-green-50">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-800">Texto extraído</h4>
                  </div>
                  <div className="bg-white p-4 rounded border border-green-200 whitespace-pre-wrap">
                    {extractedText}
                  </div>
                </div>}
            </div>}
        </form>
      </CardContent>
    </Card>;
}
