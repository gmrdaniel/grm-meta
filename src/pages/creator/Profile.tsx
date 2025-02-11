
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        });
      }
    } catch (error) {
      console.error("Error:", error);
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
            onConflict: 'profile_id'
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Información Personal</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
              <div className="space-y-2">
                <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country_of_residence">País de Residencia</Label>
                <Select 
                  value={formData.country_of_residence} 
                  onValueChange={(value) => handleSelectChange("country_of_residence", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu país de residencia" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state_of_residence">Estado de Residencia</Label>
                <Input
                  id="state_of_residence"
                  name="state_of_residence"
                  value={formData.state_of_residence}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu estado de residencia"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country_code">País (Código)</Label>
                  <Select
                    value={COUNTRIES.find(c => c.code === formData.country_code)?.value || ""}
                    onValueChange={(value) => handleSelectChange("country_code", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu país" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label} ({country.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Número de Teléfono</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="Ingresa tu número de teléfono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Género</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu género" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((gender) => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Redes Sociales</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram_username">Usuario de Instagram</Label>
                    <Input
                      id="instagram_username"
                      name="instagram_username"
                      value={formData.instagram_username}
                      onChange={handleInputChange}
                      placeholder="@usuario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram_followers">Seguidores en Instagram</Label>
                    <Input
                      id="instagram_followers"
                      name="instagram_followers"
                      type="number"
                      value={formData.instagram_followers}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tiktok_username">Usuario de TikTok</Label>
                    <Input
                      id="tiktok_username"
                      name="tiktok_username"
                      value={formData.tiktok_username}
                      onChange={handleInputChange}
                      placeholder="@usuario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok_followers">Seguidores en TikTok</Label>
                    <Input
                      id="tiktok_followers"
                      name="tiktok_followers"
                      type="number"
                      value={formData.tiktok_followers}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="youtube_username">Usuario de YouTube</Label>
                    <Input
                      id="youtube_username"
                      name="youtube_username"
                      value={formData.youtube_username}
                      onChange={handleInputChange}
                      placeholder="@usuario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube_followers">Seguidores en YouTube</Label>
                    <Input
                      id="youtube_followers"
                      name="youtube_followers"
                      type="number"
                      value={formData.youtube_followers}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pinterest_username">Usuario de Pinterest</Label>
                    <Input
                      id="pinterest_username"
                      name="pinterest_username"
                      value={formData.pinterest_username}
                      onChange={handleInputChange}
                      placeholder="@usuario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pinterest_followers">Seguidores en Pinterest</Label>
                    <Input
                      id="pinterest_followers"
                      name="pinterest_followers"
                      type="number"
                      value={formData.pinterest_followers}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

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
