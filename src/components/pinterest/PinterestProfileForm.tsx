import React, { useEffect, useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CreatorInvitation } from "@/types/invitation";
import { getContentCategoriesByProject } from "@/services/project/getContentCategoriesByProject";
import { ContentCategory } from "@/types/contentCategory";
import { toast } from "sonner";

interface PinterestProfileFormProps {
  invitation: CreatorInvitation;
  profileData: {
    pinterestUrl: string;
    contentTypes: string[];
    isConnected: boolean;
    isAutoPublishEnabled: boolean;
  };
  setProfileData: React.Dispatch<
    React.SetStateAction<{
      pinterestUrl: string;
      contentTypes: string[];
      isConnected: boolean;
      isAutoPublishEnabled: boolean;
    }>
  >;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const PinterestProfileForm: React.FC<PinterestProfileFormProps> = ({
  invitation,
  profileData,
  setProfileData,
  onSubmit,
  isSubmitting = false,
}) => {
  const [contentCategories, setContentCategories] = useState<ContentCategory[]>(
    []
  );

  useEffect(() => {
    const loadCategories = async () => {
      if (invitation.project_id) {
        const categories = await getContentCategoriesByProject(
          invitation.project_id
        );
        setContentCategories(categories);
      }
    };
    loadCategories();
  }, [invitation.project_id]);

  const handlePinterestUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData((prev) => ({ ...prev, pinterestUrl: e.target.value }));
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setProfileData((prev) => {
      const updated = checked
        ? [...prev.contentTypes, categoryId]
        : prev.contentTypes.filter((id) => id !== categoryId);
      return { ...prev, contentTypes: updated };
    });
  };

  const handleCheckboxChange = (
    key: "isConnected" | "isAutoPublishEnabled",
    checked: boolean
  ) => {
    setProfileData((prev) => ({ ...prev, [key]: checked }));
  };
  
  const isValidPinterestUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username.trim());
  };

  const handleClick = () => {
    const { pinterestUrl, isConnected, isAutoPublishEnabled, contentTypes } =
      profileData;

    if (!isValidPinterestUsername(pinterestUrl)) {
      toast.error("Por favor ingresa una URL válida de Pinterest.");
      return;
    }

    if (!isConnected) {
      toast.error(
        "Debes confirmar que conectaste tu cuenta de Instagram a Pinterest."
      );
      return;
    }

    if (!isAutoPublishEnabled) {
      toast.error(
        "Debes activar la autopublicación desde Instagram a Pinterest."
      );
      return;
    }

    if (!contentTypes || contentTypes.length === 0) {
      toast.error("Selecciona al menos un tipo de contenido que publicas.");
      return;
    }

    onSubmit();
  };

  return (
    <CardContent className="space-y-2 pt-4">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-center text-[#C2185B] mb-4">
            ¡Excelente! Ahora completa tu perfil de Pinterest
          </h2>
          <p className="text-xs text-gray-700 mb-6">
            Crea tu perfil de Pinterest y compártelo con nosotros...
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pinterestUrl">Nuevo perfil de Pinterest</Label>
          <div className="relative w-full max-w-md">
            {/* Prefix */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              <span className="bg-slate-50 text-slate-500 text-sm px-3 py-2 rounded-l-md border border-r-0 border-pink-100">
                pinterest.com/
              </span>
            </div>
            <Input
              id="pinterestUrl"
              name="pinterestUrl"
              value={profileData.pinterestUrl}
              onChange={handlePinterestUrlChange}
              className="pl-[120px] border-pink-100 focus-visible:ring-pink-200 rounded-md transition-all shadow-sm placeholder:text-slate-400"
              placeholder="username"
            />
          </div>

          <div className="text-xs text-blue-600 hover:underline">
            <a
              href="https://help.pinterest.com/es/article/get-a-pinterest-account#section-18681"
              target="_blank"
              rel="noopener noreferrer"
            >
              Aprende cómo hacerlo paso a paso aquí
            </a>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <Label className="block mb-2">¿Qué tipo de contenido publicas?</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {contentCategories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={profileData.contentTypes.includes(category.id)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category.id, Boolean(checked))
                  }
                />
                <Label htmlFor={`category-${category.id}`}>
                  {category.name_es}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-2">
            <div className="space-y-1">
              <span className="text-sm font-medium">
                Ahora conecta tu nueva cuenta de Pinterest con tu cuenta de
                Instagram
              </span>
              <div className="text-xs text-blue-600 hover:underline">
                <a
                  href="https://help.pinterest.com/es/article/claim-your-account"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Aprende Cómo Aquí
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isConnected"
              checked={profileData.isConnected}
              onCheckedChange={(checked) =>
                handleCheckboxChange("isConnected", Boolean(checked))
              }
              className="border-pink-300 text-pink-600"
            />
            <label htmlFor="isConnected" className="text-sm font-medium">
              Confirmo que he conectado mi cuenta de Pinterest con mi cuenta de
              Instagram
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAutoPublishEnabled"
              checked={profileData.isAutoPublishEnabled}
              onCheckedChange={(checked) =>
                handleCheckboxChange("isAutoPublishEnabled", Boolean(checked))
              }
              className="border-pink-300 text-pink-600"
            />
            <div className="space-y-1">
              <label
                htmlFor="isAutoPublishEnabled"
                className="text-sm font-medium"
              >
                He activado la autopublicación de Instagram en Pinterest
              </label>
              <div className="text-xs text-blue-600 hover:underline">
                <a
                  href="https://create.pinterest.com/es-la/blog/connect-share-instagram-posts-to-pinterest/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Aprende cómo aquí
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CardFooter className="flex justify-end px-0">
        <Button
          onClick={handleClick}
          className="bg-[#C2185B] hover:bg-[#A01648] text-white w-full"
        >
          {isSubmitting ? "Guardando..." : "GUARDAR Y CONTINUAR"}
        </Button>
      </CardFooter>
    </CardContent>
  );
};
