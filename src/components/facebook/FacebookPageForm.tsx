import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ExternalLink, Check, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface FacebookPageFormProps {
  formData: {
    facebookProfileUrl: string;
    facebookPageUrl: string;
    verifyPageOwnership: boolean;
    verifyProfileOwnership: boolean;
    linkInstagram: boolean;
  };
  submitting: boolean;
  error: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (name: string, checked: boolean) => void;
  onSubmit: () => void;
  invitation_id?: string; // Add this prop to receive the invitation ID
}

export const FacebookPageForm: React.FC<FacebookPageFormProps> = ({
  formData,
  submitting,
  error,
  onInputChange,
  onCheckboxChange,
  onSubmit,
  invitation_id,
}) => {
  const [fixingInfo, setFixingInfo] = useState<{ reason: string; description: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);

  useEffect(() => {
    // Solo fetch fixing info if we have an invitation_id
    if (invitation_id) {
      const fetchFixingInfo = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("invitation_fixing")
            .select("reason, description")
            .eq("invitation_id", invitation_id)
            .eq("is_fixed", false)
            .maybeSingle();
          
          if (error) {
            console.error("Error fetching fixing info:", error);
          } else if (data) {
            setFixingInfo(data);
            
            // Si la razón es "page", marcar automáticamente el checkbox de perfil como true
            if (data.reason === "page") {
              onCheckboxChange("verifyProfileOwnership", true);
            }
            // Si la razón es "profile", marcar automáticamente el checkbox de página como true
            else if (data.reason === "profile") {
              onCheckboxChange("verifyPageOwnership", true);
            }
          }

          // Obtener información de la invitación para prellenar campos
          const { data: invData, error: invError } = await supabase
            .from("creator_invitations")
            .select("facebook_page, facebook_profile")
            .eq("id", invitation_id)
            .single();

          if (invError) {
            console.error("Error fetching invitation data:", invError);
          } else if (invData) {
            setInvitationData(invData);
            
            // Prellenar los campos del formulario si hay datos y los campos están vacíos
            if (invData.facebook_page && !formData.facebookPageUrl) {
              onInputChange({
                target: { name: "facebookPageUrl", value: invData.facebook_page }
              } as React.ChangeEvent<HTMLInputElement>);
            }
            
            if (invData.facebook_profile && !formData.facebookProfileUrl) {
              onInputChange({
                target: { name: "facebookProfileUrl", value: invData.facebook_profile }
              } as React.ChangeEvent<HTMLInputElement>);
            }
            
            // Marcar el checkbox de Instagram como true si es una edición
            onCheckboxChange("linkInstagram", true);
          }
        } catch (err) {
          console.error("Error in fetchFixingInfo:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchFixingInfo();
    }
  }, [invitation_id, formData.facebookPageUrl, formData.facebookProfileUrl, onInputChange]);

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
          Connect Your Facebook Accounts
        </h1>
      </div>

      {fixingInfo && fixingInfo.reason === "page" && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <p className="font-semibold mb-1">Your Facebook page information needs to be updated: {fixingInfo.reason}</p>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="flex flex-col space-y-4 gap-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              1. Share your Facebook Page
            </h2>
            <aside className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 text-sm">
              <strong>Attention:</strong> Page name must be 5–30 characters
              long. Only letters, numbers, periods, and underscores are allowed.
            </aside>
            <aside className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 text-sm">
              <strong>Need to create a Facebook page?</strong>
              <a
                href="https://www.facebook.com/business/help/104002523024878"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-500 hover:underline text-sm"
              >
                <span className="inline-flex items-center text-sm">
                  See here how.
                </span>
                <ExternalLink className="h-4 w-4 text-xs ml-[0.5px]" />
              </a>
            </aside>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookPageUrl" className="font-semibold">
              Facebook Business Page URL
            </Label>
            <p className="text-xs text-gray-600 font-semibold">
              <span className="text-gray-600 font-semibold">
                Share your existing FB page or create one and share.
              </span>
            </p>
            <div className="flex items-center">
              <Input
                id="facebookPageUrl"
                name="facebookPageUrl"
                value={formData.facebookPageUrl}
                onChange={onInputChange}
                className="rounded-l-none bg-gray-50 border-0"
                type="url"
                pattern="https://www\.facebook\.com/.*"
                required
                placeholder="https://www.facebook.com/yourpage"
                disabled={fixingInfo?.reason === "profile"}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="verifyPageOwnership"
              className="mt-1 border-2 h-[1.25rem] min-w-[20px] border-purple-300 data-[state=checked]:bg-purple-600"
              checked={formData.verifyPageOwnership}
              onCheckedChange={(checked) =>
                onCheckboxChange("verifyPageOwnership", checked as boolean)
              }
              disabled={fixingInfo?.reason === "profile"}
            />
            <Label
              htmlFor="verifyPageOwnership"
              className="text-sm font-semibold"
            >
              I verify that I own this page.
            </Label>
          </div>

          <hr className="my-8 border-[2px] rounded-lg" />

          <div className="space-y-2">
            <Label htmlFor="facebookProfileUrl" className="font-semibold">
              Facebook Personal Profile URL
            </Label>
            <p className="text-xs text-gray-600 font-semibold">
              <span className="text-gray-500 font-normal">
                This is your personal and unique profile and is NOT the same as
                your page.
              </span>
            </p>
            <p className="text-xs text-gray-600 font-semibold">
              <span className="text-gray-500 font-normal">
                If you need to understand the difference{" "}
              </span>
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
                className="rounded-l-none bg-gray-50 border-0"
                type="url"
                pattern="https://www\.facebook\.com/.*"
                required
                placeholder="https://facebook.com/profile.php?id=..."
                disabled={fixingInfo?.reason === "page"}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="verifyProfileOwnership"
              className="mt-1 border-2 h-[1.25rem] min-w-[20px] border-purple-300 data-[state=checked]:bg-purple-600"
              checked={formData.verifyProfileOwnership}
              onCheckedChange={(checked) =>
                onCheckboxChange("verifyProfileOwnership", checked as boolean)
              }
              disabled={fixingInfo?.reason === "page"}
            />
            <Label htmlFor="verifyProfileOwnership" className="text-sm font-semibold">
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
            <span className="text-xs">Learn how to link your Instagram account to your Facebook Page</span>
            <ExternalLink className="h-4 w-4 ml-1 text-xs" />
          </a>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="linkInstagram"
              className="mt-1 border-2 h-[1.25rem] min-w-[20px] border-purple-300 data-[state=checked]:bg-purple-600"
              checked={formData.linkInstagram}
              onCheckedChange={(checked) =>
                onCheckboxChange("linkInstagram", checked as boolean)
              }
              disabled={!!invitation_id}
            />
            <Label htmlFor="linkInstagram" className="text-sm font-semibold">
              I've linked my Instagram professional account and my Facebook Page
            </Label>
          </div>
        </div>

        
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className="w-fit h-12 bg-[linear-gradient(to_right,_#4776E6_0%,_#8E54E9_100%)] hover:opacity-90 text-white font-medium rounded-full shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {submitting ? "Submitting..." : "Submit my application"}
        </Button>
      </div>
    </div>
  );
};
