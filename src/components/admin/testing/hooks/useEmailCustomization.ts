
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchTikTokUserInfo } from "@/services/tiktokVideoService";

export type EmailType = "invitación" | "bienvenida" | "recordatorio";

export function useEmailCustomization() {
  const [name, setName] = useState<string>("");
  const [tiktokUsername, setTiktokUsername] = useState<string>("");
  const [emailType, setEmailType] = useState<EmailType>("invitación");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);
  const [tiktokProfileData, setTiktokProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);

  const fetchTikTokProfile = async () => {
    if (!tiktokUsername) return;
    
    setIsLoadingProfile(true);
    try {
      // Remove @ if present
      const cleanUsername = tiktokUsername.startsWith('@') 
        ? tiktokUsername.substring(1) 
        : tiktokUsername;
        
      const profileData = await fetchTikTokUserInfo(cleanUsername);
      setTiktokProfileData(profileData);
      toast.success(`Perfil de TikTok cargado: @${cleanUsername}`);
      return profileData;
    } catch (error) {
      console.error("Error al cargar perfil de TikTok:", error);
      toast.error("No se pudo cargar el perfil de TikTok");
      return null;
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleGenerateEmail = async () => {
    if (!name.trim()) {
      toast.error("Por favor ingrese un nombre");
      return;
    }
    
    if (!tiktokUsername.trim()) {
      toast.error("Por favor ingrese un nombre de usuario de TikTok");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Fetch TikTok profile if not already loaded
      const profile = tiktokProfileData || await fetchTikTokProfile();
      
      // Clean username (remove @ if present)
      const cleanUsername = tiktokUsername.startsWith('@') 
        ? tiktokUsername.substring(1) 
        : tiktokUsername;
      
      // Call the edge function to generate the email content
      const { data, error } = await supabase.functions.invoke("generate-email-content", {
        body: {
          name,
          tiktokUsername: cleanUsername,
          emailType,
          tiktokProfileData: profile
        },
      });
      
      if (error) throw error;
      
      if (data?.emailContent) {
        setGeneratedEmail(data.emailContent);
      } else {
        throw new Error("No se recibió contenido de correo");
      }
    } catch (error) {
      console.error("Error al generar correo:", error);
      toast.error("Error al generar el correo electrónico");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    if (!generatedEmail) return;
    
    // Create a temporary element to copy the HTML
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
    tiktokUsername,
    setTiktokUsername,
    emailType,
    setEmailType,
    isGenerating,
    generatedEmail,
    isLoadingProfile,
    tiktokProfileData,
    fetchTikTokProfile,
    handleGenerateEmail,
    handleCopyToClipboard
  };
}
