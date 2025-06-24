
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Alert,
  AlertDescription 
} from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";

interface PasswordRecoveryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function PasswordRecoveryDialog({ isOpen, onOpenChange }: PasswordRecoveryDialogProps) {
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  async function handlePasswordRecovery() {
    if (!recoveryEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setRecoveryLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', recoveryEmail)
        .single();
      
      if (profileError) {
        console.error("Profile error:", profileError);
      }
      
      if (!profileData || profileData.role === 'creator') {
        const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
          redirectTo: window.location.origin + '/auth',
        });
        
        if (error) throw error;
        setRecoverySuccess(true);
      } else {
        setRecoverySuccess(true);
      }
    } catch (error: any) {
      console.error("Recovery error:", error);
      toast.error("Error sending recovery email. Please try again.");
    } finally {
      setRecoveryLoading(false);
    }
  }

  function closeRecoveryDialog() {
    onOpenChange(false);
    setRecoveryEmail("");
    setRecoverySuccess(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Password Recovery</DialogTitle>
          <DialogDescription>
            Enter your email address to receive a password reset link.
          </DialogDescription>
        </DialogHeader>
        
        {recoverySuccess ? (
          <Alert className="mt-4">
            <AlertDescription>
              If an account exists with this email address, you will receive password reset instructions shortly.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4 py-4">
            <Input
              type="email"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              placeholder="Email address"
              disabled={recoveryLoading}
            />
          </div>
        )}
        
        <DialogFooter>
          {recoverySuccess ? (
            <Button onClick={closeRecoveryDialog}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={closeRecoveryDialog}>
                Cancel
              </Button>
              <Button 
                onClick={handlePasswordRecovery} 
                disabled={recoveryLoading || !recoveryEmail}
              >
                {recoveryLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
