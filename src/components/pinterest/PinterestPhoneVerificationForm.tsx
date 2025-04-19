
import React, { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { PinterestPhoneForm } from "./PinterestPhoneForm";
import { PinterestPhoneSuccess } from "./PinterestPhoneSuccess";

interface PinterestPhoneVerificationFormProps {
  onSubmit: () => void;
  isSubmitting: boolean;
  invitationId?: string;
}

export const PinterestPhoneVerificationForm: React.FC<PinterestPhoneVerificationFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    setShowSuccess(true);
    onSubmit();
  };

  return (
    <CardContent className="space-y-6">
      {!showSuccess ? (
        <PinterestPhoneForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      ) : (
        <PinterestPhoneSuccess />
      )}
    </CardContent>
  );
};
