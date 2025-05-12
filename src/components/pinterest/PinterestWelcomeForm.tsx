import React, { useState, useEffect } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Instagram, Shield } from "lucide-react";
import { CreatorInvitation } from "@/types/invitation";
import { TermsCheckbox } from "../terms-and-conditions/TermsAndConditions";
import { PhoneValidate } from "@/components/phoneValidate/PhoneValidate";

import { CountrySelect } from "@/components/pinterest/CountrySelect";
import { fetchCountries } from "@/services/project/countryService";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PinterestWelcomeFormProps {
  invitation: CreatorInvitation;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    instagramUser: string;
    termsAccepted: boolean;
    phoneNumber: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (checked: boolean) => void;
  onContinue: (
    formData: PinterestWelcomeFormProps["formData"] & {
      phoneCountryCode: string;
      phoneVerified: boolean;
    }
  ) => void;
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
    instagramUser?: string;
    residenceCountryId?: string;
    phoneNumber?: string;
    termsAccepted?: string;
  }>({});
  const [countries, setCountries] = useState<
    { country_id: string; countries: { name_es: string; phone_code: string } }[]
  >([]);
  const [residenceCountryId, setResidenceCountryId] = useState<
    string | undefined
  >(undefined);
  const [localPhoneCountryCode, setLocalPhoneCountryCode] =
    useState<string>("");
  const [verificationStep, setVerificationStep] = useState<
    "input" | "verification"
  >("input");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(invitation.phone_verified || false);
  const [localPhoneNumber, setLocalPhoneNumber] = useState(
    formData.phoneNumber
  );

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

  // Handle countdown timer for OTP expiration
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Format countdown as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleResidenceCountryChange = (
    countryId: string,
    phoneCode: string
  ) => {
    setResidenceCountryId(countryId);

    // Call handleInputChange manually
    handleInputChange({
      target: { name: 'countryOfResidenceId', value: countryId },
    } as React.ChangeEvent<HTMLInputElement>);

  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const isValidName = (name: string) => {
      const normalized = name.trim().replace(/\s+/g, ' ');
      const nameRegex = /^[a-zA-ZÀ-ÿ' -]{2,}$/;
      return nameRegex.test(normalized);
    };
    if (name === "firstName" || name === "lastName") {
      const isValid = isValidName(value);
      setFormErrors((prev) => ({
        ...prev,
        [name]: isValid
          ? undefined
          : "Must be at least 2 letters. No special characters.",
      }));
    } else if (name === "phoneNumber") {
      setLocalPhoneNumber(value.replace(/\D/g, ""));
    } else {
      onInputChange(e);
    }

    onInputChange(e); // Call the parent function to update the form data
  };


  const handleAcceptTerms = () => {
    onCheckboxChange(true);
  };

  const handleSendVerificationCode = async () => {
    if (!localPhoneNumber || localPhoneNumber.length < 9) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke("verify-phone", {
        body: {
          action: "send",
          phoneNumber: localPhoneNumber,
          countryCode: localPhoneCountryCode
        },
      });

      if (error) {
        console.error("Error sending verification code:", error);
        setError(error.message || "Failed to send verification code");
        toast.error("Failed to send verification code");
        return;
      }

      if (data?.success) {
        toast.success("Verification code sent to your phone");
        setVerificationStep("verification");
        setCountdown(600); // 10-minute countdown (Twilio default)
      } else {
        setError(data?.message || "Failed to send verification code");
        toast.error(data?.message || "Failed to send verification code");
      }
    } catch (err) {
      console.error("Error in verification process:", err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred");
    } finally {
      setIsVerifying(false);
    }
  }

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 4) {
      toast.error("Please enter the 4-digit verification code");
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke("verify-phone", {
        body: {
          action: "verify",
          phoneNumber: localPhoneNumber,
          countryCode: localPhoneCountryCode,
          verificationCode,
          invitationId: invitation.id,
        },
      });

      if (error) {
        console.error("Error verifying code:", error);
        setError(error.message || "Failed to verify code");
        toast.error("Failed to verify code");
        return;
      }

      if (data?.success) {
        toast.success("Phone verified successfully");
        setPhoneVerified(true);
        setVerificationStep("input");
      } else {
        setError(data?.message || "Invalid verification code");
        toast.error(data?.message || "Invalid verification code");
      }
    } catch (err) {
      console.error("Error in verification process:", err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = () => {
    setVerificationCode("");
    handleSendVerificationCode();
  };

  return (
    <>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Nombre"
              className={formErrors.firstName ? "border-red-500" : ""}
            />
            {formErrors.firstName && (
              <p className="text-xs text-red-500">{formErrors.firstName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Apellido"
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
              className="bg-gray-50 border-blue-100"
              placeholder="tu@correo.com"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="instagramUser"
              className="flex items-center gap-2"
            >
              <Instagram className="h-4 w-4" /> Usuario de Instagram
            </Label>
            <div className="relative">
              <Input
                id="instagramUser"
                name="instagramUser"
                value={formData.instagramUser}
                onChange={onInputChange}
                placeholder="usuario"
                className="pl-8 border-blue-100 focus-visible:ring-blue-200"
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="residenceCountry">País de residencia</Label>
            <CountrySelect
              onSelect={handleResidenceCountryChange}
              placeholder="País de residencia"
              value={residenceCountryId}
              countries={countries.map((c) => ({
                id: c.country_id,
                name_es: c.countries.name_es,
                phone_code: c.countries.phone_code,
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center gap-2">
              {phoneVerified && (
                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  <Shield className="mr-1 h-3 w-3" /> Verificado
                </span>
              )}
            </Label>
            {verificationStep === "input" ? (
              <div>
                <PhoneValidate
                  countries={countries.map((c) => ({
                    country_id: c.country_id,
                    countries: {
                      name_es: c.countries.name_es,
                      phone_code: c.countries.phone_code,
                    },
                  }))}
                  phoneNumber={localPhoneNumber}
                  onPhoneNumberChange={(value) => setLocalPhoneNumber(value)}
                  onPhoneCodeChange={setLocalPhoneCountryCode}
                  selectedPhoneCode={localPhoneCountryCode}
                />
                {!phoneVerified && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={
                      isVerifying ||
                      !localPhoneNumber ||
                      localPhoneNumber.length < 9
                    }
                    className="mt-2"
                  >
                    {isVerifying
                      ? "Enviando..."
                      : "Verificar número de teléfono"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4 p-4 border rounded-md bg-gray-50">
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Verification Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="verification-code">
                    Introduce el código de verificación de 4 dígitos.
                  </Label>
                  <div className="flex justify-center py-4">
                    <InputOTP
                      maxLength={4}
                      value={verificationCode}
                      onChange={setVerificationCode}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <div className="text-sm text-center space-y-2">
                    <p className="text-muted-foreground">
                      Enviamos un código a {localPhoneCountryCode}-
                      {localPhoneNumber}
                    </p>
                    {countdown > 0 && (
                      <p className="text-muted-foreground">
                        El código expira en:{" "}
                        <span className="font-medium">
                          {formatTime(countdown)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVerificationStep("input");
                      setVerificationCode("");
                      setCountdown(0);
                    }}
                  >
                    Cancelar
                  </Button>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendCode}
                      disabled={isVerifying || countdown > 540}
                    >
                      Reenviar código
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleVerifyCode}
                      disabled={verificationCode.length !== 4 || isVerifying}
                      className="bg-blue-100 hover:bg-blue-300 text-black"
                    >
                      {isVerifying ? "Verificando..." : "Verificar"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <TermsCheckbox

              formData={formData}
              onCheckboxChange={onCheckboxChange}
              onAcceptTerms={handleAcceptTerms}
              formType="pinterest"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          onClick={() =>
            onContinue({
              ...formData,
              phoneCountryCode: localPhoneCountryCode,
              phoneNumber: localPhoneNumber,
              phoneVerified: phoneVerified,
            })
          }
          disabled={!formData.termsAccepted || isSubmitting || !phoneVerified}
          className="text-white"
        >
          {isSubmitting ? "Procesando..." : "Siguiente"}
        </Button>
      </CardFooter>
    </>
  );
};
