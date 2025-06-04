import React from "react";
import { WelcomeForm } from "@/components/invitation/WelcomeForm";
import { CompleteProfileForm } from "@/components/invitation/CompleteProfileForm";
import { FacebookPageForm } from "@/components/facebook/FacebookPageForm";
import { SubmissionCompleteScreen } from "@/components/facebook/SubmissionCompleteScreen";

export const TikTokForm = ({
  currentStep,
  invitation,
  formData,
  saving,
  isSubmitting,
  submissionComplete,
  facebookFormData,
  submitting,
  error,
  showPasswordForm,
  passwordData,
  handleInputChange,
  handleCheckboxChange,
  handleContinueWelcome,
  handleCompleteProfileSubmit,
  handleFacebookInputChange,
  handleCheckboxFacebookChange,
  handleFacebookSubmit,
  handlePasswordChange,
  handleSetPassword,
  setShowPasswordForm,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) => {
  return (
    <>
      {currentStep.id === "welcome" && (
        <>
          <div className="text-left mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              Join Meta´s Creator Program through us
            </h2>
            <p className="text-purple-600 font-medium mb-4">
              We're La Neta, an official partner of Meta
            </p>

            {currentStep.id === "welcome" && (
              <div className="space-y-3 text-gray-600">
                <p>Welcome to the Meta Creator Breakthrough Bonus Program.</p>
                <p>
                  Earn up to{" "}
                  <span className="font-semibold">$5,000 in bonuses</span> just
                  by posting Reels on Facebook.
                </p>
                <p>
                  Start monetizing right away + get a free trial of Meta
                  Verified.
                </p>
                <p>
                  Limited spots available for high-potential creators like you.
                </p>
                <p className="mt-4 text-gray-700">
                  Fill out the form below to get started.
                </p>
              </div>
            )}
          </div>
          <WelcomeForm
            formData={formData}
            onInputChange={handleInputChange}
            onContinue={handleContinueWelcome}
            isSubmitting={isSubmitting}
          />
        </>
      )}
      {currentStep.id === "completeProfile" && (
        <>
          <div className="text-left mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              Verify Your Phone Number
            </h2>
            <p className="text-purple-600 font-medium mb-4">
              To continue with your registration, please verify your phone
              number.
            </p>
          </div>
          <CompleteProfileForm
            onSubmit={handleCompleteProfileSubmit}
            isSubmitting={saving}
            invitation={invitation}
          />
        </>
      )}
      {currentStep.id === "fbcreation" &&
        (submissionComplete || invitation.fb_step_completed) && (
          <SubmissionCompleteScreen
            showPasswordForm={showPasswordForm}
            passwordData={passwordData}
            submitting={submitting}
            onPasswordChange={handlePasswordChange}
            onSetPassword={handleSetPassword}
            onShowPasswordForm={() => setShowPasswordForm(true)}
            invitation={invitation}
          />
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
