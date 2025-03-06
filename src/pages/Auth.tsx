import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
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
  const { session, loading } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  useEffect(() => {
    if (session && !loading) {
      console.log("User already logged in, redirecting");
      const checkUserRole = async () => {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user?.id)
            .single();
          
          if (profileError) {
            console.error("Profile error:", profileError);
            throw profileError;
          }
          
          console.log("Profile data:", profileData);

          if (profileData.role === 'creator') {
            navigate('/creator/dashboard');
          } else if (profileData.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            console.error("Invalid role:", profileData.role);
          }
        } catch (error) {
          console.error("Error checking user role:", error);
        }
      };
      
      checkUserRole();
    }
  }, [session, loading, navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthLoading(true);
    
    try {
      if (isLogin) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (authError) throw authError;
        console.log("Auth successful:", authData);

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

          if (count && count > 0) {
            navigate('/creator/pending-services');
          } else {
            navigate('/creator/dashboard');
          }
        } else if (profileData.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
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
      setAuthLoading(false);
    }
  }

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
    setIsRecoveryOpen(false);
    setRecoveryEmail("");
    setRecoverySuccess(false);
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex justify-center mt-4">
        <img
          src="/lovable-uploads/9e1be316-e2d0-4ebe-863a-e7062b2e9a78.png"
          alt="LA NETA Logo"
          className="h-20 w-auto object-contain"
        />
      </div>

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
                disabled={authLoading}
              >
                {authLoading ? "Loading..." : (isLogin ? "Sign in" : "Sign up")}
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

      <div className="py-4 text-center text-gray-500 text-sm">
        © 2025 LA NETA from Global Media Review
      </div>

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
