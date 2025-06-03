
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createProfile } from "@/services/profile-content-categories/creatorProfileService";
import { fetchCountries } from "@/services/project/countryService";
import { toast } from "sonner";
import { CreatorInvitation } from "@/types/invitation";
import { CompleteProfileFormYtb } from "./CompleteProfileFormYtb";
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
    component: () => <div>Terms Component</div>,
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

const WelcomeFormYoutube = () => {
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

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, termsAccepted: checked });
  };

  const handleAcceptTerms = async () => {
    if (!formData.termsAccepted) {
      toast.error("Please accept the terms and conditions.");
      return;
    }

    if (!invitation || !projectStages.length) return;
    
    await goToNextStep({
      invitationId: invitation.id,
      projectStages,
      currentStepId: currentStep.id,
      updateStage: (newStage) => {
        const newStep = stepList.find(step => step.id === newStage.slug);
        if (newStep) {
          setCurrentStep(newStep);
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {currentStep.id === "terms" && (
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6">
          <h2 className="text-2xl font-semibold text-center">Terms & Conditions</h2>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => handleCheckboxChange(e.target.checked)}
            />
            <label>I agree to the terms and conditions</label>
          </div>
          <button
            onClick={handleAcceptTerms}
            disabled={!formData.termsAccepted}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
          >
            Accept Terms
          </button>
        </div>
      )}
    </div>
  );
};

export default WelcomeFormYoutube;
export { WelcomeFormYoutube };
