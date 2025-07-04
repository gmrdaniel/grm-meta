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
        WE'VE VERIFIED YOUR ACCOUNT!
      </h2>
      <p className="text-gray-700 text-lg leading-relaxed mb-8">
        You can now access your account, where you'll receive invitations to
        exclusive Pinterest events, access resources designed to help you grow
        faster as a content creator, business opportunities, and more!
      </p>
      <Button
        onClick={handleRedirect}
        className="text-white text-lg py-6 h-auto"
      >
        LOG IN TO YOUR ACCOUNT HERE
      </Button>
    </CardContent>
  );
};
