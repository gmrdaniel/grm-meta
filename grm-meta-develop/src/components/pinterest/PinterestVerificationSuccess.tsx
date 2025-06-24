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
    <CardContent className="space-y-6 text-center py-12">
      <h2 className="text-3xl font-bold bg-clip-text mb-6">
        ¡YA VERIFICAMOS TU CUENTA!
      </h2>
      <p className="text-gray-700 text-lg leading-relaxed mb-8">
        Ya puedes acceder a tu cuenta, donde recibirás la invitación a eventos exclusivos de Pinterest, acceder a recursos diseñados para ayudarte a crecer más rápido como creador de contenido, oportunidades comerciales ¡Y más!
      </p>
      <Button
        onClick={handleRedirect}
        className="text-white text-lg py-6 h-auto"
      >
        ACCEDE A TU CUENTA AQUÍ
      </Button>
    </CardContent>
  );
};
