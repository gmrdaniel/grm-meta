import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TestEmailDialogProps {
  subject: string;
  message: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestEmailDialog({ subject, message, isOpen, onOpenChange }: TestEmailDialogProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendTestEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("mailjet", {
        body: {
          email,
          subject,
          html: message,
          variables: {}
        },
      });

      if (error) throw error;

      toast.success("Test email sent successfully");
      onOpenChange(false);
    } catch (error) {
console.error("Error sending test email:", error);
toast.error(`Error sending test email: ${error.message || "Unknown error"}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send test email</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="test-email" className="text-right font-medium col-span-1">
              Email
            </label>
            <div className="col-span-3">
              <Input
                id="test-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter an email"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSendTestEmail} 
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}