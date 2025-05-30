
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ProjectFormCardProps {
  onSubmit?: (data: { name: string; description: string }) => void;
  initialData?: {
    name: string;
    description: string;
  };
  title?: string;
  isSubmitting?: boolean;
}

export function ProjectFormCard({ 
  onSubmit, 
  initialData, 
  title = "Información del Proyecto",
  isSubmitting = false 
}: ProjectFormCardProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("El nombre del proyecto es requerido");
      return;
    }

    onSubmit?.(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nombre del Proyecto *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre del proyecto"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descripción
            </Label>
            <Input
              id="description"
              name="description"
              type="text"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descripción del proyecto (opcional)"
              className="w-full"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6"
            >
              {isSubmitting ? "Guardando..." : "Guardar Proyecto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
