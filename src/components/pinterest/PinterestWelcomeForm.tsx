
import React, { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CreatorInvitation } from "@/types/invitation";
import { Phone } from "lucide-react";

interface WelcomeFormProps {
  invitation: CreatorInvitation;
  formData: {
    fullName: string;
    email: string;
    socialMediaHandle: string;
    termsAccepted: boolean;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (checked: boolean) => void;
  onContinue: () => void;
  isSubmitting?: boolean;
}

export const PinterestWelcomeForm: React.FC<WelcomeFormProps> = ({
  invitation,
  formData,
  onInputChange,
  onCheckboxChange,
  onContinue,
  isSubmitting = false,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSendVerification = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Por favor ingresa un número de teléfono válido");
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch("/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          phoneNumber: phoneNumber,
          countryCode: "+52",
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Código de verificación enviado");
        setShowVerificationInput(true);
      } else {
        toast.error("Error al enviar el código de verificación");
      }
    } catch (err) {
      toast.error("Error al enviar el código de verificación");
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast.error("Por favor ingresa el código de verificación");
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch("/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          phoneNumber: phoneNumber,
          countryCode: "+52",
          verificationCode,
          invitationId: invitation.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Teléfono verificado exitosamente");
        setPhoneVerified(true);
      } else {
        toast.error("Código de verificación inválido");
      }
    } catch (err) {
      toast.error("Error al verificar el código");
    } finally {
      setVerifying(false);
    }
  };

  const handleContinue = () => {
    if (!formData.termsAccepted) {
      toast.error("Debes aceptar los términos y condiciones para continuar");
      return;
    }
    if (!phoneVerified) {
      toast.error("Debes verificar tu número de teléfono para continuar");
      return;
    }
    onContinue();
  };

  return (
    <>
      <CardContent className="space-y-6">
        <div className="mt-4 border-gray-200 pt-4">
          <h2 className="text-2xl font-bold text-gray-800">Crear cuenta de Pinterest</h2>
          <p className="text-gray-600">
            Has sido invitado a unirte al programa de creadores de Pinterest
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={onInputChange}
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              readOnly
              className="bg-gray-50"
            />
          </div>

          {invitation.social_media_type && (
            <div className="space-y-2">
              <Label htmlFor="socialMediaHandle">Usuario de Instagram</Label>
              <Input
                id="socialMediaHandle"
                name="socialMediaHandle"
                value={formData.socialMediaHandle}
                readOnly
                className="bg-gray-50"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Número de teléfono
              <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                value="+52"
                className="w-20"
                readOnly
              />
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Número de teléfono"
                className="flex-1"
                type="tel"
              />
              <Button
                type="button"
                onClick={handleSendVerification}
                disabled={verifying || phoneVerified || !phoneNumber || phoneNumber.length < 10}
              >
                {verifying ? "Enviando..." : "Verificar"}
              </Button>
            </div>
          </div>

          {showVerificationInput && !phoneVerified && (
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Código de verificación</Label>
              <div className="flex gap-2">
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Ingresa el código"
                />
                <Button
                  onClick={handleVerifyCode}
                  disabled={verifying || !verificationCode}
                >
                  {verifying ? "Verificando..." : "Confirmar"}
                </Button>
              </div>
            </div>
          )}

          {phoneVerified && (
            <div className="text-green-600 font-medium flex items-center gap-2">
              ✓ Número de teléfono verificado
            </div>
          )}

          <div className="flex items-center space-x-2 pt-4">
            <Checkbox
              id="termsAccepted"
              checked={formData.termsAccepted}
              onCheckedChange={onCheckboxChange}
            />
            <label
              htmlFor="termsAccepted"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Acepto los <a href="#" className="text-blue-600 hover:underline">términos y condiciones</a>
            </label>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleContinue} 
          disabled={!formData.termsAccepted || !phoneVerified || isSubmitting}
          className="bg-[#C2185B] hover:bg-[#A01648]"
        >
          {isSubmitting ? "Procesando..." : "Continuar"}
        </Button>
      </CardFooter>
    </>
  );
};
