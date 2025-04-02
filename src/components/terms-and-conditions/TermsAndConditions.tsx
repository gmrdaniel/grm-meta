import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
  import { Checkbox } from "@/components/ui/checkbox"
  
  export function TermsCheckbox({
    formData,
    onCheckboxChange,
  }: {
    formData: { termsAccepted: boolean }
    onCheckboxChange: (checked: boolean) => void
  }) {
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
          I accept the{" "}
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-blue-600 hover:underline p-0 m-0 bg-transparent inline underline"
              >
                terms and conditions
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Terms & Conditions</DialogTitle>
              </DialogHeader>
              <ul className="text-sm space-y-3 pt-2 list-disc list-inside">
                <li>
                  Payments & Bonuses provided by Meta (Facebook); Global Media Review Inc. is not liable for Meta’s changes or missing payments.
                </li>
                <li>
                  You consent to us contacting you, storing, and sharing your data with trusted third parties for creator opportunities.
                </li>
                <li>
                  Content responsibility: provided tools & tips are suggestions only. Content legality is your sole responsibility.
                </li>
              </ul>
            </DialogContent>
          </Dialog>
        </label>
      </div>
    )
  }
  