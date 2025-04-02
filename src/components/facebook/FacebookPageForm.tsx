
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ExternalLink, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateFacebookPageUrl } from "@/utils/validationUtils";

interface FacebookPageFormProps {
  formData: {
    facebookPageUrl: string;
    verifyOwnership: boolean;
    linkInstagram: boolean;
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
  onSubmit
}) => {
  const { isValid, errorMessage } = validateFacebookPageUrl(formData.facebookPageUrl);
  const isSubmitDisabled = submitting || !formData.facebookPageUrl.trim() || !formData.verifyOwnership || !isValid;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Facebook Page Creation & Instagram Linking</h1>
        <div className="flex items-center text-red-500 mt-2">
          
          <p className="text-gray-500 font-medium">Important: Set Up Your Facebook Page!</p>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">1. Share your Facebook Page</h2>
          <a 
            href="https://www.facebook.com/business/help/104002523024878" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center text-blue-500 hover:underline"
          >
            <span className="mr-2 inline-flex items-center">
              
              Watch How
            </span>
            <ExternalLink className="h-4 w-4" />
          </a>
          
          <div className="space-y-2">
            <Label htmlFor="facebookPageUrl">Facebook Page URL</Label>
            <div className="flex items-center">
              <Input
                id="facebookPageUrl"
                name="facebookPageUrl"
                value={formData.facebookPageUrl}
                onChange={onInputChange}
                className="rounded-l-none"
                placeholder="https://www.facebook.com/yourpage"
              />
            </div>
            {errorMessage && (
              <p className="text-sm font-semibold text-gray-700 mt-1">{errorMessage}</p>
            )}
            <p className="text-xs text-gray-500">
              Page name must be 5-30 characters long. Only letters, numbers, periods, and underscores are allowed.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verifyOwnership"
              checked={formData.verifyOwnership}
              onCheckedChange={(checked) => 
                onCheckboxChange("verifyOwnership", checked as boolean)
              }
            />
            <Label htmlFor="verifyOwnership" className="text-sm">
              I verify that this is my Facebook page
            </Label>
          </div>
         
         
        </div>
        
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">2. Link Instagram Professional Account and  Facebook Page:</h2>
          <a 
            href="https://www.facebook.com/help/1148909221857370" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-blue-500 hover:underline"
          >
            <span>Instructions here</span>
            <ExternalLink className="h-4 w-4 ml-1" />
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
        
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 flex items-center">
          <div className="rounded-full bg-green-100 p-1 mr-2">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <span className="text-blue-700">Submit for validation (1-3 business days).</span>
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
