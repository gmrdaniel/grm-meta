
import React from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

export const PinterestVerificationSuccess = () => {
  return (
    <CardContent className="space-y-6 text-center">
      <h2 className="text-2xl font-bold text-[#C2185B] mb-4">
        ¡YA VERIFICAMOS TU CUENTA, MUCHA SUERTE!
      </h2>
      <p className="text-gray-700 mb-6">
        Ya puedes acceder a tu cuenta, donde recibirás la invitación al evento exclusivo de Pinterest, 
        podrás revisar el estatus de tu participación en el sorteo y acceder a recursos diseñados 
        para ayudarte a crecer más rápido como creador de contenido ¡Y más!
      </p>
      <Button 
        variant="default"
        size="lg"
        className="w-full bg-[#C2185B] hover:bg-[#A01648]"
      >
        ACCEDE A TU CUENTA AQUÍ
      </Button>
    </CardContent>
  );
};
