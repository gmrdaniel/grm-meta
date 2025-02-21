
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera } from "lucide-react";

interface ProfilePhotoUploadProps {
  currentPhotoUrl: string | null;
  userId: string;
  onPhotoUpdate: (url: string) => void;
}

export const ProfilePhotoUpload = ({
  currentPhotoUrl,
  userId,
  onPhotoUpdate,
}: ProfilePhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no puede ser mayor a 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor sube una imagen válida");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-photos").getPublicUrl(filePath);

      setPhotoUrl(publicUrl);
      onPhotoUpdate(publicUrl);
      
      // Actualizar la foto en la base de datos
      const { error: updateError } = await supabase
        .from("personal_data")
        .update({ profile_photo_url: publicUrl })
        .eq("profile_id", userId);

      if (updateError) {
        throw updateError;
      }

      toast.success("Foto de perfil actualizada exitosamente");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error al subir la imagen: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <Avatar className="w-32 h-32">
        <AvatarImage src={photoUrl || ""} alt="Foto de perfil" />
        <AvatarFallback className="bg-primary/10">
          {userId.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        <Button variant="outline" disabled={uploading}>
          <Camera className="w-4 h-4 mr-2" />
          {uploading ? "Subiendo..." : "Cambiar foto"}
        </Button>
      </div>
    </div>
  );
};
