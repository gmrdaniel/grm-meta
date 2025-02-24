
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreatorRateForm } from "./CreatorRateForm";

interface Creator {
  id: string;
  email: string;
  full_name: string | null;
}

interface CreatorSearchProps {
  onCreatorSelect: (creator: Creator | null) => void;
  selectedCreator: Creator | null;
}

export function CreatorSearch({ onCreatorSelect, selectedCreator }: CreatorSearchProps) {
  const [searchEmail, setSearchEmail] = useState("");

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["search-creators", searchEmail],
    queryFn: async () => {
      if (!searchEmail) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .ilike("email", `%${searchEmail}%`)
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: searchEmail.length > 0,
  });

  const handleSuccess = () => {
    // Solo limpiar el formulario, manteniendo el creador seleccionado
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buscar Creador</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {!selectedCreator && (
            <div className="space-y-2">
              <Label>Correo del Creador</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por correo electrónico"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          )}

          {searchLoading && <div>Buscando...</div>}

          {!selectedCreator && searchResults && searchResults.length > 0 && (
            <div className="border rounded-md">
              {searchResults.map((creator) => (
                <div
                  key={creator.id}
                  className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                  onClick={() => onCreatorSelect(creator)}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{creator.email}</span>
                  </div>
                  {creator.full_name && (
                    <span className="text-sm text-muted-foreground">
                      {creator.full_name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedCreator && (
            <div className="flex justify-between items-center p-4 bg-muted rounded-md">
              <div>
                <p className="font-medium">Creador seleccionado:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCreator.email}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onCreatorSelect(null)}>
                Cambiar
              </Button>
            </div>
          )}

          <CreatorRateForm 
            selectedCreator={selectedCreator} 
            onSuccess={handleSuccess}
          />
        </div>
      </CardContent>
    </Card>
  );
}
