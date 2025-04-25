import React from "react";
import { useState, useEffect } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Instagram, Phone } from "lucide-react";
import { CreatorInvitation } from "@/types/invitation";
import { TermsCheckboxPinterest } from "../terms-and-conditions/TermsAndConditionsPinterest";
import { PhoneValidate } from "@/components/phoneValidate/PhoneValidate";
import { fetchCountries, supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface PinterestWelcomeFormProps {
  invitation: CreatorInvitation;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    socialMediaHandle: string;
    termsAccepted: boolean;
    phoneNumber: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (checked: boolean) => void;
  onContinue: () => void;
  isSubmitting?: boolean;
  phoneCountryCode: string; // Nueva prop
  onPhoneCodeChange: (code: string) => void; // Nueva prop
}

export const PinterestWelcomeForm: React.FC<PinterestWelcomeFormProps> = ({
  invitation,
  formData,
  onInputChange,
  onCheckboxChange,
  onContinue,
  isSubmitting = false,
  phoneCountryCode, // Recibir la prop
  onPhoneCodeChange, // Recibir la prop
}) => {
  const [formErrors, setFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [countries, setCountries] = useState<any[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(
    undefined
  );

  const [residenceCountry, setResidenceCountry] = useState("");

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const isValidName = (name: string) => {
      const nameRegex = /^[a-zA-ZÀ-ÿ'-]{2,}$/; // permite letras, espacios, apóstrofes y guiones
      return nameRegex.test(name.trim());
    };

    // Validar solo firstName y lastName
    if (name === "firstName" || name === "lastName") {
      const isValid = isValidName(value);

      setFormErrors((prev) => ({
        ...prev,
        [name]: isValid
          ? undefined
          : "Must be at least 2 letters. No spaces or special characters.",
      }));
    }
  };

  const handleAcceptTerms = () => {
    onCheckboxChange(true); // Marca el checkbox de términos y condiciones
  };

  useEffect(() => {
    const loadCountries = async () => {
      if (invitation.project_id) {
        const countriesData = await fetchCountries(invitation.project_id);
        console.log("Países permitidos por proyecto:", countriesData);
        setCountries(countriesData);
      }
    };

    loadCountries();
  }, [invitation.project_id]);

  return (
    <>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={onInputChange}
              placeholder="Your first name"
              className={formErrors.firstName ? "border-red-500" : ""}
            />
            {formErrors.firstName && (
              <p className="text-xs text-red-500">{formErrors.firstName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Your last name"
              className={formErrors.lastName ? "border-red-500" : ""}
            />
            {formErrors.lastName && (
              <p className="text-xs text-red-500">{formErrors.lastName}</p>
            )}
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
            <Label
              htmlFor="socialMediaHandle"
              className="flex items-center gap-2"
            >
              <Instagram className="h-4 w-4" /> Usuario de Instagram
            </Label>
            <div className="relative">
              <Input
                id="socialMediaHandle"
                name="socialMediaHandle"
                value={formData.socialMediaHandle}
                onChange={onInputChange}
                placeholder="usuario"
                className="pl-8 border-pink-100 focus-visible:ring-pink-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="residenceCountry">pais de residencia</Label>
            <Select
             value={residenceCountry}
             onValueChange={setResidenceCountry}
            >
              <SelectTrigger className="w-full border border-pink-400 rounded-md px-4 py-2 text-black focus:outline-none focus:ring-0 focus:border-pink-500">
                <SelectValue placeholder="Selecciona el código de país" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-md shadow-lg mt-1 w-full">
                {countries.map((item) => (
                  <SelectItem
                    key={item.country_id}
                    value={`+${item.countries.phone_code}`}
                    className="px-4 py-2 text-black hover:bg-pink-200"
                  >
                    <span className="pl-3">{item.countries.name_es}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phoneNumber"
              className="flex items-center gap-2"
            ></Label>
            <PhoneValidate
              countries={countries}
              selectedPhoneCode={phoneCountryCode}
              onPhoneCodeChange={onPhoneCodeChange}
              phoneNumber={formData.phoneNumber}
              onPhoneNumberChange={(value) => {
                const syntheticEvent = {
                  target: {
                    name: "phoneNumber",
                    value,
                  },
                } as React.ChangeEvent<HTMLInputElement>;
                onInputChange(syntheticEvent);
              }}
            />
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <TermsCheckboxPinterest
              formData={formData}
              onCheckboxChange={onCheckboxChange}
              onAcceptTerms={handleAcceptTerms}
            />
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