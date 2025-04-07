import React from "react";
import { useNavigate } from "react-router-dom";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CreatorInvitation } from "@/types/invitation";
import { AlertTriangle, Sparkles, Check } from "lucide-react";
import { TermsCheckbox } from "../terms-and-conditions/TermsAndConditions";
import { useState } from "react";

interface WelcomeFormProps {
  invitation: CreatorInvitation;
  formData: {
    fullName: string;
    email: string;
    socialMediaHandle: string;
    termsAccepted: boolean;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (checked: boolean) => void;
  onContinue: () => void;
  isSubmitting?: boolean;
}

export const WelcomeForm: React.FC<WelcomeFormProps> = ({
  invitation,
  formData,
  onInputChange,
  onCheckboxChange,
  onContinue,
  isSubmitting = false,
}) => {
 // Estado para cada checkbox
 const [isUSBased, setIsUSBased] = useState(false);
 const [hasNotMonetized, setHasNotMonetized] = useState(false);
 const [notInOtherProgram, setNotInOtherProgram] = useState(false);

 // Función para verificar si todos los checkboxes están marcados
 const allChecked =
   isUSBased && hasNotMonetized && notInOtherProgram && formData.termsAccepted;

 const handleContinue = () => {
   if (!allChecked) {
     toast.error("You must accept all conditions to continue");
     return;
   }
   onContinue();
 };

 const handleAcceptTerms = () => {
  onCheckboxChange(true); // Marca el checkbox de términos y condiciones
};
  return (
    <>
      <CardContent className="space-y-6">
        {/* Join Meta Creator Program Section (Moved from CardHeader) */}
        <div className="mt-4 border-gray-200 pt-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2 whitespace-normal lg:whitespace-nowrap">
  Join Meta Breakthrough Bonus Program
</h2>
          <p className="text-gray-600 text-sm">
          You've been invited to join this exclusive program. Apply through us and get direct Meta support, tips for content optimization, to earn faster, and more!
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={onInputChange}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              readOnly
              className="bg-gray-50"
              placeholder="your@email.com"
            />
          </div>

          {invitation.social_media_type && (
            <div className="space-y-2">
              <Label htmlFor="socialMediaHandle">
                {invitation.social_media_type === "tiktok"
                  ? "TikTok Username"
                  : "Pinterest Username"}
              </Label>
              <Input
                id="socialMediaHandle"
                name="socialMediaHandle"
                value={formData.socialMediaHandle}
                readOnly
                className="bg-gray-50"
                placeholder={
                  invitation.social_media_type === "tiktok"
                    ? "@username"
                    : "username"
                }
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox id="us-based-checkbox" checked={isUSBased}
              onCheckedChange={(checked) => setIsUSBased(checked === true)} />
            <label
              htmlFor="us-based-checkbox"
              className="text-sm font-medium text-gray-700"
            >
              I’m based in the US and 18 years of age or older
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="not-monetized-checkbox"
              checked={hasNotMonetized}
              onCheckedChange={(checked) => setHasNotMonetized(checked === true)}/>
            <label
              htmlFor="not-monetized-checkbox"
              className="text-sm font-medium text-gray-700"
            >
              I’ve never monetize on Facebook before
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox  id="not-other-program-checkbox"
              checked={notInOtherProgram}
              onCheckedChange={(checked) => setNotInOtherProgram(checked === true)} />
            <label
              htmlFor="not-other-program-checkbox"
              className="text-sm font-medium text-gray-700 break-words sm:whitespace-nowrap"
            >
              I’m not participating in any other Facebook monetization program
            </label>
          </div>

          <TermsCheckbox
            formData={formData}
            onCheckboxChange={onCheckboxChange}
            onAcceptTerms={handleAcceptTerms}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
      <Button onClick={handleContinue} disabled={!allChecked || isSubmitting}>
          {isSubmitting ? "Processing..." : "Continue"}
        </Button> 
      </CardFooter>
    </>
  );
};
