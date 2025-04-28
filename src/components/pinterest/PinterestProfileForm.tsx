import React, { useEffect, useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link } from "react-router-dom";
import { CreatorInvitation } from "@/types/invitation";
import { getContentCategoriesByProject } from "@/services/project/getContentCategoriesByProject";
import { ContentCategory } from "@/types/contentCategory";

interface PinterestProfileFormProps {
  invitation: CreatorInvitation;
  profileData: {
    pinterestUrl: string;
    contentTypes: string[];
    isConnected: boolean;
    isAutoPublishEnabled: boolean;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentTypeChange: (value: string, checked: boolean) => void;
  onCheckboxChange: (
    key: "isConnected" | "isAutoPublishEnabled",
    checked: boolean
  ) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const PinterestProfileForm: React.FC<PinterestProfileFormProps> = ({
  invitation,
  profileData,
  onInputChange,
  onContentTypeChange,
  onCheckboxChange,
  onSubmit,
  isSubmitting = false,
}) => {
  const [contentCategories, setContentCategories] = useState<ContentCategory[]>(
    []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadCountriesAndCategories = async () => {
      if (invitation.project_id) {
        const categoriesData = await getContentCategoriesByProject(
          invitation.project_id
        );
        setContentCategories(categoriesData);
      }
    };

    loadCountriesAndCategories();
  }, [invitation.project_id]);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, categoryId] : prev.filter((id) => id !== categoryId)
    );
  };

  return (
    <CardContent className="space-y-2 pt-4">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-center text-[#C2185B] mb-4">
            ¡Excelente! Ahora completa tu perfil de Pinterest
          </h2>
          <p className="text-xs text-gray-700 mb-6">
            Crea tu perfil de Pinterest y compártelo con nosotros. Recuerda
            también conectar este nuevo perfil con tu Instagram y activar la
            opción de autopublicación. ¡Es muy fácil!
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pinterestUrl">Nuevo perfil de Pinterest</Label>
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

        <div className="space-y-2 pt-4">
          <Label className="block mb-2">¿Qué tipo de contenido publicas?</Label>
          <div className="flex flex-wrap gap-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {contentCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) =>
                      handleCategoryChange(category.id, !!checked)
                    }
                  />
                  <Label htmlFor={`category-${category.id}`}>
                    {category.name_es}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isConnected"
            checked={profileData.isConnected}
            onCheckedChange={(checked) =>
              onCheckboxChange("isConnected", checked as boolean)
            }
            className="border-pink-300 text-pink-600"
          />
          <div className="space-y-1">
            <label
              htmlFor="isConnected"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Ahora conecta tu nueva cuenta de Pinterest con tu cuenta de Instagram
            </label>
            <div className="text-xs text-blue-600 hover:underline">
              <Link to="#">(Aprende Cómo Aquí)</Link>
            </div>
          </div>
        </div>

        <RadioGroup
          defaultValue="no"
          className="space-y-2"
          onValueChange={(value) => {
            const isConfirmed = value === "yes";
            onCheckboxChange("isConnected", isConfirmed);
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="instagram-connection-no" />
            <Label htmlFor="instagram-connection-no">
              AÚN NO HE CONECTADO MI CUENTA
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="instagram-connection-yes" />
            <Label htmlFor="instagram-connection-yes">
              CONFIRMA QUE HAS CONECTADO TU CUENTA DE INSTAGRAM A PINTEREST AQUÍ
            </Label>
          </div>
        </RadioGroup>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isAutoPublishEnabled"
            checked={profileData.isAutoPublishEnabled}
            onCheckedChange={(checked) =>
              onCheckboxChange("isAutoPublishEnabled", checked as boolean)
            }
            className="border-pink-300 text-pink-600"
          />
          <div className="space-y-1">
            <label
              htmlFor="isAutoPublishEnabled"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              HE ACTIVADO LA AUTOPUBLICACIÓN DE INSTAGRAM EN PINTEREST
            </label>
            <div className="text-xs text-blue-600 hover:underline">
              <Link to="#">APRENDE CÓMO AQUÍ</Link>
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
