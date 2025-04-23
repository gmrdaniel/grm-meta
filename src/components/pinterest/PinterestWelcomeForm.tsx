import React, { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Instagram, Phone } from "lucide-react";
import { CreatorInvitation } from "@/types/invitation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countryPhoneCodes } from "@/utils/countryPhoneCodes";

interface PinterestWelcomeFormProps {
  invitation: CreatorInvitation;
  formData: {
    fullName: string;
    email: string;
    socialMediaHandle: string;
    termsAccepted: boolean;
    phoneNumber: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (checked: boolean) => void;
  onContinue: () => void;
  isSubmitting?: boolean;
}

export const PinterestWelcomeForm: React.FC<PinterestWelcomeFormProps> = ({
  invitation,
  formData,
  onInputChange,
  onCheckboxChange,
  onContinue,
  isSubmitting = false,
}) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState("+52");
  const [showCustomCode, setShowCustomCode] = useState(false);
  const [customCode, setCustomCode] = useState("");

  const handleCountryCodeChange = (value: string) => {
    if (value === "custom") {
      setShowCustomCode(true);
      setSelectedCountryCode("");
    } else {
      setShowCustomCode(false);
      setSelectedCountryCode(value);
    }
  };

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
            <Label htmlFor="phoneNumber" className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Número de Teléfono
            </Label>
            <div className="flex gap-2">
              {showCustomCode ? (
                <Input
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="w-24"
                  placeholder="+000"
                />
              ) : (
                <Select onValueChange={handleCountryCodeChange} defaultValue={selectedCountryCode}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryPhoneCodes.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name} {country.code !== "custom" && `(${country.code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={onInputChange}
                placeholder="Tu número de teléfono"
                className="flex-1"
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
