import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import { WelcomeForm } from "@/components/invitation/WelcomeForm";
import { CompleteProfileForm, ProfileFormData } from "@/components/invitation/CompleteProfileForm";
import { InvitationError } from "@/components/invitation/InvitationError";
import { Stepper } from "@/components/ui/stepper";

import { supabase, findInvitationByCode } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";
import { checkExistingTask } from "@/services/tasksService";

const stepList = ["welcome", "completeProfile", "fbcreation"] as const;
type Step = (typeof stepList)[number];

export default function InvitationStepperPage() {
  const { invitation_code } = useParams<{ invitation_code: string }>();

  const [invitation, setInvitation] = useState<CreatorInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    socialMediaHandle: "",
    termsAccepted: false,
  });

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        setLoading(true);
        if (!invitation_code) {
          setError("No invitation code provided");
          return;
        }

        const { data, error } = await findInvitationByCode(invitation_code);
        if (error || !data || data.length === 0) {
          setError("Invalid invitation code or invitation not found");
          return;
        }

        const invitationData = data[0];
        /* if (invitationData.status === "accepted") {
          setError("This invitation has already been accepted");
          return;
        } */

        setInvitation(invitationData);
        setFormData({
          fullName: invitationData.full_name || "",
          email: invitationData.email || "",
          socialMediaHandle: invitationData.social_media_handle || "",
          termsAccepted: false,
        });
      } catch (err) {
        setError("Failed to fetch invitation details");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [invitation_code]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, termsAccepted: checked }));
  };

  const goToNextStep = () => {
    const currentIndex = stepList.indexOf(currentStep);
    const next = stepList[currentIndex + 1];
    if (next) setCurrentStep(next);
  };

  const handleContinueWelcome = async () => {
    try {
      /* if (!invitation) return;
      setIsSubmitting(true);

      const hasExistingTask = await checkExistingTask(null, invitation.id);
      if (hasExistingTask) {
        toast.error("This invitation has already been processed");
        return;
      }

      const { error } = await supabase
        .from("creator_invitations")
        .update({
          status: "accepted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitation.id);

      if (error) {
        toast.error("Failed to accept invitation");
        return;
      }
 */
      toast.success("Invitation accepted successfully");
      goToNextStep();
    } catch (err) {
      toast.error("An error occurred while processing your request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteProfileSubmit = async (formData: ProfileFormData) => {
    if (!invitation) return;

    try {
      setSaving(true);

      const updateData = {
        youtube_channel: formData.youtubeChannel || null,
        instagram_user: formData.instagramUser || null,
        phone_country_code: formData.phoneCountryCode || null,
        phone_number: formData.phoneNumber || null,
        phone_verified: formData.phoneVerified,
      };

      console.log(
        "CompleteProfilePage - Updating invitation with additional data:",
        updateData
      );

      const { error } = await supabase
        .from("creator_invitations")
        .update(updateData)
        .eq("id", invitation.id);

      if (error) {
        console.error("Error updating invitation:", error);
        toast.error(
          "Failed to save your profile information. Please try again."
        );
        setSaving(false);
        return;
      }

      toast.success("Profile information saved successfully!");

      goToNextStep()
    } catch (err) {
      console.error("Error submitting profile data:", err);
      toast.error("An unexpected error occurred. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">Loading...</CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return <InvitationError message={error || "Invitation not found"} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Stepper steps={stepList} currentStep={currentStep} />

          {currentStep === "welcome" && (
            <WelcomeForm
              invitation={invitation}
              formData={formData}
              onInputChange={handleInputChange}
              onCheckboxChange={handleCheckboxChange}
              onContinue={handleContinueWelcome}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === "completeProfile" && (
            <CompleteProfileForm
              onSubmit={handleCompleteProfileSubmit}
              isSubmitting={saving}
              invitationId={invitation.id}
            />
          )}

          {currentStep === "fbcreation" && <>test 2</>}
        </CardContent>
      </Card>
    </div>
  );
}
