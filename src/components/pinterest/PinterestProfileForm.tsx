
import React from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

interface PinterestProfileFormProps {
  profileData: {
    pinterestUrl: string;
    contentTypes: string[];
    isConnected: boolean;
    isAutoPublishEnabled: boolean;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentTypeChange: (value: string, checked: boolean) => void;
  onCheckboxChange: (key: 'isConnected' | 'isAutoPublishEnabled', checked: boolean) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const PinterestProfileForm: React.FC<PinterestProfileFormProps> = ({
  profileData,
  onInputChange,
  onContentTypeChange,
  onCheckboxChange,
  onSubmit,
  isSubmitting = false,
}) => {
  const contentTypes = [
    { id: "decoracion", label: "DECORACIÓN" },
    { id: "belleza", label: "BELLEZA" },
    { id: "bodas", label: "BODAS" },
    { id: "lifestyle", label: "LIFESTYLE" },
    { id: "recetas", label: "RECETAS" },
    { id: "viajes", label: "VIAJES" },
    { id: "moda", label: "MODA" },
    { id: "bienestar", label: "BIENESTAR" },
    { id: "otra", label: "OTRA" },
  ];

  return (
    <CardContent className="space-y-6 pt-4">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-center text-[#C2185B] mb-4">
            ¡EXCELENTE! AHORA CREA TU PERFIL DE PINTEREST
          </h2>
          <p className="text-center text-gray-700 mb-6">
            Crea tu perfil de Pinterest y compártelo con nosotros. Recuerda también conectar este nuevo perfil con tu Instagram y activar la opción de autopublicación. ¡Es muy fácil!
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pinterestUrl">NUEVO PERFIL DE PINTEREST</Label>
          <Input
            id="pinterestUrl"
            name="pinterestUrl"
            value={profileData.pinterestUrl}
            onChange={onInputChange}
            className="border-pink-100 focus-visible:ring-pink-200"
            placeholder="Tu URL de Pinterest"
          />
          <div className="text-xs text-blue-600 hover:underline">
            <Link to="#">APRENDE CÓMO HACERLO PASO A PASO AQUÍ</Link>
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-medium text-[#C2185B]">
            ¡QUEREMOS SABER MÁS DE TI! DINOS QUÉ TIPO DE CONTENIDO PUBLICAS. PUEDES MARCAR TODAS LAS OPCIONES QUE APLIQUEN:
          </p>
          <div className="grid grid-cols-2 gap-4">
            {contentTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={profileData.contentTypes.includes(type.id)}
                  onCheckedChange={(checked) => onContentTypeChange(type.id, checked as boolean)}
                  className="border-pink-300 text-pink-600 rounded-sm"
                />
                <label
                  htmlFor={type.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <p className="font-medium text-[#C2185B]">
            AHORA CONECTA EN TU CUENTA DE INSTAGRAM EN TU NUEVA CUENTA DE PINTEREST !
          </p>
          <div className="text-xs text-blue-600 hover:underline">
            <Link to="#">APRENDE CÓMO AQUÍ</Link>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isConnected"
              checked={profileData.isConnected}
              onCheckedChange={(checked) => onCheckboxChange('isConnected', checked as boolean)}
              className="border-pink-300 text-pink-600"
            />
            <div className="space-y-1">
              <label
                htmlFor="isConnected"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" >
               CONFIRMO QUE HE CONECTADO MI CUENTA DE INSTAGRAM A PINTEREST
              </label>
            </div>
          </div>

        <div className="space-y-4">
          <p className="font-medium text-[#C2185B]">
            FINALMENTE, ACTIVA AUTO PUBLICACIÓN DE TUS POSTEOS DE INSTAGRAM EN PINTEREST.
          </p>
          <div className="text-xs text-blue-600 hover:underline">
            <Link to="#">APRENDE CÓMO AQUÍ</Link>
          </div>
        </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAutoPublishEnabled"
              checked={profileData.isAutoPublishEnabled}
              onCheckedChange={(checked) => onCheckboxChange('isAutoPublishEnabled', checked as boolean)}
              className="border-pink-300 text-pink-600"
            />
            <div className="space-y-1">
              <label
                htmlFor="isAutoPublishEnabled"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                HE ACTIVADO LA AUTO PUBLICACIÓN DE POSTS DE INSTAGRAM EN PINTEREST
              </label>
            </div>
          </div>
        </div>
      </div>

      <CardFooter className="flex justify-end px-0">
        <Button
          onClick={onSubmit}
          className="bg-[#C2185B] hover:bg-[#A01648] text-white w-full"
        >
          {isSubmitting ? "Guardando..." : "GUARDAR Y CONTINUAR"}
        </Button>
      </CardFooter>
    </CardContent>
  );
};
