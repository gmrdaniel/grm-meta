import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Instagram } from "lucide-react";
import { CreatorInvitation } from "@/types/invitation";
import { TermsCheckboxPinterest } from "../terms-and-conditions/TermsAndConditionsPinterest";
import { PhoneValidate } from "@/components/phoneValidate/PhoneValidate"; 
import { fetchCountries } from "@/integrations/supabase/client";
import { CountrySelect } from "@/components/pinterest/CountrySelect";

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
  onContinue: (formData: PinterestWelcomeFormProps['formData'] & { phoneCountryCode: string }) => void; 
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
  const [formErrors, setFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});

  const [countries, setCountries] = useState<
    { country_id: string; countries: { name_es: string; phone_code: string } }[]
  >([]);
  const [residenceCountryId, setResidenceCountryId] = useState<
    string | undefined
  >(undefined);
  const [residencePhoneCode, setResidencePhoneCode] = useState<
    string | undefined
  >(undefined);
  const [localPhoneCountryCode, setLocalPhoneCountryCode] = useState<string>("");

  const handleResidenceCountryChange = (
    countryId: string,
    phoneCode: string
  ) => {
    setResidenceCountryId(countryId);
    setResidencePhoneCode(phoneCode);
    console.log("País de residencia seleccionado:", countryId, phoneCode);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const isValidName = (name: string) => {
      const nameRegex = /^[a-zA-ZÀ-ÿ'-]{2,}$/;
      return nameRegex.test(name.trim());
    };

    if (name === "firstName" || name === "lastName") {
      const isValid = isValidName(value);
      setFormErrors((prev) => ({
        ...prev,
        [name]: isValid
          ? undefined
          : "Must be at least 2 letters. No spaces or special characters.",
      }));
    } else {
      onInputChange(e);
    }
  };

  const handleAcceptTerms = () => {
    onCheckboxChange(true);
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
            <CountrySelect
              onSelect={handleResidenceCountryChange}
              placeholder="Selecciona el país de residencia"
              value={residenceCountryId}
              countries={countries.map((c) => ({
                id: c.country_id,
                name_es: c.countries.name_es,
                phone_code: c.countries.phone_code,
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phoneNumber"
              className="flex items-center gap-2"
            ></Label>
            <PhoneValidate
              countries={countries.map((c) => ({
                country_id: c.country_id,
                countries: {
                  name_es: c.countries.name_es,
                  phone_code: c.countries.phone_code,
                },
              }))}
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
              onPhoneCodeChange={setLocalPhoneCountryCode}
              selectedPhoneCode={localPhoneCountryCode} // ADICIÓN: Pasamos el selectedPhoneCode
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
          onClick={() => onContinue({ ...formData, phoneCountryCode: localPhoneCountryCode })} // MODIFICACIÓN: Pasamos el objeto completo a onContinue
          disabled={!formData.termsAccepted || isSubmitting}
          className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
        >
          {isSubmitting ? "Procesando..." : "Siguiente"}
        </Button>
      </CardFooter>
    </>
  );
};