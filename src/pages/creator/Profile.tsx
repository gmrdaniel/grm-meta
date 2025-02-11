
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

export default function CreatorProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    birth_date: "",
    nationality: "",
    country_code: "",
    phone_number: "",
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
          // No data found - first time user
          console.log("No existing data found");
          return;
        }
        console.error("Error fetching personal data:", error);
        return;
      }

      if (data) {
        setFormData({
          birth_date: data.birth_date || "",
          nationality: data.nationality || "",
          country_code: data.country_code || "",
          phone_number: data.phone_number || "",
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
                <Label htmlFor="nationality">Nacionalidad</Label>
                <Select 
                  value={formData.nationality} 
                  onValueChange={(value) => handleSelectChange("nationality", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu nacionalidad" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country_code">País</Label>
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
