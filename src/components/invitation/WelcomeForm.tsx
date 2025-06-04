import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MetaTermsAndConditions } from "../terms-and-conditions/MetaTermsAndconditions";

interface WelcomeFormProps {
  readonly formData: {
    firstName: string;
    lastName: string;
    email: string;
    instagramUser: string;
    isUsResident: boolean;
    isOver18: boolean;
    isNewToMeta: boolean;
  };
  readonly onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onContinue: () => void;
  readonly isSubmitting: boolean;
}

export function WelcomeForm({
  formData,
  onInputChange,
  onContinue,
  isSubmitting,
}: WelcomeFormProps) {
  const [isUsResident, setIsUsResident] = React.useState(false);
  const [isOver18, setIsOver18] = React.useState(false);
  const [isNewToMeta, setIsNewToMeta] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={onInputChange}
            placeholder="Your first name"
            className="bg-gray-50 border-0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={onInputChange}
            placeholder="Your last name"
            className="bg-gray-50 border-0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagram">Instagram username</Label>
        <div className="flex">
          <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-0 rounded-l-md">
            @
          </span>
          <Input
            id="instagram"
            name="instagramUser"
            value={formData.instagramUser}
            onChange={onInputChange}
            placeholder="yourusername"
            className="rounded-l-none bg-gray-50 border-0"
          />
        </div>
        <p className="text-xs text-gray-500">
          Must be 5–30 characters long. Only letters, numbers, periods, and
          underscores are allowed. Do not include @ or links.
        </p>
      </div>

      {/* Eligibility Requirements - Purple Background */}
      <div className="bg-purple-50 p-6 rounded-lg space-y-4">
        <h3 className="font-semibold text-purple-800 mb-4">
          Eligibility Requirements
        </h3>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="us-resident"
              checked={isUsResident}
              onCheckedChange={(checked) => setIsUsResident(!!checked)}
              className="mt-1 border-2 h-[1.25rem] min-w-[20px] border-purple-300 data-[state=checked]:bg-purple-600"
            />
            <label
              htmlFor="us-resident"
              className="text-gray-700 leading-relaxed"
            >
              I confirm that I am a resident of the United States
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="age-18"
              checked={isOver18}
              onCheckedChange={(checked) => setIsOver18(!!checked)}
              className="mt-1 border-2 h-[1.25rem] min-w-[20px] border-purple-300 data-[state=checked]:bg-purple-600"
            />
            <label htmlFor="age-18" className="text-gray-700 leading-relaxed">
              I confirm that I am 18 years of age or older
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="no-previous-meta"
              checked={isNewToMeta}
              onCheckedChange={(checked) => setIsNewToMeta(!!checked)}
              className="mt-1 border-2 h-[1.25rem] min-w-[20px] border-purple-300 data-[state=checked]:bg-purple-600"
            />
            <label
              htmlFor="no-previous-meta"
              className="text-gray-700 leading-relaxed"
            >
              I confirm that I have not previously participated in a Meta
              program or monetized with Facebook
            </label>
          </div>
        </div>
      </div>
      <div className="text-center">
        {/* Updated Button with Gradient and Rounded Style */}
        <Button
          onClick={onContinue}
          disabled={!formData.instagramUser.trim() || !isUsResident || !isOver18 || !isNewToMeta || isSubmitting}
          className="w-fit h-12 bg-[linear-gradient(to_right,_#4776E6_0%,_#8E54E9_100%)] hover:opacity-90 text-white font-medium rounded-full shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? "Processing..." : "Next: Facebook Setup →"}
        </Button>
      </div>

      {/* Terms */}
      <div className="flex items-center text-center text-sm text-gray-500 flex-wrap">
        By applying, you agree to our&nbsp;
        <MetaTermsAndConditions />
        &nbsp;and&nbsp;
        <a
          href="https://www.laneta.com/vidcon-pass-giveaway"
          target="_blanck"
          className="text-purple-600 hover:underline"
        >
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
