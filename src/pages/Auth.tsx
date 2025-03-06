
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (authError) throw authError;
        console.log("Auth successful:", authData);

        // Get user role from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user?.id)
          .single();
        
        if (profileError) {
          console.error("Profile error:", profileError);
          throw profileError;
        }
        
        console.log("Profile data:", profileData);

        // Si es creator, verificar servicios pendientes
        if (profileData.role === 'creator') {
          const { count, error: servicesError } = await supabase
            .from("creator_services")
            .select("*", { count: 'exact', head: true })
            .eq("profile_id", authData.user?.id)
            .eq("terms_accepted", false)
            .eq("status", "pendiente");

          if (servicesError) {
            console.error("Services error:", servicesError);
            throw servicesError;
          }

          console.log("Pending services count:", count);

          // Redireccionar según si hay servicios pendientes o no
          if (count && count > 0) {
            navigate('/creator/pending-services');
          } else {
            navigate('/creator/dashboard');
          }
        } else if (profileData.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          // Si el rol no es válido, mostrar error
          console.error("Invalid role:", profileData.role);
          throw new Error(`Invalid role: ${profileData.role}`);
        }

      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Check your email for the confirmation link!");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordRecovery() {
    if (!recoveryEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setRecoveryLoading(true);
    try {
      // First check if the email belongs to a creator
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', recoveryEmail)
        .single();
      
      if (profileError) {
        console.error("Profile error:", profileError);
        // If no profile found, we proceed with recovery as we don't want to expose which emails exist
        // But we log for debugging purposes
      }
      
      // Only proceed with recovery if the user is a creator or if profile not found (for security reasons)
      if (!profileData || profileData.role === 'creator') {
        const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
          redirectTo: window.location.origin + '/auth',
        });
        
        if (error) throw error;
        setRecoverySuccess(true);
      } else {
        // If it's not a creator role, show generic message for security
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
    setIsRecoveryOpen(false);
    setRecoveryEmail("");
    setRecoverySuccess(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Logo in the top-right corner */}
      <div className="absolute top-4 right-4">
        <img
          src="/lovable-uploads/9e1be316-e2d0-4ebe-863a-e7062b2e9a78.png"
          alt="LA NETA Logo"
          className="h-24 w-auto object-contain"
        />
      </div>

      {/* Main content */}
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                />
              </div>
              <div>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Loading..." : (isLogin ? "Sign in" : "Sign up")}
              </Button>
            </div>

            <div className="flex flex-col space-y-2 text-center text-sm">
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setIsRecoveryOpen(true)}
                  className="text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-500"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-gray-500 text-sm">
        © 2025 LA NETA from Global Media Review
      </div>

      {/* Password Recovery Dialog */}
      <Dialog open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
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
    </div>
  );
}
