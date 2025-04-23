
import React from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Instagram, Phone, MapPin } from "lucide-react";
import { CreatorInvitation } from "@/types/invitation";
import { CountrySelector } from "@/components/ui/country-selector";

interface PinterestWelcomeFormProps {
  invitation: CreatorInvitation;
  formData: {
    fullName: string;
    email: string;
    socialMediaHandle: string;
    termsAccepted: boolean;
    phoneNumber: string;
    phoneCountryCode?: string;
    residenceCountryId?: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (checked: boolean) => void;
  onCountrySelect: (type: 'phone' | 'residence', country: any) => void;
  onContinue: () => void;
  isSubmitting?: boolean;
}

export const PinterestWelcomeForm: React.FC<PinterestWelcomeFormProps> = ({
  invitation,
  formData,
  onInputChange,
  onCheckboxChange,
  onCountrySelect,
  onContinue,
  isSubmitting = false,
}) => {
  return (
    <>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={onInputChange}
              placeholder="Tu nombre completo"
              className="border-pink-100 focus-visible:ring-pink-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              readOnly
              className="bg-gray-50 border-pink-100"
              placeholder="tu@correo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialMediaHandle" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" /> Usuario de Instagram
            </Label>
            <Input
              id="socialMediaHandle"
              name="socialMediaHandle"
              value={formData.socialMediaHandle}
              onChange={onInputChange}
              placeholder="@usuario"
              className="border-pink-100 focus-visible:ring-pink-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="residenceCountry" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> País de Residencia
            </Label>
            <CountrySelector
              type="residence"
              placeholder="Selecciona tu país"
              onSelect={(country) => onCountrySelect('residence', country)}
              selectedCountry={formData.residenceCountryId ? {
                id: formData.residenceCountryId,
                name_es: "",
                name_en: "",
                phone_code: ""
              } : null}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Número de Teléfono
            </Label>
            <div className="flex gap-2">
              <div className="w-36">
                <CountrySelector
                  type="phone"
                  placeholder="+00"
                  onSelect={(country) => onCountrySelect('phone', country)}
                  selectedCountry={formData.phoneCountryCode ? {
                    id: "",
                    name_es: "",
                    name_en: "",
                    phone_code: formData.phoneCountryCode
                  } : null}
                />
              </div>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={onInputChange}
                placeholder="Tu número de teléfono"
                className="flex-1 border-pink-100 focus-visible:ring-pink-200"
                type="tel"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <Checkbox
              id="termsAccepted"
              checked={formData.termsAccepted}
              onCheckedChange={onCheckboxChange}
              className="border-pink-300 text-pink-600"
            />
            <label
              htmlFor="termsAccepted"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Acepto los{" "}
              <a href="#" className="text-pink-600 hover:underline">
                términos y condiciones
              </a>
            </label>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          onClick={onContinue}
          disabled={!formData.termsAccepted || isSubmitting}
          className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
        >
          {isSubmitting ? "Procesando..." : "Siguiente"}
        </Button>
      </CardFooter>
    </>
  );
};
