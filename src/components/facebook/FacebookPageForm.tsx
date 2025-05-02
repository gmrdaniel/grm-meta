import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ExternalLink, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FacebookPageFormProps {
  formData: {
    facebookProfileUrl: string
    facebookPageUrl: string
    verifyPageOwnership: boolean
    verifyProfileOwnership: boolean
    linkInstagram: boolean
  };
  submitting: boolean;
  error: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (name: string, checked: boolean) => void;
  onSubmit: () => void;
}

export const FacebookPageForm: React.FC<FacebookPageFormProps> = ({
  formData,
  submitting,
  error,
  onInputChange,
  onCheckboxChange,
  onSubmit,
}) => {
  const isSubmitDisabled =
    submitting ||
    !formData.facebookPageUrl.trim() ||
    !formData.verifyPageOwnership ||
    !formData.facebookProfileUrl.trim() ||
    !formData.verifyProfileOwnership ||
    !formData.linkInstagram;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Complete your Application
        </h1>
        <div className="flex items-center text-red-500 mt-2">
          <p className="text-gray-500 font-medium mt-4">
            <p className="text-gray-600 text-xs ">
              Important: On this step, please share/create a Facebook Page and
              make sure to connect it with your Instagram account to complete
              your application and send it for validation to Meta!{" "}
            </p>
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              1. Share your Facebook Page
            </h2>
            <aside className="text-xs text-yellow-700 bg-amber-50 border border-yellow-300 p-2">
              <strong>Attention:</strong> Page name must be 5–30 characters
              long. Only letters, numbers, periods, and underscores are allowed.
            </aside>
            <a
              href="https://www.facebook.com/business/help/104002523024878"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-500 hover:underline text-sm"
            >
              <span className="inline-flex items-center text-xs">
                Need to create a Facebook page? See here how.
              </span>
              <ExternalLink className="h-4 w-4 text-xs ml-[0.5px]" />
            </a>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookPageUrl" className="font-semibold">Facebook Business Page URL</Label>
            <p className="text-xs text-gray-600 font-semibold">
              <span className="text-gray-600 font-semibold">This is the new page you created</span>
            </p>
            <div className="flex items-center">
              <Input
                id="facebookPageUrl"
                name="facebookPageUrl"
                value={formData.facebookPageUrl}
                onChange={onInputChange}
                className="rounded-l-none"
                type="url"
                pattern="https://www\.facebook\.com/.*"
                required
                placeholder="https://www.facebook.com/yourpage"
              />
            </div>
            <p className="text-xs text-gray-600 font-semibold">
              Example: <span className="text-gray-500 font-normal">https://www.facebook.com/yourpage</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="verifyPageOwnership"
              checked={formData.verifyPageOwnership}
              onCheckedChange={(checked) =>
                onCheckboxChange("verifyPageOwnership", checked as boolean)
              }
            />
            <Label htmlFor="verifyPageOwnership" className="text-sm font-semibold">
              I verify that I own this page.
            </Label>
          </div>

          <hr className="my-8 border-[2px] rounded-lg" />

          <div className="space-y-2">
            <Label htmlFor="facebookProfileUrl" className="font-semibold">
              Facebook Personal Profile URL
            </Label>
            <p className="text-xs text-gray-600 font-semibold">
              <span className="text-gray-500 font-normal">This is your personal and unique profile and is NOT the same as the page.</span>
            </p>
            <p className="text-xs text-gray-600 font-semibold">
              <span className="text-gray-500 font-normal">If you need to understand the difference </span>
              <a
                href="https://www.facebook.com/help/337881706729661/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline items-center text-blue-500 hover:underline text-sm font-normal"
              >
                <span className="inline-flex items-center font-normal text-xs">
                  Please click here
                </span>
                <ExternalLink className="h-4 w-4 inline ml-[0.5px] text-xs" />
              </a>
            </p>
            <div className="flex items-center">
              <Input
                id="facebookProfileUrl"
                name="facebookProfileUrl"
                value={formData.facebookProfileUrl}
                onChange={onInputChange}
                className="rounded-l-none"
                type="url"
                pattern="https://www\.facebook\.com/.*"
                required
                placeholder="https://www.facebook.com/yourprofile"
              />
            </div>
            <p className="text-xs text-gray-600 font-semibold">
              Example: <span className="text-gray-500 font-normal">https://www.facebook.com/yourprofile</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="verifyProfileOwnership"
              checked={formData.verifyProfileOwnership}
              onCheckedChange={(checked) =>
                onCheckboxChange("verifyProfileOwnership", checked as boolean)
              }
            />
            <Label htmlFor="verifyProfileOwnership" className="text-sm">
              This is my own profile
            </Label>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            2. Link Instagram Professional Account and Facebook Page:
          </h2>
          <a
            href="https://www.facebook.com/help/1148909221857370"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-500 hover:underline text-sm"
          >
            <span className="text-xs">Instructions here</span>
            <ExternalLink className="h-4 w-4 ml-1 text-xs ml-[0.5px]" />
          </a>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="linkInstagram"
              checked={formData.linkInstagram}
              onCheckedChange={(checked) =>
                onCheckboxChange("linkInstagram", checked as boolean)
              }
            />
            <Label htmlFor="linkInstagram" className="text-sm">
              I’ve linked my Instagram professional account and my Facebook Page
            </Label>
          </div>
        </div>

        <div className="text-xs bg-blue-50 p-2 border border-blue-100 flex items-center">
          <div className="rounded-full bg-green-100 p-1 mr-2">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <span className="text-blue-700">
            Submit for validation (3-7 business days).
          </span>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className="min-w-[200px]"
        >
          {submitting ? "Submitting..." : "Submit for Validation"}
        </Button>
      </div>
    </div>
  );
};
