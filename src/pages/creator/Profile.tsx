
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { PersonalInfoInputs } from "@/components/profile/PersonalInfoInputs";
import { SocialMediaInputs } from "@/components/profile/SocialMediaInputs";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";

const COUNTRIES = [
  { label: "México", value: "Mexico", code: "+52" },
  { label: "Colombia", value: "Colombia", code: "+57" },
  { label: "Venezuela", value: "Venezuela", code: "+58" },
  { label: "Brasil", value: "Brasil", code: "+55" },
  { label: "Chile", value: "Chile", code: "+56" },
  { label: "Perú", value: "Peru", code: "+51" },
  { label: "Estados Unidos", value: "EU", code: "+1" },
];

const CATEGORIES = [
  "Moda y Belleza",
  "Fitness y Salud",
  "Tecnología",
  "Viajes",
  "Gastronomía",
  "Gaming",
  "Educación",
  "Finanzas y Negocios",
  "Entretenimiento",
  "Arte y Diseño",
  "Lifestyle",
  "mama",
  "papa",
  "niños",
];

const GENDERS = [
  { label: "Masculino", value: "Masculino" },
  { label: "Femenino", value: "Femenino" },
  { label: "No binario", value: "No binario" },
  { label: "Prefiero no decirlo", value: "Prefiero no decirlo" },
];

export default function CreatorProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    country_of_residence: "",
    state_of_residence: "",
    country_code: "",
    phone_number: "",
    instagram_username: "",
    instagram_followers: "",
    tiktok_username: "",
    tiktok_followers: "",
    youtube_username: "",
    youtube_followers: "",
    pinterest_username: "",
    pinterest_followers: "",
    category: "",
    gender: "",
    profile_photo_url: "",
  });

  useEffect(() => {
    if (user) {
      fetchPersonalData();
    }
  }, [user]);

  const fetchPersonalData = async () => {
    try {
      const { data, error } = await supabase
        .from("personal_data")
        .select("*")
        .eq("profile_id", user?.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log("No existing data found");
          return;
        }
        console.error("Error fetching personal data:", error);
        return;
      }

      if (data) {
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          birth_date: data.birth_date || "",
          country_of_residence: data.country_of_residence || "",
          state_of_residence: data.state_of_residence || "",
          country_code: data.country_code || "",
          phone_number: data.phone_number || "",
          instagram_username: data.instagram_username || "",
          instagram_followers: data.instagram_followers?.toString() || "",
          tiktok_username: data.tiktok_username || "",
          tiktok_followers: data.tiktok_followers?.toString() || "",
          youtube_username: data.youtube_username || "",
          youtube_followers: data.youtube_followers?.toString() || "",
          pinterest_username: data.pinterest_username || "",
          pinterest_followers: data.pinterest_followers?.toString() || "",
          category: data.category || "",
          gender: data.gender || "",
          profile_photo_url: data.profile_photo_url || "",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar los datos del perfil");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("personal_data")
        .upsert(
          {
            profile_id: user?.id,
            ...formData,
            instagram_followers: parseInt(formData.instagram_followers) || 0,
            tiktok_followers: parseInt(formData.tiktok_followers) || 0,
            youtube_followers: parseInt(formData.youtube_followers) || 0,
            pinterest_followers: parseInt(formData.pinterest_followers) || 0,
          },
          {
            onConflict: "profile_id",
          }
        );

      if (error) throw error;

      toast.success("Perfil actualizado exitosamente!");
    } catch (error: any) {
      console.error("Error details:", error);
      toast.error("Error al actualizar el perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "country_code" && {
        country_code: COUNTRIES.find((c) => c.value === value)?.code || "",
      }),
    }));
  };

  const handlePhotoUpdate = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      profile_photo_url: url,
    }));
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Información Personal</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
              <ProfilePhotoUpload
                currentPhotoUrl={formData.profile_photo_url}
                userId={user.id}
                onPhotoUpdate={handlePhotoUpdate}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="Tus apellidos"
                  />
                </div>
              </div>

              <PersonalInfoInputs
                formData={formData}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                COUNTRIES={COUNTRIES}
                CATEGORIES={CATEGORIES}
                GENDERS={GENDERS}
              />

              <SocialMediaInputs
                formData={formData}
                handleInputChange={handleInputChange}
              />

              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
