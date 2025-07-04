import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export function TermsCheckbox({
  formData,
  onCheckboxChange,
  onAcceptTerms,
  formType, // Nueva prop para identificar el formulario
}: {
  formData: { termsAccepted: boolean };
  onCheckboxChange: (checked: boolean) => void;
  onAcceptTerms: () => void;
  formType: "pinterest" | "meta"; // Define los posibles tipos de formulario
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const renderTermsContent = () => {
    if (formType === "pinterest") {
      return (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contest Terms and Conditions</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-96 text-sm space-y-4 pt-2 pr-2">
            <p>
              <strong>1. Organizer</strong>
              <br />
              This contest is organized by La Neta, in collaboration with
              Pinterest, aiming to attract new content creators in Hispanic
              LATAM (Mexico, Colombia, Argentina, Chile, and Peru).
            </p>
            <p>
              <strong>2. Participation</strong>
              <br />
              Only individuals who meet the following requirements may
              participate in this contest:
            </p>
            <ul className="list-disc list-inside pl-4">
              <li>Be of legal age in their country of residence.</li>
              <li>
                Have an active Instagram account with content related to one or
                more of the following categories: decoration, weddings, recipes,
                fashion, beauty, lifestyle, travel, and wellness.
              </li>
              <li>
                Have never had a Pinterest account before nor collaborated with
                Pinterest in the past.
              </li>
              <li>Create a new Pinterest account.</li>
              <li>Connect their Instagram account with Pinterest.</li>
              <li>
                Accept the autopublish function for content from the last 90
                days from Instagram to Pinterest.
              </li>
              <li>Attend the official webinar organized by Pinterest.</li>
            </ul>
            <p>
              <strong>3. Validity</strong>
              <br />
              The participation period ends on May 15th. Only registrations
              completed during this period will be considered.
            </p>
            <p>
              <strong>4. Prizes</strong>
              <br />
              The prizes are as follows:
            </p>
            <ul className="list-disc list-inside pl-4">
              <li>
                1 (one) winner will receive a $1,000 USD Amazon gift card.
              </li>
              <li>
                10 (ten) additional participants will receive $100 USD Amazon
                gift cards each.
              </li>
            </ul>
            <p>
              Prizes are non-transferable, cannot be exchanged for cash, nor
              substituted for any other benefit.
            </p>
            <p>
              <strong>5. Winner Selection</strong>
              <br />
              Winners will be randomly selected among all participants who have
              correctly completed all the program steps. Winners will be
              notified via email and have 5 business days to accept their prize.
              If no response is received, a new winner will be selected.
            </p>
            <p>
              <strong>6. Liability</strong>
              <br />
              Participation in this contest implies acceptance of these terms
              and conditions. La Neta and Pinterest are not responsible for
              technical failures, service interruptions, or issues beyond the
              organizers' control.
            </p>
            <p>
              <strong>7. Data Protection</strong>
              <br />
              Information provided by participants will be used solely for
              participation validation and winner contact. It will be handled in
              accordance with La Neta's privacy policy.
            </p>
            <p>
              <strong>8. Acceptance</strong>
              <br />
              By participating in this contest, users fully accept these Terms
              and Conditions.
            </p>
            <p>
              <strong>9. Consent for Data Usage</strong>
              <br />
              By participating in this program, the user expressly consents and
              authorizes La Neta, in collaboration with Pinterest, to collect
              and use the data provided in the registration form, as well as
              data derived from their activity on the Pinterest platform, for
              analysis, tracking, and program optimization purposes. This
              includes, but is not limited to: name, email, linked Instagram
              account, created Pinterest account, shared content statistics, and
              behavior within Pinterest.
            </p>
            <p>
              This information will be treated confidentially and used
              exclusively to improve the participant experience, verify
              compliance with program requirements, and design future
              initiatives for content creators. Under no circumstances will it
              be sold or shared with third parties outside the program.
            </p>
            <div className="flex justify-center">
              <button
                className="text-blue-800 hover:font-semibold mt-4"
                onClick={() => {
                  setIsDialogOpen(false);
                  onAcceptTerms(); // Calls callback to check the checkbox
                }}
              >
                Accept terms and conditions
              </button>
            </div>
          </div>
        </DialogContent>
      );
    } else {
      return (
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
                  including Breakthrough Bonuses and Meta Verified, are provided
                  directly by Meta (Facebook/Instagram). Any related program
                  benefits, payment details, timelines, and terms of
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
                    Direct Messages (Instagram, Messenger, or similar channels)
                  </li>
                </ul>
                <p className="mt-4 text-justify">
                  to share creator-related opportunities, updates, collaboration
                  proposals, and promotional materials. You also explicitly
                  consent to our storage, processing, and use of your provided
                  personal and professional data, including but not limited to:
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
                  of facilitating creator partnerships, marketing opportunities,
                  or similar commercial engagements.
                </p>
              </li>
              <li>
                <strong>Content Rights, Tips & Resources Disclaimer</strong>
                <p className="mt-2 text-justify">
                  All content you create and submit to platforms (including
                  Facebook and Instagram) is your sole responsibility. You must
                  ensure:
                </p>
                <ul className="list-disc list-inside pl-4 mt-4">
                  <li>
                    You own or possess appropriate rights and clearances for all
                    content posted.
                  </li>
                  <li className="mt-2 text-justify">
                    The provided creator tips, resources, and tools are for
                    guidance purposes only and do not guarantee audience growth
                    or monetization results.
                  </li>
                </ul>
                <p className="mt-4 text-justify">
                  We (the agency) explicitly disclaim liability for any claims,
                  disputes, copyright infringement, or legal consequences
                  related to your content.
                </p>
              </li>
              <li>
                <strong>Modification & Termination Rights</strong>
                <p className="mt-2">We reserve the right to:</p>
                <ul className="list-disc list-inside pl-4 mt-4">
                  <li>
                    Modify, suspend, or terminate this onboarding process at our
                    sole discretion.
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
              By clicking "Complete My Onboarding", you acknowledge and agree to
              these terms in their entirety.
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
      );
    }
  };

  const termsText =
    formType === "pinterest"
      ? "términos y condiciones"
      : "terms and conditions";
  const termsColor =
    formType === "pinterest" ? "text-blue-600" : "text-blue-600";

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
        {formType === "pinterest" ? "Acepto los " : "I accept the "}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={`${termsColor} hover:underline p-0 m-0 bg-transparent inline underline`}
            >
              {termsText}
            </button>
          </DialogTrigger>
          {renderTermsContent()}
        </Dialog>
      </label>
    </div>
  );
}
