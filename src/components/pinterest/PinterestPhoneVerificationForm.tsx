
import React, { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PinterestVerificationSuccess } from "./PinterestVerificationSuccess";

interface PinterestPhoneVerificationFormProps {
  onSubmit: () => void;
  isSubmitting: boolean;
  invitationId?: string;
}

export const PinterestPhoneVerificationForm: React.FC<PinterestPhoneVerificationFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Por favor ingresa un número de teléfono válido");
      return;
    }

    try {
      // Simulate verification success
      toast.success("Teléfono verificado exitosamente");
      setIsVerified(true);
      onSubmit();
    } catch (err) {
      console.error("Error en verificación:", err);
      toast.error("Ocurrió un error inesperado");
    }
  };

  if (isVerified) {
    return <PinterestVerificationSuccess />;
  }

  return (
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center text-[#C2185B] mb-4">
          VERIFICA TU NÚMERO
        </h2>
        <p className="text-center text-gray-700 mb-6">
          Para completar tu perfil, necesitamos verificar tu número de teléfono.
        </p>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">NÚMERO DE TELÉFONO</Label>
          <div className="flex gap-2">
            <Input
              value="+52"
              className="w-20"
              readOnly
            />
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Número de teléfono"
              className="flex-1"
              type="tel"
            />
          </div>

          <Button
            variant="default"
            size="lg"
            onClick={handleVerify}
            disabled={isSubmitting || !phoneNumber || phoneNumber.length < 10}
            className="w-full bg-[#C2185B] hover:bg-[#A01648] mt-4"
          >
            {isSubmitting ? "Verificando..." : "VERIFICAR NÚMERO"}
          </Button>
        </div>
      </div>
    </CardContent>
  );
};
