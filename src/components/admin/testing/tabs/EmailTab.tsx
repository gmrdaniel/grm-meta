
import { useState } from "react";
import { Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmailCustomization, EmailType } from "../hooks/useEmailCustomization";

export default function EmailTab() {
  const {
    name,
    setName,
    tiktokUrl,
    setTiktokUrl,
    emailType,
    setEmailType,
    isGenerating,
    generatedEmail,
    handleGenerateEmail,
    handleCopyToClipboard
  } = useEmailCustomization();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Formulario de Personalización */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Personalizar Correo
          </CardTitle>
          <CardDescription>
            Complete los campos para personalizar un correo electrónico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientName">Nombre del Destinatario</Label>
            <Input 
              id="recipientName" 
              placeholder="Nombre del destinatario" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tiktokUrl">URL de TikTok</Label>
            <Input 
              id="tiktokUrl" 
              placeholder="https://www.tiktok.com/@usuario" 
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emailType">Tipo de Correo</Label>
            <Select 
              value={emailType} 
              onValueChange={(value) => setEmailType(value as EmailType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo de correo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invitación">Invitación</SelectItem>
                <SelectItem value="bienvenida">Bienvenida</SelectItem>
                <SelectItem value="recordatorio">Recordatorio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateEmail} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generando..." : "Redactar Correo"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Vista Previa del Correo */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa</CardTitle>
          <CardDescription>
            Previsualización del correo generado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedEmail ? (
            <div className="border rounded-md p-4 min-h-[300px] bg-white">
              <div 
                dangerouslySetInnerHTML={{ __html: generatedEmail }} 
                className="prose prose-sm max-w-none"
              />
            </div>
          ) : (
            <div className="border rounded-md p-4 min-h-[300px] flex items-center justify-center text-gray-400 bg-gray-50">
              <p>Complete los campos y presione "Redactar Correo" para generar una vista previa</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleCopyToClipboard}
            disabled={!generatedEmail}
          >
            Copiar Texto
          </Button>
          <Button 
            variant="secondary"
            disabled={!generatedEmail}
            onClick={() => window.open(`mailto:?subject=Mensaje para ${name}&body=${encodeURIComponent(generatedEmail || '')}`)}
          >
            Abrir en Cliente de Correo
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
