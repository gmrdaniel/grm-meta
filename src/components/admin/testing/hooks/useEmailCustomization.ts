
import { useState } from "react";
import { toast } from "sonner";

export type EmailType = "invitación" | "bienvenida" | "recordatorio";

export function useEmailCustomization() {
  const [name, setName] = useState<string>("");
  const [tiktokUrl, setTiktokUrl] = useState<string>("");
  const [emailType, setEmailType] = useState<EmailType>("invitación");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);

  const handleGenerateEmail = () => {
    if (!name.trim()) {
      toast.error("Por favor ingrese un nombre");
      return;
    }
    
    if (!tiktokUrl.trim()) {
      toast.error("Por favor ingrese una URL de TikTok");
      return;
    }
    
    setIsGenerating(true);
    
    // Simulamos la generación del correo
    setTimeout(() => {
      const emailTemplates = {
        invitación: `
          <h1>Invitación para ${name}</h1>
          <p>Hola ${name},</p>
          <p>Te invitamos a unirte a nuestra plataforma como creador de contenido.</p>
          <p>Hemos visto tu talento en <a href="${tiktokUrl}" target="_blank">TikTok</a> y nos encantaría colaborar contigo.</p>
          <p>¡Esperamos tu respuesta!</p>
          <p>Equipo de La Neta</p>
        `,
        bienvenida: `
          <h1>Bienvenido/a ${name}</h1>
          <p>Hola ${name},</p>
          <p>Estamos muy contentos de que te hayas unido a nuestra plataforma.</p>
          <p>Hemos visto tu contenido en <a href="${tiktokUrl}" target="_blank">TikTok</a> y estamos emocionados de trabajar contigo.</p>
          <p>¡Bienvenido/a al equipo!</p>
          <p>Equipo de La Neta</p>
        `,
        recordatorio: `
          <h1>Recordatorio importante</h1>
          <p>Hola ${name},</p>
          <p>Te recordamos que aún no has completado tu perfil en nuestra plataforma.</p>
          <p>Valoramos mucho tu contenido en <a href="${tiktokUrl}" target="_blank">TikTok</a> y queremos ayudarte a monetizarlo.</p>
          <p>¡No pierdas esta oportunidad!</p>
          <p>Equipo de La Neta</p>
        `
      };

      setGeneratedEmail(emailTemplates[emailType]);
      setIsGenerating(false);
    }, 1000);
  };
  
  const handleCopyToClipboard = () => {
    if (!generatedEmail) return;
    
    // Creamos un elemento temporal para copiar el HTML
    const tempElement = document.createElement("div");
    tempElement.innerHTML = generatedEmail;
    
    navigator.clipboard.writeText(tempElement.innerText)
      .then(() => {
        toast.success("Correo copiado al portapapeles");
      })
      .catch(() => {
        toast.error("Error al copiar el correo");
      });
  };

  return {
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
  };
}
