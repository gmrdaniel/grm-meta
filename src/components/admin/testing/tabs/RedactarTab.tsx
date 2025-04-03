
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorDisplay from "@/components/admin/testing/ErrorDisplay";

export default function RedactarTab() {
  const [name, setName] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [description, setDescription] = useState("");
  const [invitationLink, setInvitationLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!name || !socialLink || !description || !invitationLink) {
      setError("Todos los campos son obligatorios");
      return;
    }
    
    console.log("Datos de invitación:", { name, socialLink, description, invitationLink });
    // Here you would add the actual submission logic
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Redactar invitación</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del creador"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="socialLink">Link de red social</Label>
            <Input 
              id="socialLink" 
              value={socialLink} 
              onChange={(e) => setSocialLink(e.target.value)}
              placeholder="https://tiktok.com/@username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción / Prompt</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción o instrucciones para la invitación"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invitationLink">Link de invitación</Label>
            <Input 
              id="invitationLink" 
              value={invitationLink} 
              onChange={(e) => setInvitationLink(e.target.value)}
              placeholder="https://example.com/invite/code"
            />
          </div>
          
          <ErrorDisplay error={error} />
          
          <Button type="submit" className="w-full">
            Generar invitación
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
