
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CreatorInvitation } from "@/types/invitation";

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
  isSubmitting: boolean;
}

export function WelcomeForm({
  invitation,
  formData,
  onInputChange,
  onCheckboxChange,
  onContinue,
  isSubmitting,
}: WelcomeFormProps) {
  return (
    <div className="space-y-6">
      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="fullName"
            value={formData.fullName.split(" ")[0] || ""}
            onChange={onInputChange}
            placeholder="Your first name"
            className="bg-gray-50 border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.fullName.split(" ").slice(1).join(" ") || ""}
            onChange={onInputChange}
            placeholder="Your last name"
            className="bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagram">Instagram URL</Label>
        <div className="flex">
          <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md">
            instagram.com/
          </span>
          <Input
            id="instagram"
            name="socialMediaHandle"
            value={formData.socialMediaHandle}
            onChange={onInputChange}
            placeholder="yourusername"
            className="rounded-l-none bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {/* Eligibility Requirements - Purple Background */}
      <div className="bg-purple-50 p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">Eligibility Requirements</h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="us-resident" 
              className="mt-1 border-purple-300 data-[state=checked]:bg-purple-600"
            />
            <label htmlFor="us-resident" className="text-sm text-gray-700 leading-relaxed">
              I confirm that I am a resident of the United States
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox 
              id="age-18" 
              className="mt-1 border-purple-300 data-[state=checked]:bg-purple-600"
            />
            <label htmlFor="age-18" className="text-sm text-gray-700 leading-relaxed">
              I confirm that I am 18 years of age or older
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox 
              id="no-previous-meta" 
              className="mt-1 border-purple-300 data-[state=checked]:bg-purple-600"
            />
            <label htmlFor="no-previous-meta" className="text-sm text-gray-700 leading-relaxed">
              I confirm that I have not previously participated in a Meta program or monetized with Facebook
            </label>
          </div>
        </div>
      </div>

      {/* Updated Button with Gradient and Rounded Style */}
      <Button
        onClick={onContinue}
        disabled={!formData.termsAccepted || isSubmitting}
        className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-full shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSubmitting ? "Processing..." : "Next: Facebook Setup →"}
      </Button>

      {/* Terms */}
      <div className="text-center text-sm text-gray-500">
        By applying, you agree to our{" "}
        <a href="#" className="text-purple-600 hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-purple-600 hover:underline">
          Privacy Policy
        </a>
      </div>
    </div>
  );
}
