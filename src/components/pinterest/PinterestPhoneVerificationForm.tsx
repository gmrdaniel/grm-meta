
import React, { useState, useEffect } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Phone } from "lucide-react";
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

      const { data, error } = await supabase.functions.invoke("verify-phone", {
        body: {
          action: "send",
          phoneNumber: phoneData.phoneNumber,
          countryCode: phoneData.phoneCountryCode,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Código de verificación enviado a tu teléfono");
        setVerificationStep("verification");
        setCountdown(600); // 10 minutes
      } else {
        toast.error(data.message || "Error al enviar código de verificación");
      }
    } catch (err) {
      console.error("Error en el proceso de verificación:", err);
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

      const { data, error } = await supabase.functions.invoke("verify-phone", {
        body: {
          action: "verify",
          phoneNumber: phoneData.phoneNumber,
          countryCode: phoneData.phoneCountryCode,
          verificationCode,
          invitationId,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Teléfono verificado exitosamente");
        setPhoneData({ ...phoneData, phoneVerified: true });
        onSubmit();
      } else {
        toast.error(data.message || "Código de verificación inválido");
      }
    } catch (err) {
      console.error("Error en el proceso de verificación:", err);
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          <Label className="text-lg font-medium">Phone Number</Label>
        </div>

        {verificationStep === "input" ? (
          <div className="space-y-4">
            <div className="flex gap-2">
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
                onClick={handleSendVerificationCode}
                disabled={isVerifying || !phoneData.phoneNumber || phoneData.phoneNumber.length < 10}
                className="w-full bg-[#C2185B] hover:bg-[#A01648]"
              >
                {isVerifying ? "Enviando..." : "Enviar código"}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-base font-medium">Enter the 4-digit verification code</h3>
            
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

            <div className="text-center text-sm text-gray-600">
              We sent a code to {phoneData.phoneCountryCode} {phoneData.phoneNumber}
              {countdown > 0 && (
                <p className="mt-1">
                  Code expires in: {formatTime(countdown)}
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
                Back
              </Button>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={handleSendVerificationCode}
                  disabled={isVerifying || countdown > 540}
                >
                  Resend Code
                </Button>
                <Button
                  onClick={handleVerifyCode}
                  disabled={verificationCode.length !== 4 || isVerifying}
                  className="bg-[#7CB9E8] hover:bg-[#6AA9D8] text-white"
                >
                  Verify
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CardContent>
  );
};
