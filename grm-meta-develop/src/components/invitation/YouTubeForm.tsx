import React from "react";
import { WelcomeFormYoutube } from "@/components/invitation/WelcomFormYouTube";
import { CompleteProfileFormYtb } from "@/components/invitation/CompleteProfileFormYtb";
import { FacebookPageForm } from "@/components/facebook/FacebookPageForm";
import { SubmissionCompleteScreen } from "@/components/facebook/SubmissionCompleteScreen";

export const YouTubeForm = ({
  currentStep,
  invitation,
  formData,
  saving,
  isSubmitting,
  submissionComplete,
  facebookFormData,
  submitting,
  error,
  handleInputChange,
  handleCheckboxChange,
  handleContinueWelcome,
  handleCompleteProfileYtbSubmit,
  handleFacebookInputChange,
  handleCheckboxFacebookChange,
  handleFacebookSubmit,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) => {
  return (
    <>
      {currentStep.id === "welcome" && (
        <WelcomeFormYoutube
          invitation={invitation}
          formData={formData}
          onInputChange={handleInputChange}
          onCheckboxChange={handleCheckboxChange}
          onContinue={handleContinueWelcome}
          isSubmitting={isSubmitting}
        />
      )}
      {currentStep.id === "completeProfile" && (
        <CompleteProfileFormYtb
          onSubmit={handleCompleteProfileYtbSubmit}
          isSubmitting={saving}
          invitation={invitation}
        />
      )}
      {currentStep.id === "fbcreation" &&
        (submissionComplete || invitation.fb_step_completed) && (
          <SubmissionCompleteScreen invitation={invitation} />
        )}
      {currentStep.id === "fbcreation" &&
        !submissionComplete &&
        !invitation.fb_step_completed && (
          <FacebookPageForm
            formData={facebookFormData}
            submitting={submitting}
            error={error}
            onInputChange={handleFacebookInputChange}
            onCheckboxChange={handleCheckboxFacebookChange}
            onSubmit={handleFacebookSubmit}
          />
        )}
    </>
  );
};
