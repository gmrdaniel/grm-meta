
import React from "react";
import { CardContent } from "@/components/ui/card";
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
  // Skip verification since it's not needed anymore
  onSubmit();
  
  return <PinterestVerificationSuccess />;
};
