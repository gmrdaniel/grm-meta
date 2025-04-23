
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const PinterestPhoneSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-2xl font-bold text-[#C2185B] mb-4">
        ¡FELICIDADES YA ESTÁS DEL SORTEO!
      </h2>
      <p className="text-gray-700 mb-6">
        Para verificar si ganaste accede a tu cuenta.
      </p>
      <Button
        variant="default"
        size="lg"
        onClick={() => navigate('/auth')}
        className="w-full bg-[#C2185B] hover:bg-[#A01648]"
      >
        ACCEDE A TU CUENTA AQUÍ
      </Button>
    </div>
  );
};
