import React from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const PinterestVerificationSuccess = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/"); // Redirige a la raíz
  };

  return (
    <CardContent className="space-y-6 text-center px-8 py-12">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-6">
        ¡YA VERIFICAMOS TU CUENTA, MUCHA SUERTE!
      </h2>
      <p className="text-gray-700 text-lg leading-relaxed mb-8">
        Ya puedes acceder a tu cuenta, donde recibirás la invitación al evento
        exclusivo de Pinterest, podrás revisar el estatus de tu participación en
        el sorteo y acceder a recursos diseñados para ayudarte a crecer más
        rápido como creador de contenido ¡Y más!
      </p>
      <Button
        onClick={handleRedirect}
        className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-lg py-6 h-auto"
      >
        ACCEDE A TU CUENTA AQUÍ
      </Button>
    </CardContent>
  );
};
