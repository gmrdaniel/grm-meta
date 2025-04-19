
import React, { useState, useEffect } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";

interface PinterestPhoneVerificationFormProps {
  onSubmit: () => void;
  isSubmitting: boolean;
  invitationId?: string;
}

export const PinterestPhoneVerificationForm: React.FC<PinterestPhoneVerificationFormProps> = ({
  onSubmit,
  isSubmitting,
  invitationId,
}) => {
  const [phoneData, setPhoneData] = useState({
    phoneCountryCode: "+52",
    phoneNumber: "",
    phoneVerified: false,
  });

  const [verificationStep, setVerificationStep] = useState<"input" | "verification">("input");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      setPhoneData({
        ...phoneData,
        [name]: value.replace(/[^0-9]/g, ""),
      });
    } else {
      setPhoneData({
        ...phoneData,
        [name]: value,
      });
    }
  };

  const handleSendVerificationCode = async () => {
    if (!phoneData.phoneNumber || phoneData.phoneNumber.length < 10) {
      toast.error("Por favor ingresa un número de teléfono válido");
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke("verify-phone", {
        body: {
          action: "send",
          phoneNumber: phoneData.phoneNumber,
          countryCode: phoneData.phoneCountryCode,
        },
      });

      if (error) {
        console.error("Error al enviar código de verificación:", error);
        setError(error.message || "Error al enviar código de verificación");
        toast.error("Error al enviar código de verificación");
        return;
      }

      if (data.success) {
        toast.success("Código de verificación enviado a tu teléfono");
        setVerificationStep("verification");
        setCountdown(600);
      } else {
        setError(data.message || "Error al enviar código de verificación");
        toast.error(data.message || "Error al enviar código de verificación");
      }
    } catch (err) {
      console.error("Error en el proceso de verificación:", err);
      setError("Ocurrió un error inesperado. Por favor intenta de nuevo.");
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 4) {
      toast.error("Por favor ingresa el código de 4 dígitos");
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke("verify-phone", {
        body: {
          action: "verify",
          phoneNumber: phoneData.phoneNumber,
          countryCode: phoneData.phoneCountryCode,
          verificationCode,
          invitationId,
        },
      });

      if (error) {
        console.error("Error al verificar código:", error);
        setError(error.message || "Error al verificar código");
        toast.error("Error al verificar código");
        return;
      }

      if (data.success) {
        toast.success("Teléfono verificado exitosamente");
        setPhoneData({
          ...phoneData,
          phoneVerified: true,
        });
        onSubmit();
      } else {
        setError(data.message || "Código de verificación inválido");
        toast.error(data.message || "Código de verificación inválido");
      }
    } catch (err) {
      console.error("Error en el proceso de verificación:", err);
      setError("Ocurrió un error inesperado. Por favor intenta de nuevo.");
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = () => {
    setVerificationCode("");
    handleSendVerificationCode();
  };

  return (
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center text-[#C2185B] mb-4">
          ¡FELICIDADES YA ESTÁS DEL SORTEO!
        </h2>
        <p className="text-center text-gray-700 mb-6">
          Ya estás en el sorteo, para verificar si ganaste termina de crear tu cuenta verificando tu número de teléfono 
          colocando el código de verificación que te enviamos en la casilla.
        </p>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">NÚMERO DE TELÉFONO</Label>

          {verificationStep === "input" ? (
            <div>
              <div className="flex gap-2 mb-2">
                <Input
                  id="phoneCountryCode"
                  name="phoneCountryCode"
                  value={phoneData.phoneCountryCode}
                  onChange={handleInputChange}
                  className="w-20"
                  readOnly={phoneData.phoneVerified}
                />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={phoneData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Número de teléfono"
                  className="flex-1"
                  type="tel"
                  readOnly={phoneData.phoneVerified}
                />
              </div>

              {!phoneData.phoneVerified && (
                <Button
                  variant="default"
                  size="lg"
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={isVerifying || !phoneData.phoneNumber || phoneData.phoneNumber.length < 10}
                  className="w-full bg-[#C2185B] hover:bg-[#A01648] mt-4"
                >
                  {isVerifying ? "Enviando..." : "ENVIAR CÓDIGO"}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">CÓDIGO DE VERIFICACIÓN</Label>
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
                {countdown > 0 && (
                  <p className="text-sm text-center text-gray-500">
                    El código expira en: {formatTime(countdown)}
                  </p>
                )}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setVerificationStep("input");
                    setVerificationCode("");
                    setCountdown(0);
                  }}
                >
                  Regresar
                </Button>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleResendCode}
                    disabled={isVerifying || countdown > 540}
                  >
                    Reenviar Código
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleVerifyCode}
                    disabled={verificationCode.length !== 4 || isVerifying}
                    className="bg-[#C2185B] hover:bg-[#A01648]"
                  >
                    {isVerifying ? "Verificando..." : "VERIFICAR"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  );
};
