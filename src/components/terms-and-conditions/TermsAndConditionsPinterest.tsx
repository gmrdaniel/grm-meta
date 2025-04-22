import { useState } from "react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export function TermsCheckboxPinterest({
  formData,
  onCheckboxChange,
  onAcceptTerms,
}: {
  formData: { termsAccepted: boolean };
  onCheckboxChange: (checked: boolean) => void;
  onAcceptTerms: () => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <div className="flex items-start space-x-2 pt-4">
      <Checkbox
        id="termsAccepted"
        checked={formData.termsAccepted}
        onCheckedChange={onCheckboxChange}
      />
      <label
        htmlFor="termsAccepted"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Acepto los{" "}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="text-pink-600 hover:underline p-0 m-0 bg-transparent inline underline"
            >
              términos y condiciones
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Terms & Conditions</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-96 text-sm space-y-4 pt-2 pr-2">
              <p>Please review and accept the terms below to continue:</p>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <strong>Monetization Program & Benefits Disclaimer</strong>

                  <p className="mt-2 text-justify">
                    By participating in this onboarding process, you acknowledge
                    that monetization opportunities, payments, and benefits,
                    including Breakthrough Bonuses and Meta Verified, are
                    provided directly by Meta (Facebook/Instagram). Any related
                    program benefits, payment details, timelines, and terms of
                    participation are subject to change by Meta at any time.
                  </p>
                  <p className="mt-2 text-justify">
                    Global Media Review Inc. (our agency) is not responsible for
                    any changes, adjustments, missing payments, or modifications
                    in program terms made by Meta. Meta reserves the right to
                    change or discontinue benefits without prior notice. We (the
                    agency) assume no responsibility or liability for the
                    payments, benefits, or decisions made by Meta.
                  </p>
                </li>
                <li>
                  <strong>Consent for Communication & Data Usage</strong>
                  <p className="mt-2 text-justify">
                    By completing this onboarding form, you explicitly authorize
                    and grant us (the agency) permission to contact you directly
                    via:
                  </p>
                  <ul className="list-disc list-inside pl-4 mt-4">
                    <li>Email</li>
                    <li>SMS/Text Messages</li>
                    <li>WhatsApp</li>
                    <li>
                      Direct Messages (Instagram, Messenger, or similar
                      channels)
                    </li>
                  </ul>
                  <p className="mt-4 text-justify">
                    to share creator-related opportunities, updates,
                    collaboration proposals, and promotional materials. You also
                    explicitly consent to our storage, processing, and use of
                    your provided personal and professional data, including but
                    not limited to:
                  </p>
                  <ul className="list-disc list-inside pl-4 mt-4">
                    <li>Fisrt Name</li>
                    <li>Email Address</li>
                    <li>Phone Number</li>
                    <li>
                      Social Media Usernames (Instagram, Facebook, TikTok,
                      YouTube, and others provided)
                    </li>
                    <li>
                      Audience Metrics, engagement rate, and follower counts
                    </li>
                  </ul>
                  <p className="mt-2 text-justify">
                    You further authorize us to share your provided information
                    with trusted third-party partners and brands for the purpose
                    of facilitating creator partnerships, marketing
                    opportunities, or similar commercial engagements.
                  </p>
                </li>
                <li>
                  <strong>Content Rights, Tips & Resources Disclaimer</strong>
                  <p className="mt-2 text-justify">
                    All content you create and submit to platforms (including
                    Facebook and Instagram) is your sole responsibility. You
                    must ensure:
                  </p>
                  <ul className="list-disc list-inside pl-4 mt-4">
                    <li>
                      You own or possess appropriate rights and clearances for
                      all content posted.
                    </li>
                    <li className="mt-2 text-justify">
                      The provided creator tips, resources, and tools are for
                      guidance purposes only and do not guarantee audience
                      growth or monetization results.
                    </li>
                  </ul>
                  <p className="mt-4 text-justify">
                    We (the agency) explicitly disclaim liability for any
                    claims, disputes, copyright infringement, or legal
                    consequences related to your content.
                  </p>
                </li>
                <li>
                  <strong>Modification & Termination Rights</strong>
                  <p className="mt-2">We reserve the right to:</p>
                  <ul className="list-disc list-inside pl-4 mt-4">
                    <li>
                      Modify, suspend, or terminate this onboarding process at
                      our sole discretion.
                    </li>
                    <li className="mt-2">
                      Update or modify eligibility criteria, terms, and
                      conditions, or any aspect of the onboarding process by
                      providing notice via email or SMS.
                    </li>
                  </ul>
                </li>
              </ol>
              <p className="text-justify">
                <strong>Your Agreement</strong>
                <br />
                By clicking "Complete My Onboarding", you acknowledge and agree
                to these terms in their entirety.
              </p>

              <p className="text-justify">
                <div className="flex justify-center">
                  <button
                    className="text-blue-800 hover:font-semibold mt-4"
                    onClick={() => {
                      setIsDialogOpen(false);
                      onAcceptTerms(); // Llama al callback para marcar el checkbox
                    }}
                  >
                    Accept Terms & Complete My Onboarding
                  </button>
                </div>
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </label>
    </div>
  );
}
