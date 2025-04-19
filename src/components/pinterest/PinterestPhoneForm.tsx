
import React, { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PinterestPhoneFormProps {
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const PinterestPhoneForm: React.FC<PinterestPhoneFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [phoneData, setPhoneData] = useState({
    phoneCountryCode: "+52",
    phoneNumber: "",
  });

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

  const handleSubmit = () => {
    if (!phoneData.phoneNumber || phoneData.phoneNumber.length < 10) {
      return;
    }
    onSubmit();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-[#C2185B] mb-4">
        ¡FELICIDADES YA ESTÁS DEL SORTEO!
      </h2>
      <p className="text-center text-gray-700 mb-6">
        Ya estás en el sorteo, para verificar si ganaste termina de crear tu cuenta verificando tu número de teléfono.
      </p>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">NÚMERO DE TELÉFONO</Label>
        <div className="flex gap-2 mb-2">
          <Input
            id="phoneCountryCode"
            name="phoneCountryCode"
            value={phoneData.phoneCountryCode}
            onChange={handleInputChange}
            className="w-20"
          />
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={phoneData.phoneNumber}
            onChange={handleInputChange}
            placeholder="Número de teléfono"
            className="flex-1"
            type="tel"
          />
        </div>

        <Button
          variant="default"
          size="lg"
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !phoneData.phoneNumber || phoneData.phoneNumber.length < 10}
          className="w-full bg-[#C2185B] hover:bg-[#A01648] mt-4"
        >
          ENVIAR CÓDIGO
        </Button>
      </div>
    </div>
  );
};
