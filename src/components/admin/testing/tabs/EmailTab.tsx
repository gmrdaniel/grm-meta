
import { useState } from "react";
import { Mail, Loader2, RefreshCw, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmailCustomization, EmailType } from "../hooks/useEmailCustomization";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function EmailTab() {
  const {
    name,
    setName,
    tiktokUsername,
    setTiktokUsername,
    emailType,
    setEmailType,
    isGenerating,
    isLoadingProfile,
    generatedEmail,
    tiktokProfileData,
    fetchTikTokProfile,
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
            Personalizar Correo con IA
          </CardTitle>
          <CardDescription>
            Complete los campos para generar un correo personalizado con IA
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
            <Label htmlFor="tiktokUsername" className="flex items-center justify-between">
              <span>Usuario de TikTok</span>
              {tiktokProfileData && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="ml-2 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Perfil cargado</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Seguidores: {tiktokProfileData?.stats?.followerCount || 'N/A'}</p>
                      <p>Me gusta: {tiktokProfileData?.stats?.heartCount || 'N/A'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </Label>
            <div className="flex gap-2">
              <Input 
                id="tiktokUsername" 
                placeholder="@usuario" 
                value={tiktokUsername}
                onChange={(e) => setTiktokUsername(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={fetchTikTokProfile}
                disabled={isLoadingProfile || !tiktokUsername}
                title="Cargar perfil de TikTok"
              >
                {isLoadingProfile ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
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
            disabled={isGenerating || !name || !tiktokUsername}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando con IA...
              </>
            ) : (
              "Redactar con IA"
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Vista Previa del Correo */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa</CardTitle>
          <CardDescription>
            Previsualización del correo generado con IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedEmail ? (
            <div className="border rounded-md p-4 min-h-[300px] overflow-auto bg-white">
              <div 
                dangerouslySetInnerHTML={{ __html: generatedEmail }} 
                className="prose prose-sm max-w-none"
              />
            </div>
          ) : (
            <div className="border rounded-md p-4 min-h-[300px] flex items-center justify-center text-gray-400 bg-gray-50">
              <p>Complete los campos y presione "Redactar con IA" para generar una vista previa</p>
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
