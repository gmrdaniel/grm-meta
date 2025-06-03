import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createProfile } from "@/services/profile-content-categories/creatorProfileService";
import { fetchCountries } from "@/services/project/countryService";
import { toast } from "sonner";
import { CreatorInvitation } from "@/types/invitation";
import { CompleteProfileFormYtb } from "./CompleteProfileFormYtb";
import { TermsAndConditions } from "@/components/terms-and-conditions/TermsAndConditions";
import { goToNextStep } from "@/utils/goToNextStep";
import { useInvitationLoader } from "@/hooks/use-invitationLoader";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  instagramUser: string;
  termsAccepted: boolean;
  phoneNumber: string;
  phoneCountryCode: string;
  countryOfResidenceId: string;
}

interface Step {
  id: string;
  title: string;
  component: React.ComponentType<any>;
}

const stepList: readonly Step[] = [
  {
    id: "terms",
    title: "Terms & Conditions",
    component: TermsAndConditions,
  },
  {
    id: "profile",
    title: "Complete Profile",
    component: CompleteProfileFormYtb,
  },
];

const defaultFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  instagramUser: "",
  termsAccepted: false,
  phoneNumber: "",
  phoneCountryCode: "",
  countryOfResidenceId: "",
};

const WelcomFormYouTube = () => {
  const { invitation_code } = useParams<{ invitation_code: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [invitation, setInvitation] = useState<CreatorInvitation | null>(null);
  const [projectStages, setProjectStages] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(stepList[0]);

  const { loading, error } = useInvitationLoader({
    invitation_code,
    setFormData,
    setInvitation,
    setProjectStages,
    setCurrentStep,
    stepList,
  });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, termsAccepted: e.target.checked });
  };

  const handleAcceptTerms = () => {
    if (!formData.termsAccepted) {
      toast.error("Please accept the terms and conditions.");
      return;
    }

    goToNextStep({
      currentStep,
      stepList,
      projectStages,
      invitation,
      setCurrentStep,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {currentStep.id === "terms" && (
        <TermsAndConditions
          formData={{ termsAccepted: formData.termsAccepted }}
          onCheckboxChange={handleCheckboxChange}
          onAcceptTerms={handleAcceptTerms}
          formType="meta"
        />
      )}
    </div>
  );
};

export default WelcomFormYouTube;
